"use client";

import { useState, useEffect, useCallback } from "react";
import { openPlayground } from "@/lib/tara";

const links = [
  { href: "#demo", label: "Demo" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync menu-open class on <html> to coordinate animations and scroll-locking
  useEffect(() => {
    if (menuOpen) {
      document.documentElement.classList.add("menu-open");
    } else {
      document.documentElement.classList.remove("menu-open");
    }
    return () => {
      document.documentElement.classList.remove("menu-open");
    };
  }, [menuOpen]);

  // Handle ESC key to close mobile drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    },
    [menuOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const closeMenu = () => setMenuOpen(false);

  const handleCtaClick = () => {
    closeMenu();
    openPlayground();
  };

  return (
    <>
      <header className="nav" id="nav">
        <a
          href="/"
          className="brand"
          aria-label="Outreachorigins — home"
          onClick={closeMenu}
        >
          <svg
            className="brand__mark"
            width={24}
            height={15}
            viewBox="0 0 144 92"
            fill="currentColor"
            fillRule="evenodd"
            aria-hidden="true"
            style={{ width: "24px", height: "15px", flexShrink: 0 }}
          >
            <path d="M46 0A46 46 0 1 1 46 92A46 46 0 1 1 46 0ZM46 22A24 24 0 1 0 46 70A24 24 0 1 0 46 22Z" />
            <path d="M100 26H122V36C127 29 135 25 144 25V47C130 47 122 55 122 70V92H100Z" />
          </svg>
          <span className="brand__name">
            Tara<em>AI</em>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {links.map((link, idx) => (
            <a key={idx} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleCtaClick}
          className="pill nav__cta"
        >
          <span className="pill__dot" aria-hidden="true" />
          Try Tara
        </button>

        <button
          className="nav__burger"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mnav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <div
        className="mnav"
        id="mnav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <p className="mnav__label">(Menu)</p>
        <nav className="mnav__links" aria-label="Mobile">
          <a href="#demo" onClick={closeMenu}>
            <i>01</i>Projects
          </a>
          <a href="#demo" onClick={closeMenu}>
            <i>02</i>Services
          </a>
          <a href="#faq" onClick={closeMenu}>
            <i>03</i>Studio
          </a>
          <button type="button" onClick={handleCtaClick}>
            <i>04</i>Start a project
          </button>
        </nav>
        <p className="mnav__foot">
          <span>Outreach<em>origins</em> · Independent web studio</span>
          <a
            href="mailto:hello@outreachorigins.com"
            onClick={closeMenu}
          >
            hello@outreachorigins.com
          </a>
        </p>
      </div>
    </>
  );
}
