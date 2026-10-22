"use client";

import { openPlayground } from "@/lib/tara";

const links = [
  { href: "#demo", label: "Demo" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-5 pr-2">
        <a
          href="https://outreachorigins.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-accent-2" />
          Tara
        </a>
        <ul className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={openPlayground}
          className="rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
        >
          Try Tara
        </button>
      </nav>
    </header>
  );
}
