import Reveal from "./Reveal";

export default function SectionHead({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
      <h2 className="h-display text-6xl sm:text-8xl">
        {title} {accent && <span className="accent-word">{accent}</span>}
      </h2>
      {children && <p className="mx-auto mt-5 max-w-2xl text-xl text-muted">{children}</p>}
    </Reveal>
  );
}
