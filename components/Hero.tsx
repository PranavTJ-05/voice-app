"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { openPlayground } from "@/lib/tara";

// WebGL can't render on the server.
const VoiceOrb = dynamic(() => import("./three/VoiceOrb"), { ssr: false });

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from("[data-hero-in]", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.2,
        });
      }
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scroll.current = self.progress;
          if (copy.current) {
            copy.current.style.opacity = String(1 - self.progress * 1.6);
            copy.current.style.transform = `translateY(${self.progress * -80}px)`;
          }
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative h-[130vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <VoiceOrb scroll={scroll} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,transparent_40%,#000_100%)]"
        />

        <div ref={copy} className="relative z-10 flex flex-col items-center px-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,0.78),transparent)]"
          />
          <p data-hero-in className="glass mb-6 rounded-full px-4 py-1.5 text-xs font-medium text-muted">
            Voice agents as a service
          </p>
          <h1 data-hero-in className="h-display max-w-4xl text-5xl sm:text-7xl md:text-7xl">
            Meet Tara.
            <br />
            <span className="accent-word">Your business, out loud.</span>
          </h1>
          <p data-hero-in className="mt-6 max-w-xl text-lg text-[#c7c7cc] md:text-xl">
            A human-sounding voice agent that answers from your own documents, stays on topic, and goes live on your
            site in minutes.
          </p>
          <div data-hero-in className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openPlayground}
              className="rounded-full bg-fg px-7 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Try Tara
            </button>
            <a
              href="#demo"
              className="glass rounded-full px-7 py-3 text-base font-medium transition-colors hover:bg-surface-strong"
            >
              Watch the demo
            </a>
          </div>
        </div>

        <div
          data-hero-in
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-dim uppercase"
        >
          Scroll
        </div>
      </div>
    </section>
  );
}
