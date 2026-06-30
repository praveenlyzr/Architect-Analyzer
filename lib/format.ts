import type { AppState } from "./types";

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  return fmtDate(iso);
}

/** Pull the app's display name from the first markdown H1 in the PRD. */
export function deriveAppName(state: AppState): string {
  const prd = state.prdContent ?? "";
  const m = prd.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  if (state.app_uri) {
    try {
      const host = new URL(state.app_uri).hostname;
      return host.split(".")[0].replace(/^preview--/, "");
    } catch {
      /* ignore */
    }
  }
  return "Untitled App";
}

/** First non-heading line of the PRD overview, used as a tagline. */
export function deriveTagline(state: AppState): string {
  const prd = state.prdContent ?? "";
  const overview = prd.split(/##\s*1\.\s*Overview/i)[1] ?? "";
  const firstPara = overview
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith("#"));
  return firstPara ?? "";
}

export function uniqueModels(state: AppState): string[] {
  const set = new Set<string>();
  (state.agents ?? []).forEach((a) => {
    if (a.model) set.add(a.model);
  });
  return [...set];
}

export function statusTone(status?: string): "green" | "amber" | "dim" {
  if (!status) return "dim";
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("success") || s.includes("done"))
    return "green";
  if (s.includes("progress") || s.includes("pending") || s.includes("init"))
    return "amber";
  return "dim";
}
