import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PROFILE } from "@/lib/data";
import "./globals.css";

/* Self-hosted, Latin subsets (see src/fonts/LICENSES.md). */
const display = localFont({
  src: [
    { path: "../fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/InterDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--ff-display",
  display: "swap",
});

const serif = localFont({
  src: [
    { path: "../fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--ff-serif",
  display: "swap",
});

const mono = localFont({
  src: [{ path: "../fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--ff-mono",
  display: "swap",
});

const title = `${PROFILE.name} — ${PROFILE.role}`;
const description = PROFILE.resumeSummary;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  authors: [{ name: PROFILE.name }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title,
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${PROFILE.name}, ${PROFILE.role}` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* reveal animations only hide content when JS is running */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
