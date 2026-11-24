#!/usr/bin/env python3
"""
Build the hero assets from the intro video.

  python3 scripts/build-hero-assets.py \
      --video intro.mp4 \
      [--photo photo.jpg] [--photo-crop X:Y:W:H] \
      [--crop W:H:X:Y] [--loop-seconds 10] [--fade 0.5]

Outputs (relative to the repo root):
  public/hero/hero.mp4          H.264 + AAC, seamless loop
  public/hero/hero.webm         VP9 + Opus, seamless loop
  public/hero/hero-poster.webp  first frame of the loop (shown before playback)
  public/portrait-bust.webp     480x600 head-to-shirt portrait (ID card)
  public/og.jpg                 1200x630 social card

What it does
  1. Finds the person (dark-pixel bounding box over time) and crops a 4:5
     window head-to-toe around them, centred. Pass --crop to override.
  2. Scales to 768 px wide and whitens the off-white backdrop with
     colorlevels so it blends into the page (the site multiplies the video).
  3. Makes the loop seamless: the last --fade seconds are cross-faded into
     the first --fade seconds (ffmpeg xfade for the picture, a sample-accurate
     equal-power cross-fade in numpy for the audio). Nothing is stretched or
     retimed, so lips stay in sync.
  4. Encodes mp4 + webm, then builds the stills.

Requires: ffmpeg/ffprobe, numpy, Pillow (stills only).
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
OUT_W, OUT_H = 768, 960  # 4:5
FPS = 24


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def probe(video: Path) -> dict:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,duration:format=duration",
         "-of", "json", str(video)])
    j = json.loads(out)
    st = j["streams"][0]
    # prefer the *video* stream duration: the audio track is often a few ms longer
    dur = float(st.get("duration") or j["format"]["duration"])
    return {"w": st["width"], "h": st["height"], "dur": dur}


def read_gray_frames(video: Path, fps: float, width: int, height: int) -> np.ndarray:
    raw = subprocess.check_output(
        ["ffmpeg", "-v", "error", "-i", str(video), "-vf",
         f"fps={fps},scale={width}:{height},format=gray", "-f", "rawvideo", "-"])
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, height, width)


def detect_crop(video: Path, src_w: int, src_h: int) -> tuple[int, int, int, int]:
    """Return (cw, ch, x, y): a 4:5 crop centred on the person, head to toe."""
    sw = 320
    sh = round(src_h * sw / src_w)
    frames = read_gray_frames(video, 2, sw, sh).astype(np.int16)
    bg = np.percentile(frames, 90)
    fg = frames < (bg - 45)  # hair, trousers, skin, watch... (a white shirt is ~ background)
    cols = fg.sum(axis=(0, 1))
    rows = fg.sum(axis=(0, 2))
    min_c = max(2, 0.02 * frames.shape[0] * sh * 0.2)
    xs = np.where(cols > min_c)[0]
    ys = np.where(rows > max(2, 0.02 * frames.shape[0] * sw * 0.05))[0]
    if len(xs) == 0 or len(ys) == 0:
        sys.exit("Could not detect a person. Pass --crop W:H:X:Y.")
    scale = src_w / sw
    x0, x1 = xs.min() * scale, (xs.max() + 1) * scale
    y0, y1 = ys.min() * scale, (ys.max() + 1) * scale
    bh = y1 - y0
    ch = min(src_h, bh * 1.10)  # 5 % head-room / foot-room
    cw = ch * 4 / 5
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2
    x = min(max(cx - cw / 2, 0), src_w - cw)
    y = min(max(cy - ch / 2, 0), src_h - ch)
    ev = lambda v: int(v) // 2 * 2
    print(f"  person bbox: x {x0:.0f}-{x1:.0f}  y {y0:.0f}-{y1:.0f}  ({x1-x0:.0f}x{bh:.0f})")
    return ev(cw), ev(ch), ev(x), ev(y)


def measure_white_point(video: Path, crop: tuple[int, int, int, int]) -> float:
    """Level (0-1) of the backdrop in the crop: used as the colorlevels white point."""
    cw, ch, x, y = crop
    raw = subprocess.check_output(
        ["ffmpeg", "-v", "error", "-i", str(video), "-vf",
         f"fps=2,crop={cw}:{ch}:{x}:{y},scale=96:120,format=gray", "-f", "rawvideo", "-"])
    f = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 120, 96)
    border = np.concatenate([f[:, :10, :].ravel(), f[:, -10:, :].ravel(),
                             f[:, :, :8].ravel(), f[:, :, -8:].ravel()])
    p = float(np.percentile(border, 8)) / 255.0
    # the brief's default is 0.98; go lower only if the backdrop is darker than that
    return max(0.80, min(0.98, p))


def decode_audio(video: Path, seconds: float) -> np.ndarray:
    raw = subprocess.check_output(
        ["ffmpeg", "-v", "error", "-i", str(video), "-t", f"{seconds}", "-vn",
         "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    a = np.frombuffer(raw, dtype="<f4").reshape(-1, 2).copy()
    need = int(round(seconds * SR))
    if len(a) < need:  # pad with silence if the audio is a hair short
        a = np.vstack([a, np.zeros((need - len(a), 2), dtype=np.float32)])
    return a[:need]


def loop_audio(a: np.ndarray, fade: float) -> np.ndarray:
    """Sample-accurate equal-power loop: out = [tail x head cross-fade] + a[d : L-d]."""
    d = int(round(fade * SR))
    L = len(a)
    tail, head = a[L - d:], a[:d]
    t = (np.arange(d, dtype=np.float64) / d)[:, None]
    mix = tail * np.cos(t * np.pi / 2) + head * np.sin(t * np.pi / 2)
    return np.vstack([mix, a[d:L - d]]).astype("<f4")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--video", required=True, type=Path)
    ap.add_argument("--photo", type=Path, help="optional front-facing photo for the ID card")
    ap.add_argument("--photo-crop", help="X:Y:W:H crop of the photo (head to shirt, 4:5)")
    ap.add_argument("--crop", help="W:H:X:Y crop of the video (skips auto-detection)")
    ap.add_argument("--loop-seconds", type=float, default=10.0, help="use at most this much of the video")
    ap.add_argument("--fade", type=float, default=0.5, help="cross-fade length in seconds")
    ap.add_argument("--font-bold", type=Path, help="TTF/OTF used for the OG title")
    ap.add_argument("--font-serif", type=Path, help="TTF/OTF (italic serif) used for the OG role line")
    args = ap.parse_args()

    video: Path = args.video
    info = probe(video)
    L = round(min(args.loop_seconds, info["dur"]) * FPS) / FPS  # whole frames
    d = args.fade
    print(f"source {info['w']}x{info['h']}  {info['dur']:.2f}s  -> using {L:.3f}s, fade {d}s")

    if args.crop:
        cw, ch, x, y = (int(v) for v in args.crop.split(":"))
    else:
        print("detecting person…")
        cw, ch, x, y = detect_crop(video, info["w"], info["h"])
    print(f"  crop {cw}x{ch} at {x},{y}")
    white = measure_white_point(video, (cw, ch, x, y))
    print(f"  colorlevels white point {white:.3f}")

    out_dir = ROOT / "public" / "hero"
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        loop_mkv = tmp / "loop.mkv"
        audio_raw = tmp / "loop.f32"

        # --- picture: crop, scale, whiten, cross-fade tail into head -----------------
        vf = (
            f"[0:v]fps={FPS},trim=0:{L},setpts=PTS-STARTPTS,"
            f"crop={cw}:{ch}:{x}:{y},scale={OUT_W}:{OUT_H}:flags=lanczos:in_color_matrix=bt601,"
            f"format=gbrp,colorlevels=rimax={white}:gimax={white}:bimax={white},"
            f"scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,split=2[a][b];"
            f"[a]trim=start={L - d}:end={L},setpts=PTS-STARTPTS[tail];"
            f"[b]trim=start=0:end={L - d},setpts=PTS-STARTPTS[main];"
            f"[tail][main]xfade=transition=fade:duration={d}:offset=0,format=yuv420p[v]"
        )
        run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-filter_complex", vf,
             "-map", "[v]", "-r", str(FPS), "-c:v", "ffv1", str(loop_mkv)])

        # --- audio: sample-accurate cross-fade in numpy ------------------------------
        a = decode_audio(video, L)
        looped = loop_audio(a, d)
        looped.tofile(audio_raw)
        print(f"  loop length {len(looped) / SR:.3f}s")

        common_in = ["-i", str(loop_mkv), "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", str(audio_raw)]
        tags = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"]

        # --- hero.mp4 ----------------------------------------------------------------
        run(["ffmpeg", "-v", "error", "-y", *common_in, "-map", "0:v", "-map", "1:a",
             "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
             "-profile:v", "high", *tags,
             "-c:a", "aac", "-b:a", "96k", "-ar", str(SR),
             "-movflags", "+faststart", "-shortest", str(out_dir / "hero.mp4")])

        # --- hero.webm ---------------------------------------------------------------
        run(["ffmpeg", "-v", "error", "-y", *common_in, "-map", "0:v", "-map", "1:a",
             "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-pix_fmt", "yuv420p",
             "-row-mt", "1", "-cpu-used", "2", *tags,
             "-c:a", "libopus", "-b:a", "80k", "-shortest", str(out_dir / "hero.webm")])

        # --- poster (first frame of the loop) ----------------------------------------
        run(["ffmpeg", "-v", "error", "-y", "-i", str(loop_mkv), "-frames:v", "1",
             "-c:v", "libwebp", "-quality", "82", str(out_dir / "hero-poster.webp")])
        run(["ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", str(loop_mkv), "-frames:v", "1",
             str(tmp / "still.png")])

        build_stills(tmp / "still.png", args)

    for f in ("hero.mp4", "hero.webm", "hero-poster.webp"):
        print(f"  {f:18s} {os.path.getsize(out_dir / f) / 1024:7.0f} kB")
    print("done.")


def build_stills(still: Path, args: argparse.Namespace) -> None:
    from PIL import Image, ImageChops, ImageDraw, ImageFont

    pub = ROOT / "public"

    # --- portrait-bust.webp (480x600) ---------------------------------------------------
    if args.photo:
        im = Image.open(args.photo).convert("RGB")
        if args.photo_crop:
            px, py, pw, ph = (int(v) for v in args.photo_crop.split(":"))
        else:  # centred 4:5 crop of the upper part of the photo
            pw = min(im.width, int(im.height * 0.8))
            ph = int(pw * 1.25)
            px, py = (im.width - pw) // 2, 0
        port = im.crop((px, py, px + pw, py + ph))
    else:  # fall back to the head and shoulders of the video frame
        fr = Image.open(still).convert("RGB")
        w, h = fr.size
        pw = int(w * 0.5)
        ph = int(pw * 1.25)
        port = fr.crop(((w - pw) // 2, int(h * 0.02), (w - pw) // 2 + pw, int(h * 0.02) + ph))
    port = port.resize((480, 600), Image.LANCZOS)
    port.save(pub / "portrait-bust.webp", quality=88, method=6)

    # --- og.jpg (1200x630): name on the left, the person on the right ------------------
    paper = (244, 242, 238)
    og = Image.new("RGB", (1200, 630), paper)
    fr = Image.open(still).convert("RGB")
    fh = 630
    fw = int(fr.width * fh / fr.height)
    fr = fr.resize((fw, fh), Image.LANCZOS)
    tile = Image.new("RGB", fr.size, paper)
    tile = ImageChops.multiply(tile, fr)  # same trick as the site: white -> paper
    og.paste(tile, (1200 - fw - 60, 0))

    def font(path: Path | None, size: int, fallbacks: list[str]):
        for p in ([str(path)] if path else []) + fallbacks:
            if p and os.path.exists(p):
                return ImageFont.truetype(p, size)
        return ImageFont.load_default()

    bold = font(args.font_bold, 110, ["/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"])
    serif = font(args.font_serif, 60, ["/mnt/skills/examples/canvas-design/canvas-fonts/InstrumentSerif-Italic.ttf"])
    mono = font(None, 22, ["/mnt/skills/examples/canvas-design/canvas-fonts/JetBrainsMono-Regular.ttf"])
    dr = ImageDraw.Draw(og)
    dr.text((72, 190), "Praveen R", font=bold, fill=(13, 13, 13))
    dr.text((74, 330), "Data Analytics Graduate", font=serif, fill=(119, 117, 111))
    dr.text((74, 540), "PORTFOLIO", font=mono, fill=(119, 117, 111))
    og.save(pub / "og.jpg", quality=90, optimize=True)
    print("  portrait-bust.webp, og.jpg written")


if __name__ == "__main__":
    main()
