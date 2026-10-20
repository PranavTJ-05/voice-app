import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const steps = [
  {
    n: "01",
    title: "Describe your business",
    body: "Write who Tara is, what she can talk about and what she must refuse, in one Markdown file.",
    code: "domain: car rental\nassistant_name: Tara\nallowed_topics:\n  - pricing and availability",
  },
  {
    n: "02",
    title: "Add your documents",
    body: "Drop in price lists, policies and FAQs. Tara indexes them and answers from them, with sources.",
    code: "knowledge/docs/\n  fleet-and-prices.pdf\n  cancellation-policy.md",
  },
  {
    n: "03",
    title: "Go live in a line",
    body: "Paste one script tag on your site. Customers get a floating voice and chat assistant straight away.",
    code: '<script\n  src="https://your-host/widget.js"\n  async></script>',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-4 py-28 sm:px-6">
      <SectionHead eyebrow="How it works" title="Live in minutes," accent="not months.">
        No model training, no flow builders. Describe, upload, embed.
      </SectionHead>
      <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <article className="glass flex h-full flex-col rounded-3xl p-7">
              <span className="font-display text-xl italic text-accent">{s.n}</span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
              <pre className="mt-6 flex-1 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-[12.5px] leading-relaxed text-[#c7c7cc] ring-1 ring-line">
                {s.code}
              </pre>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
