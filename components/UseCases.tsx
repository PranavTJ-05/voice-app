import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const cases = [
  { name: "Car rental", line: "Quotes, availability and booking changes, around the clock." },
  { name: "Clinics", line: "Opening hours, test preparation and general information." },
  { name: "Law firms", line: "Practice areas and consultation booking, without legal advice." },
  { name: "Hotels", line: "Rooms, check-in, amenities and local recommendations." },
  { name: "Support desks", line: "Policy and how-to questions answered from your docs." },
  { name: "Dealerships", line: "Inventory, financing basics and test-drive scheduling." },
];

export default function UseCases() {
  return (
    <section className="px-4 py-28 sm:px-6">
      <SectionHead eyebrow="Use cases" title="One agent." accent="Every front desk.">
        Retarget Tara to any customer-facing role by changing one file.
      </SectionHead>
      <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 90}>
            <div className="glass h-full rounded-3xl p-6 transition-colors hover:bg-surface-strong">
              <h3 className="text-lg font-semibold tracking-tight">{c.name}</h3>
              <p className="mt-1.5 text-[15px] text-muted">{c.line}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
