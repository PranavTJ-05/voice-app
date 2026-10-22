export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-sm text-muted sm:flex-row">
        <a
          href="https://outreachorigins.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 font-semibold text-fg"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-accent-2" />
          Tara
        </a>
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2">
          <a href="#top" className="hover:text-fg">Home</a>
          <a href="#demo" className="hover:text-fg">Demo</a>
          <a href="#faq" className="hover:text-fg">FAQ</a>
        </nav>
        <div className="text-center sm:text-right">
          <p>&copy; 2026 Tara. Voice agents as a service.</p>
          <p className="mt-1 text-dim">
            Developed by <span className="text-fg">Outreachorigins</span>
          </p>
          <p className="mt-1 text-dim">
            For any related queries, contact <span className="text-fg">Outreachorigins team</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
