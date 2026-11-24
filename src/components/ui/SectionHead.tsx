type Props = {
  /** "03" */
  index: string;
  /** "Selected work" */
  label: string;
  /** Heading text before the italic word: "Things I've" */
  lead: string;
  /** One Instrument Serif italic word: "built." */
  accent: string;
  id?: string;
};

/** Mono index + label, then a bold heading that ends in one serif-italic word. */
export default function SectionHead({ index, label, lead, accent, id }: Props) {
  return (
    <>
      <p className="tag rv">
        <b>{index}</b>
        <span aria-hidden="true">—</span>
        <span>{label}</span>
      </p>
      <h2 className="h2" id={id}>
        <span className="rv-mask">
          <span>
            {lead} <em className="serif-i">{accent}</em>
          </span>
        </span>
      </h2>
    </>
  );
}
