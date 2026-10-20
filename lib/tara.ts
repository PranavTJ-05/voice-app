/** Client for the Tara backend (FastAPI). Set NEXT_PUBLIC_API_URL when it isn't on localhost:8000. */
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Reply = {
  status: "ok" | "refused" | "injection" | "emergency" | "no_knowledge" | "degraded" | "invalid";
  spoken: string;
  summary: string;
  key_points: string[];
  next_steps: string[];
  sources: { n: number; source: string; heading: string }[];
  disclaimer: string;
  pii_redacted: string[];
};

export type AppConfig = {
  assistant_name: string;
  organization: string;
  greeting: string;
  disclaimer: string;
  input_placeholder: string;
  starter_questions: string[];
};

async function ok<T>(r: Response, fallback: string): Promise<T> {
  if (r.ok) return r.json();
  let detail = fallback;
  try {
    detail = (await r.json()).detail ?? fallback;
  } catch {
    /* keep fallback */
  }
  throw new Error(detail);
}

export const getConfig = () => fetch(`${API}/config`).then((r) => ok<AppConfig>(r, "Tara's server is offline"));

export const sendChat = (sessionId: string, message: string) =>
  fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  }).then((r) => ok<Reply>(r, "Couldn't reach Tara"));

export const getToken = (sessionId: string) =>
  fetch(`${API}/token?session_id=${encodeURIComponent(sessionId)}`).then((r) =>
    ok<{ token: string; url: string }>(r, "Voice isn't set up on the server"),
  );

/** One id per browser, so Tara remembers the conversation across text and voice. */
export function sessionId(): string {
  try {
    let id = localStorage.getItem("tara-session");
    if (!id) {
      id = `s-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      localStorage.setItem("tara-session", id);
    }
    return id;
  } catch {
    return `s-${Math.random().toString(36).slice(2, 18)}`;
  }
}

/** Opens the live playground from anywhere on the page. */
export const openPlayground = () => window.dispatchEvent(new CustomEvent("tara:try"));
