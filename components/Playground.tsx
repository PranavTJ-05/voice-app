"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { getConfig, sendChat, sessionId, type AppConfig, type Reply } from "@/lib/tara";
import { useVoice } from "@/lib/useVoice";

const VoiceOrb = dynamic(() => import("./three/VoiceOrb"), { ssr: false });

type Msg = { role: "user" | "tara"; text: string; reply?: Reply };

const CAPTION = { listening: "Listening", thinking: "Thinking", speaking: "Speaking" } as const;

/** The reply text to show: the structured summary, else the spoken line (refusals and emergencies use that). */
const textOf = (r: Reply) => r.summary || r.spoken;

function ReplyBubble({ msg }: { msg: Msg }) {
  const r = msg.reply;
  const extras = r && r.status === "ok";
  return (
    <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-surface-strong px-4 py-3 text-[15px] leading-snug">
      <p>{msg.text}</p>
      {extras && r.key_points.length > 0 && (
        <ul className="mt-2.5 space-y-1 text-[14px] text-muted">
          {r.key_points.map((k, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {k}
            </li>
          ))}
        </ul>
      )}
      {extras && r.next_steps.length > 0 && (
        <p className="mt-3 border-t border-line pt-2.5 text-[13px] text-dim">Next: {r.next_steps.join(" · ")}</p>
      )}
    </div>
  );
}

function Session({ onClose, open }: { onClose: () => void; open: boolean }) {
  const [sid] = useState(sessionId);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [offline, setOffline] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setOffline(false);
    getConfig()
      .then((c) => {
        setConfig(c);
        setMsgs([{ role: "tara", text: c.greeting }]);
      })
      .catch(() => setOffline(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  // Voice answers join the same transcript, so text and voice share one conversation.
  const onVoiceAnswer = useCallback((question: string, reply: Reply) => {
    setMsgs((m) => [...m, { role: "user", text: question }, { role: "tara", text: textOf(reply), reply }]);
  }, []);
  const voice = useVoice(sid, onVoiceAnswer);
  const { stop: stopVoice } = voice;

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text: message }]);
    try {
      const reply = await sendChat(sid, message);
      setMsgs((m) => [...m, { role: "tara", text: textOf(reply), reply }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "tara", text: e instanceof Error ? e.message : "Something went wrong." }]);
    } finally {
      setBusy(false);
    }
  };

  const startVoice = () => {
    setVoiceOpen(true);
    void voice.start();
  };
  const endVoice = useCallback(() => {
    setVoiceOpen(false);
    void stopVoice();
  }, [stopVoice]);

  // Closing the modal ends any live call.
  useEffect(() => {
    if (!open) endVoice();
  }, [open, endVoice]);

  const connecting = voice.state === "connecting";
  const failed = voice.state === "error";
  const starters = config?.starter_questions ?? [];

  return (
    <div className="glass relative flex h-[min(760px,92vh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-bg-elev/80 shadow-[0_40px_160px_-20px_rgba(205,180,140,0.16)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-accent via-accent-2 to-accent-3" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{config?.assistant_name ?? "Tara"}</p>
            <p className="text-xs text-muted">{config?.organization ?? "Live demo"}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong text-muted transition-colors hover:text-fg"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5" role="log" aria-live="polite">
        {offline && (
          <div className="rounded-2xl border border-line bg-surface px-4 py-4 text-sm">
            <p className="font-medium">Tara is unavailable right now.</p>
            <p className="mt-1 text-muted">We couldn&apos;t reach the assistant. Please try again in a moment.</p>
            <button
              onClick={load}
              className="mt-3 rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Try again
            </button>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-fg px-4 py-2.5 text-[15px] leading-snug text-black">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex">
              <ReplyBubble msg={m} />
            </div>
          ),
        )}
        {busy && (
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
        {msgs.length === 1 && !busy && starters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {starters.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-full bg-black/40 py-1.5 pl-5 pr-1.5 ring-1 ring-line focus-within:ring-accent">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config?.input_placeholder ?? "Message Tara…"}
            maxLength={4000}
            disabled={!config}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-dim"
          />
          <button
            type="button"
            onClick={startVoice}
            disabled={!config}
            aria-label="Talk to Tara"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-strong transition-colors hover:bg-white/20 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-2" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={!input.trim() || busy}
            aria-label="Send"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fg text-black transition-opacity disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {config?.disclaimer && <p className="mt-2.5 text-center text-[11px] text-dim">{config.disclaimer}</p>}
      </form>

      {/* Voice mode */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center bg-black transition-opacity duration-500 ${
          voiceOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!voiceOpen}
      >
        <div className="relative w-full flex-1">
          {voiceOpen && <VoiceOrb level={voice.level} />}
        </div>
        <div className="px-6 pb-4 text-center">
          <p className="text-lg font-medium" aria-live="polite">
            {failed ? "Couldn't start voice" : connecting ? "Connecting…" : voice.muted ? "Mic is off" : CAPTION[voice.phase]}
          </p>
          <p className="mt-1 min-h-6 text-sm text-muted">
            {failed ? voice.error : voice.heard ? `“${voice.heard}”` : connecting ? "" : "Say something to Tara"}
          </p>
        </div>
        <div className="flex items-center gap-4 pb-8">
          <button
            onClick={voice.toggleMute}
            disabled={voice.state !== "live"}
            aria-pressed={voice.muted}
            aria-label={voice.muted ? "Turn mic on" : "Turn mic off"}
            className="glass flex h-14 w-14 items-center justify-center rounded-full transition-colors hover:bg-surface-strong disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2" aria-hidden>
              {voice.muted ? (
                <path d="M3 3l18 18M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.9-.8M5 11a7 7 0 0 0 11.2 5.6M19 11a7 7 0 0 1-.6 2.8M12 18v3" strokeLinecap="round" />
              ) : (
                <>
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
          <button
            onClick={endVoice}
            aria-label="End voice conversation"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b5483f] text-white transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal chat session; anything on the page can open it via openPlayground(). */
export default function Playground() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const show = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener("tara:try", show);
    return () => window.removeEventListener("tara:try", show);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, hide]);

  return (
    <>
      {everOpened && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-2xl transition-opacity duration-500 sm:p-6 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Talk to Tara"
          aria-hidden={!open}
          onMouseDown={(e) => e.target === e.currentTarget && hide()}
        >
          <Session open={open} onClose={hide} />
        </div>
      )}
    </>
  );
}
