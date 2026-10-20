"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openPlayground } from "@/lib/tara";

/** Scripted car-booking conversation. Audio clips were generated once with Orpheus (voice "autumn"). */
const SCRIPT = [
  { from: "user", text: "Hi, I need a car for this Saturday, around 10 am." },
  {
    from: "tara",
    text: "Of course! Saturday at ten works. Are you after a compact for the city, or something roomier for a road trip?",
    clip: "/demo/tara-1.wav",
    secs: 8.3,
  },
  { from: "user", text: "Something roomy. We're four people with luggage." },
  {
    from: "tara",
    text: "Perfect. I'd suggest our Toyota Highlander. It seats seven, and it's one hundred twelve dollars a day. Shall I book it for Saturday?",
    clip: "/demo/tara-2.wav",
    secs: 10,
  },
  { from: "user", text: "Yes, please. Is insurance included?" },
  {
    from: "tara",
    text: "Yes, basic coverage is included. You're all set. A Highlander, Saturday at ten. I've sent the confirmation to your email.",
    clip: "/demo/tara-3.wav",
    secs: 8.4,
  },
] as const;

const TYPE_MS = 38;
const THINK_MS = 900;
const GAP_MS = 700;
const TOTAL_MS = SCRIPT.reduce(
  (t, s) => t + (s.from === "user" ? s.text.length * TYPE_MS + 500 : THINK_MS + s.secs * 1000 + GAP_MS),
  0,
);

type Shown = { from: "user" | "tara"; text: string; clip?: number };
type Phase = "idle" | "playing" | "done";

class Cancelled extends Error {}

const BARS = 32;

