import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const icon = "h-6 w-6 fill-none stroke-current stroke-[1.6]";

const features = [
  {
    title: "Talks like a person",
    body: "Natural speech in, natural speech out. Tara listens, answers in a warm human voice, and handles interruptions mid-sentence.",
    span: "md:col-span-2",
    visual: "wave",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Knows your business",
    body: "Upload PDFs, Markdown or text. Tara searches them at answer time and cites where each answer came from.",
    span: "",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Stays in scope",
    body: "Prompt-injection screening, PII redaction and a fixed refusal for off-topic questions, all enforced in code.",
    span: "",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Voice and chat, one brain",
    body: "Customers can type or talk and switch any time. Both share one pipeline, one memory and the same guardrails.",
    span: "md:col-span-2",
    visual: "chat",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Retarget in one file",
    body: "Change the persona, topics and rules by editing a single Markdown file. A law firm, a dealership, a clinic: no code changes.",
    span: "",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Drop it on any site",
    body: "One script tag adds a floating voice and chat widget. It lives in an iframe, so it never clashes with your styles.",
    span: "",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Built to stay up",
    body: "Model fallback, retries with backoff and graceful degraded modes. If server voice is unavailable, the browser reads the answer aloud.",
    span: "md:col-span-3",
    icon: (
      <svg viewBox="0 0 24 24" className={icon} aria-hidden>
        <path d="M4 14h4l3-9 4 14 3-5h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

function Visual({ kind }: { kind?: string }) {
  if (kind === "wave")
    return (
      <div className="mt-8 flex h-16 items-center justify-between overflow-hidden" aria-hidden>
        {Array.from({ length: 44 }, (_, i) => (
          <span
            key={i}
            className="w-[4px] rounded-full bg-gradient-to-t from-accent to-accent-2"
            style={{ height: `${18 + Math.abs(Math.sin(i * 0.5) * Math.sin(i * 0.17 + 1)) * 82}%`, opacity: 0.5 + (i % 5) * 0.1 }}
          />
        ))}
      </div>
    );
  if (kind === "chat")
    return (
      <div className="mt-8 space-y-2 text-sm" aria-hidden>
        <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-fg px-3.5 py-2 text-black">Do you have an SUV for Saturday?</p>
        <p className="w-fit rounded-2xl rounded-bl-md bg-surface-strong px-3.5 py-2">Yes! The Highlander seats seven.</p>
      </div>
    );
  return null;
}

export default function Features() {
  return (
    <section id="features" className="px-4 py-28 sm:px-6">
      <SectionHead eyebrow="Features" title="Everything a voice agent needs." accent="Nothing it shouldn't.">
        Built for customer-facing conversations: accurate, on-brand, and safe by default.
      </SectionHead>
      <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 90} className={f.span}>
            <article className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-colors hover:bg-surface-strong">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-accent">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{f.body}</p>
              <Visual kind={"visual" in f ? f.visual : undefined} />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
