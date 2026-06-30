import type { AppState, ChatMessage } from "./types";

/** Build-log event types that represent the agent *doing* something
 *  (as opposed to status chatter, session cards, or the user talking). */
const ACTION_TYPES = new Set([
  "Write",
  "Read",
  "Agent",
  "Workflow",
  "Commit",
  "Tasks",
]);

function isUser(m: ChatMessage): boolean {
  const sender = (m.sender ?? "").toLowerCase();
  const type = (m.type ?? "").toLowerCase();
  return sender === "user" || type === "user";
}

function tsOf(m: ChatMessage): number | null {
  if (!m.timestamp) return null;
  const t = new Date(m.timestamp).getTime();
  return isNaN(t) ? null : t;
}

function isToolCall(m: ChatMessage): boolean {
  if ((m.type ?? "").startsWith("mcp__")) return true;
  const meta = m.metadata ?? {};
  return typeof meta["tool_name"] === "string";
}

export function humanDuration(ms: number | null): string {
  if (ms === null || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export interface BuildMetrics {
  // Human input
  userMessages: number;
  humanPromptWords: number;
  clarifyingQuestions: number;
  totalMessages: number;
  // Agent effort
  buildEvents: number;
  agentActions: number;
  filesWritten: number;
  filesRead: number;
  commits: number;
  toolInvocations: number;
  subagentSwitches: number;
  // Artifacts
  agentsCreated: number;
  workflowNodes: number;
  workflowEdges: number;
  prdWords: number;
  prdSections: number;
  models: string[];
  integrations: number;
  // Time
  buildDurationMs: number | null; // first contiguous build session
  totalSpanMs: number | null; // first event → last event overall
  sessions: number; // distinct work sessions (split on long idle gaps)
  // Distribution
  eventHistogram: { type: string; count: number }[];
}

export function computeMetrics(state: AppState): BuildMetrics {
  const reqs = state.requirementsMessages ?? [];
  const planning = state.myraChatMessages ?? [];
  const lyra = state.lyraChatMessages ?? [];
  const agents = state.agents ?? [];
  const wf = state.workflow ?? state.workflowData;
  const prd = state.prdContent ?? "";

  const allConvo = [...reqs, ...planning, ...lyra];

  const userMsgs = allConvo.filter(isUser);
  const userMessages = userMsgs.length;
  const humanPromptWords = userMsgs.reduce(
    (acc, m) => acc + (m.content?.trim().split(/\s+/).filter(Boolean).length ?? 0),
    0,
  );

  // Clarifying questions = Architect/agent replies during requirements gathering
  const clarifyingQuestions = reqs.filter((m) => !isUser(m)).length;

  const buildEvents = lyra.length;
  const agentActions = lyra.filter((m) =>
    ACTION_TYPES.has(m.type ?? "") || (m.type ?? "").startsWith("mcp__"),
  ).length;
  const filesWritten = lyra.filter((m) => m.type === "Write").length;
  const filesRead = lyra.filter((m) => m.type === "Read").length;
  const commits = lyra.filter((m) => m.type === "Commit").length;
  const toolInvocations = lyra.filter(isToolCall).length;
  const subagentSwitches = lyra.filter(
    (m) => m.eventType === "subagent_switch",
  ).length;

  const agentsCreated = agents.length;
  const workflowNodes = wf?.nodes?.length ?? 0;
  const workflowEdges = wf?.edges?.length ?? 0;

  const prdWords = prd.trim() ? prd.trim().split(/\s+/).length : 0;
  const prdSections = (prd.match(/^##\s+/gm) ?? []).length;

  const models = [
    ...new Set(agents.map((a) => a.model).filter((m): m is string => !!m)),
  ];

  // Crude integration detector from PRD ("**Data Sources Detected:** N")
  let integrations = 0;
  const ds = prd.match(/Data Sources?\s*Detected\D*?(\d+)/i);
  if (ds) integrations = parseInt(ds[1], 10);

  // Timing — split the build log into work sessions on long idle gaps so the
  // headline "build time" reflects the initial autonomous build, not weeks of
  // later revisits.
  const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min
  const lyraTs = lyra
    .map(tsOf)
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);
  const allTs = allConvo.map(tsOf).filter((t): t is number => t !== null);

  let sessions = 0;
  let firstSessionSpan: number | null = null;
  if (lyraTs.length) {
    sessions = 1;
    let sessionStart = lyraTs[0];
    let sessionEnd = lyraTs[0];
    for (let i = 1; i < lyraTs.length; i++) {
      if (lyraTs[i] - lyraTs[i - 1] > SESSION_GAP_MS) {
        if (firstSessionSpan === null) firstSessionSpan = sessionEnd - sessionStart;
        sessions++;
        sessionStart = lyraTs[i];
      }
      sessionEnd = lyraTs[i];
    }
    if (firstSessionSpan === null) firstSessionSpan = sessionEnd - sessionStart;
  }
  const buildDurationMs = firstSessionSpan;
  const totalSpanMs =
    allTs.length >= 2 ? Math.max(...allTs) - Math.min(...allTs) : null;

  // Histogram of build-log event types
  const counts = new Map<string, number>();
  lyra.forEach((m) => {
    const t = m.type ?? "Event";
    counts.set(t, (counts.get(t) ?? 0) + 1);
  });
  const eventHistogram = [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    userMessages,
    humanPromptWords,
    clarifyingQuestions,
    totalMessages: allConvo.length,
    buildEvents,
    agentActions,
    filesWritten,
    filesRead,
    commits,
    toolInvocations,
    subagentSwitches,
    agentsCreated,
    workflowNodes,
    workflowEdges,
    prdWords,
    prdSections,
    models,
    integrations,
    buildDurationMs,
    totalSpanMs,
    sessions,
    eventHistogram,
  };
}
