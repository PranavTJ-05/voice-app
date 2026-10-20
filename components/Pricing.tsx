import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// PLACEHOLDER pricing: replace tiers, prices and limits with your real plans before launch.
const tiers = [
  {
    name: "Starter",
    price: "$49",
    unit: "/month",
    blurb: "For a single site getting started.",
    items: ["1 assistant", "500 voice minutes", "Chat and voice widget", "Email support"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Growth",
    price: "$199",
    unit: "/month",
    blurb: "For busy teams that live on the phone.",
    items: ["3 assistants", "3,000 voice minutes", "Document knowledge base", "Priority support", "Conversation analytics"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    blurb: "For regulated and high-volume businesses.",
    items: ["Unlimited assistants", "Volume voice pricing", "Custom guardrails", "SSO and audit logs", "Dedicated support"],
    cta: "Talk to us",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 py-28 sm:px-6">
      <SectionHead eyebrow="Pricing" title="Simple plans." accent="Real conversations.">
        Start small and scale as your customers start talking.
      </SectionHead>
      <div className="mx-auto mt-16 grid max-w-5xl items-stretch gap-4 md:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 100}>
            <article
              className={`relative flex h-full flex-col rounded-3xl p-7 ${
                t.featured
                  ? "bg-white/[0.07] ring-1 ring-accent/50"
                  : "glass"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-fg px-3 py-1 text-xs font-medium text-black">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted">{t.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="h-display text-5xl">{t.price}</span>
                <span className="text-muted">{t.unit}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-[15px]">
                {t.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-accent stroke-2" aria-hidden>
                      <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {it}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 rounded-full py-3 text-base font-medium transition-transform hover:scale-[1.02] ${
                  t.featured ? "bg-fg text-black" : "bg-surface-strong"
                }`}
              >
                {t.cta}
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
