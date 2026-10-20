import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const faqs = [
  {
    q: "Does Tara make things up?",
    a: "Tara answers from your guidelines and documents. Each answer is checked against them, and if the information isn't there she says so instead of guessing. Off-topic questions get a fixed refusal you control.",
  },
  {
    q: "Can customers talk and type?",
    a: "Yes. Voice and chat share one pipeline and one memory, so a customer can start by typing and continue by voice, with the same guardrails either way.",
  },
  {
    q: "How do I change what Tara knows?",
    a: "Edit one Markdown file for her persona, topics and rules, and add documents for the details. There is no retraining and no code change.",
  },
  {
    q: "What happens to personal data?",
    a: "Emails, phone numbers, card numbers and similar details are redacted before the model or memory ever sees them.",
  },
  {
    q: "How do I add Tara to my website?",
    a: "Paste a single script tag before the closing body tag. A floating launcher opens Tara in an iframe, so it can't clash with your site's styles.",
  },
  {
    q: "What if the voice service is down?",
    a: "Tara retries and falls back to a secondary model. If server voice is unavailable, the browser reads the answer aloud so the customer always gets a reply.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-4 py-28 sm:px-6">
      <SectionHead eyebrow="FAQ" title="Questions," accent="answered." />
      <Reveal className="mx-auto mt-14 max-w-3xl">
        <div className="divide-y divide-line rounded-3xl border border-line bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-medium">
                {f.q}
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 fill-none stroke-muted stroke-2 transition-transform duration-300 group-open:rotate-45"
                  aria-hidden
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