/** Bars driven by a level callback each frame; mutates styles directly so React never re-renders at 60fps. */
function Wave({ level, active }: { level: () => number; active: boolean }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const l = active ? level() : 0;
      const t = (now - t0) / 1000;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const shape = 0.45 + 0.55 * Math.abs(Math.sin(i * 0.55 + t * 5)) * Math.abs(Math.sin(i * 0.21 + t * 2.3));
        el.style.transform = `scaleY(${0.12 + Math.min(1, l * 1.6) * shape * 0.88})`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, level]);

  return (
    <div className="flex h-7 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="h-full w-[3px] origin-center rounded-full bg-gradient-to-t from-accent to-accent-2"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export default function Demo() {
  const root = useRef<HTMLElement>(null);
  const [msgs, setMsgs] = useState<Shown[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mutable playback state shared with the async runner.
  const runId = useRef(0);
  const pausedRef = useRef(false);
  const soundRef = useRef(false);
  const elapsed = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const buf = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioPlaying = useRef(false);
  const started = useRef(false);

  const level = useCallback(() => {
    if (audioPlaying.current && analyser.current && buf.current) {
      analyser.current.getByteTimeDomainData(buf.current);
      let sum = 0;
      for (const v of buf.current) {
        const d = (v - 128) / 128;
        sum += d * d;
      }
      return Math.min(1, Math.sqrt(sum / buf.current.length) * 4);
    }
    // No audio: gentle simulated speech so the waveform still reads as "talking".
    const t = performance.now() / 1000;
    return 0.35 + 0.3 * Math.abs(Math.sin(t * 6.1) * Math.sin(t * 2.7));
  }, []);

  const enableSound = useCallback(() => {
    if (!ctx.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const c = new AC();
      const el = new Audio();
      el.preload = "auto";
      const src = c.createMediaElementSource(el);
      const an = c.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      an.connect(c.destination);
      ctx.current = c;
      audio.current = el;
      analyser.current = an;
      buf.current = new Uint8Array(new ArrayBuffer(an.fftSize));
    }
    void ctx.current.resume();
    soundRef.current = true;
    setSound(true);
  }, []);

  const disableSound = useCallback(() => {
    soundRef.current = false;
    audio.current?.pause();
    audioPlaying.current = false;
    setSound(false);
  }, []);

  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (next) audio.current?.pause();
    else if (audioPlaying.current) void audio.current?.play();
  }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
    elapsed.current = 0;
    pausedRef.current = false;
    setPaused(false);
    setMsgs([]);
    setInput("");
    setThinking(false);
    setSpeaking(null);
    setProgress(0);
    setPhase("playing");

    // Sleep in small steps so pause and restart take effect quickly; only active time counts as progress.
    const wait = async (ms: number) => {
      let left = ms;
      while (left > 0) {
        if (runId.current !== id) throw new Cancelled();
        if (pausedRef.current) {
          await new Promise((r) => setTimeout(r, 80));
          continue;
        }
        const step = Math.min(left, 40);
        await new Promise((r) => setTimeout(r, step));
        left -= step;
        elapsed.current += step;
        setProgress(Math.min(1, elapsed.current / TOTAL_MS));
      }
      if (runId.current !== id) throw new Cancelled();
    };

    try {
      await wait(500);
      let clipIdx = 0;
      for (const step of SCRIPT) {
        if (step.from === "user") {
          for (let i = 1; i <= step.text.length; i++) {
            setInput(step.text.slice(0, i));
            await wait(TYPE_MS);
          }
          await wait(350);
          setMsgs((m) => [...m, { from: "user", text: step.text }]);
          setInput("");
          await wait(150);
        } else {
          setThinking(true);
          await wait(THINK_MS);
          setThinking(false);
          const idx = clipIdx++;
          setMsgs((m) => [...m, { from: "tara", text: "", clip: idx }]);
          setSpeaking(idx);

          let ended: Promise<void> = Promise.resolve();
          const el = audio.current;
          if (soundRef.current && el) {
            el.src = step.clip;
            ended = new Promise<void>((resolve) => {
              el.onended = () => {
                audioPlaying.current = false;
                resolve();
              };
              el.onerror = () => {
                audioPlaying.current = false;
                resolve();
              };
            });
            try {
              await el.play();
              audioPlaying.current = true;
            } catch {
              audioPlaying.current = false;
            }
          }

          // Reveal the words across the clip length, in step with the voice.
          const words = step.text.split(" ");
          const per = (step.secs * 1000 * 0.92) / words.length;
          for (let w = 1; w <= words.length; w++) {
            const text = words.slice(0, w).join(" ");
            setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, text } : x)));
            await wait(per);
          }
          if (audioPlaying.current) {
            await Promise.race([ended, new Promise((r) => setTimeout(r, 3000))]);
          }
          setSpeaking(null);
          await wait(GAP_MS);
        }
      }
      setProgress(1);
      await wait(600);
      setPhase("done");
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
    }
  }, []);

  const cancel = useCallback(() => {
    runId.current++;
  }, []);

  // Start once, when the demo is mostly on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          void run();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel();
      audio.current?.pause();
      void ctx.current?.close();
    };
  }, [run, cancel]);

  const replay = () => {
    audio.current?.pause();
    audioPlaying.current = false;
    void run();
  };

  const tryIt = () => {
    openPlayground();
  };

  const done = phase === "done";

  return (
    <section ref={root} id="demo" className="relative px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-accent">See it in action</p>
        <h2 className="h-display text-5xl sm:text-7xl">
          A conversation that <span className="accent-word">sounds human.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Watch Tara handle a real car-rental booking, typed or spoken, with answers pulled from the business&apos;s
          own information.
        </p>
      </div>

      <div className="relative mx-auto mt-14 max-w-2xl">
        <div
          className={`transition-all duration-700 ease-[var(--ease-apple)] ${
            done ? "scale-[0.96] opacity-50 blur-md" : ""
          }`}
        >
          <div className="glass overflow-hidden rounded-3xl shadow-[0_40px_120px_-30px_rgba(205,180,140,0.14)]">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden>
                  <i className="h-3 w-3 rounded-full bg-white/20" />
                  <i className="h-3 w-3 rounded-full bg-white/20" />
                  <i className="h-3 w-3 rounded-full bg-accent" />
                </span>
                <span className="ml-2 text-sm font-medium">DriveEase Rentals</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-accent" /> Tara is online
              </div>
            </div>

            {/* Conversation */}
            <div
              className="flex h-[440px] flex-col justify-end gap-3 overflow-hidden px-5 py-5"
              role="log"
              aria-label="Demo conversation"
            >
              {msgs.map((m, i) =>
                m.from === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[80%] rounded-2xl rounded-br-md bg-fg px-4 py-2.5 text-[15px] leading-snug text-black">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="flex">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface-strong px-4 py-3 text-[15px] leading-snug">
                      <p>{m.text}</p>
                      <div className="mt-3 flex items-center gap-3 text-accent">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                          <PlayIcon playing={speaking === m.clip && !paused} />
                        </span>
                        <Wave level={level} active={speaking === m.clip && !paused} />
                      </div>
                    </div>
                  </div>
                ),
              )}
              {thinking && (
                <div className="flex">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-surface-strong px-4 py-3.5">
                    {[0, 1, 2].map((d) => (
                      <i
                        key={d}
                        className="h-2 w-2 animate-bounce rounded-full bg-muted"
                        style={{ animationDelay: `${d * 140}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-line p-4">
              <div className="flex items-center gap-3 rounded-full bg-black/40 py-2 pl-5 pr-2 ring-1 ring-line">
                <span className="min-h-6 flex-1 truncate text-left text-[15px]">
                  {input || <span className="text-dim">Message Tara…</span>}
                  {input && <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-fg" />}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    input ? "bg-fg text-black" : "bg-surface-strong text-dim"
                  }`}
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Player controls */}
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={togglePause}
              disabled={phase !== "playing"}
              aria-label={paused ? "Resume demo" : "Pause demo"}
              className="glass flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-strong disabled:opacity-40"
            >
              <PlayIcon playing={!paused && phase === "playing"} />
            </button>
            <div
              className="h-1 flex-1 overflow-hidden rounded-full bg-surface-strong"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-fg" style={{ width: `${progress * 100}%` }} />
            </div>
            <button
              onClick={sound ? disableSound : enableSound}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-surface-strong"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
                {sound ? (
                  <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
                ) : (
                  <path d="m17 9 5 6m0-6-5 6" strokeLinecap="round" />
                )}
              </svg>
              {sound ? "Sound on" : "Tap for sound"}
            </button>
          </div>
        </div>

        {/* End-of-demo overlay */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-700 ${
            done ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!done}
        >
          <h3 className="h-display text-5xl sm:text-6xl">Now it&apos;s your turn.</h3>
          <p className="mt-3 max-w-sm text-muted">Talk to Tara yourself. Ask about cars, prices, or anything else.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={tryIt}
              tabIndex={done ? 0 : -1}
              className="rounded-full bg-fg px-8 py-3 text-base font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Try it yourself
            </button>
            <button
              onClick={replay}
              tabIndex={done ? 0 : -1}
              className="glass rounded-full px-6 py-3 text-base font-medium transition-colors hover:bg-surface-strong"
            >
              Replay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
