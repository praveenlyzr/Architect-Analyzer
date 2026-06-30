"use client";

import { useCallback, useState } from "react";
import type { AppStateResponse, AppState } from "@/lib/types";
import {
  deriveAppName,
  deriveTagline,
  fmtDate,
  relTime,
  statusTone,
  uniqueModels,
} from "@/lib/format";
import { Section, Pill, Field, CopyChip } from "@/components/primitives";
import { Markdown } from "@/components/Markdown";
import { AgentCard } from "@/components/AgentCard";
import { WorkflowGraph } from "@/components/WorkflowGraph";
import { ChatThread } from "@/components/ChatThread";
import { BuildLog } from "@/components/BuildLog";
import { BuildMetrics } from "@/components/BuildMetrics";
import { computeMetrics } from "@/lib/metrics";

const SAMPLE_ID = "6a20c9a8763409aa5f09ae5a";

export default function Home() {
  const [appId, setAppId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AppStateResponse | null>(null);

  const analyze = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/app/${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? `Request failed (${res.status}).`);
      } else {
        setData(json);
      }
    } catch {
      setError("Network error — could not reach the analyzer.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-32 pt-10 sm:px-8">
      <Header />
      <SearchBar
        appId={appId}
        setAppId={setAppId}
        loading={loading}
        onAnalyze={() => analyze(appId)}
        onSample={() => {
          setAppId(SAMPLE_ID);
          analyze(SAMPLE_ID);
        }}
      />

      {error && (
        <div className="mt-8 rounded-xl border border-rose/40 bg-rose/5 p-4 text-sm text-rose">
          {error}
        </div>
      )}

      {loading && <LoadingState />}

      {data && !loading && <Report res={data} />}

      {!data && !loading && !error && <EmptyState />}
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */
function Header() {
  return (
    <header className="rise mb-10">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/10 font-mono text-cyan-bright">
          ▲
        </div>
        <div className="font-mono text-sm uppercase tracking-[0.3em] text-fg-muted">
          Architect <span className="text-cyan-bright">Analyzer</span>
        </div>
      </div>
      <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
        Everything about an Architect app,{" "}
        <span className="font-display italic text-cyan-bright">
          decoded from one id.
        </span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
        Paste an app id to inspect its PRD, agent configuration, workflow
        topology, the conversations that shaped it, and the full build log —
        all pulled live from the Architect API.
      </p>
    </header>
  );
}

/* ----------------------------- Search ----------------------------- */
function SearchBar({
  appId,
  setAppId,
  loading,
  onAnalyze,
  onSample,
}: {
  appId: string;
  setAppId: (v: string) => void;
  loading: boolean;
  onAnalyze: () => void;
  onSample: () => void;
}) {
  return (
    <div className="rise" style={{ animationDelay: "0.08s" }}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-fg-dim">
            #
          </span>
          <input
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            placeholder="Enter an Architect app id…"
            spellCheck={false}
            className="w-full rounded-xl border border-hairline bg-panel/60 py-3.5 pl-9 pr-4 font-mono text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-cyan/60"
          />
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading || !appId.trim()}
          className="rounded-xl border border-cyan/50 bg-cyan/10 px-6 py-3.5 font-mono text-sm font-medium text-cyan-bright transition-all hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze →"}
        </button>
      </div>
      <button
        onClick={onSample}
        className="mt-3 font-mono text-xs text-fg-dim transition-colors hover:text-cyan-bright"
      >
        ↳ try the sample app ({SAMPLE_ID.slice(0, 10)}…)
      </button>
    </div>
  );
}

/* --------------------------- Report --------------------------- */
function Report({ res }: { res: AppStateResponse }) {
  const state: AppState = res.state ?? {};
  const name = deriveAppName(state);
  const tagline = deriveTagline(state);
  const models = uniqueModels(state);
  const wf = state.workflow ?? state.workflowData;
  const lyra = state.lyraChatMessages ?? [];
  const reqs = state.requirementsMessages ?? [];
  const planning = state.myraChatMessages ?? [];
  const agents = state.agents ?? [];
  const metrics = computeMetrics(state);

  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

  return (
    <div className="rise mt-10" style={{ animationDelay: "0.05s" }}>
      {/* Hero summary */}
      <div className="rounded-3xl border border-hairline bg-gradient-to-b from-panel/80 to-panel/30 p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={statusTone(state.repository_init_status)}>
            repo: {state.repository_init_status ?? "unknown"}
          </Pill>
          {state.selectedThemeId && <Pill>theme: {state.selectedThemeId}</Pill>}
          {state.changePlannerMode && (
            <Pill>mode: {state.changePlannerMode}</Pill>
          )}
        </div>
        <h2 className="mt-4 font-display text-4xl text-fg sm:text-5xl">
          {name}
        </h2>
        {tagline && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {tagline}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-hairline pt-6 sm:grid-cols-2">
          <Field label="App ID">
            <CopyChip value={res.app_id} />
          </Field>
          <Field label="Owner">
            {state.user_name ?? "—"}
            {state.user_email ? (
              <span className="text-fg-dim"> · {state.user_email}</span>
            ) : null}
          </Field>
          {state.app_uri && (
            <Field label="Live App">
              <a
                href={state.app_uri}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-bright hover:underline"
              >
                {state.app_uri.replace(/^https?:\/\//, "")} ↗
              </a>
            </Field>
          )}
          {state.currentCommitId && (
            <Field label="Current Commit" mono>
              <span className="text-fg-muted">
                {state.currentCommitId.slice(0, 12)}
              </span>
            </Field>
          )}
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={agents.length} label="Agents" />
          <Stat value={wf?.nodes?.length ?? 0} label="Workflow Nodes" />
          <Stat value={lyra.length} label="Build Events" />
          <Stat value={models.length || "—"} label="Models" />
        </div>
        {models.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {models.map((m) => (
              <Pill key={m} tone="cyan">
                {m}
              </Pill>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="mt-4 space-y-2">
        <Section id="metrics" index={idx()} title="Build Analytics">
          <BuildMetrics m={metrics} />
        </Section>

        {state.prdContent && (
          <Section id="prd" index={idx()} title="Product Requirements">
            <Markdown>{state.prdContent}</Markdown>
          </Section>
        )}

        {agents.length > 0 && (
          <Section
            id="agents"
            index={idx()}
            title="Agents"
            count={agents.length}
          >
            <div className="space-y-4">
              {agents.map((a, i) => (
                <AgentCard key={a.agent_id ?? i} agent={a} />
              ))}
            </div>
          </Section>
        )}

        {wf && (wf.nodes?.length ?? 0) > 0 && (
          <Section
            id="workflow"
            index={idx()}
            title="Workflow"
            count={`${wf.nodes?.length ?? 0} nodes`}
          >
            <WorkflowGraph wf={wf} />
            {wf.created_at && (
              <p className="mt-3 font-mono text-xs text-fg-dim">
                created {fmtDate(wf.created_at)}
              </p>
            )}
          </Section>
        )}

        {reqs.length > 0 && (
          <Section
            id="requirements"
            index={idx()}
            title="Requirements Gathering"
            count={reqs.length}
            defaultOpen={false}
          >
            <ChatThread messages={reqs} />
          </Section>
        )}

        {planning.length > 0 && (
          <Section
            id="planning"
            index={idx()}
            title="PRD Planning Conversation"
            count={planning.length}
            defaultOpen={false}
          >
            <ChatThread messages={planning} stripContext />
          </Section>
        )}

        {lyra.length > 0 && (
          <Section
            id="buildlog"
            index={idx()}
            title="Build Log"
            count={lyra.length}
            defaultOpen={false}
          >
            <BuildLog messages={lyra} />
          </Section>
        )}

        <Section
          id="raw"
          index={idx()}
          title="Raw State"
          defaultOpen={false}
        >
          <pre className="max-h-[500px] overflow-auto rounded-xl border border-hairline bg-ink-2 p-4 font-mono text-xs leading-relaxed text-fg-muted">
            {JSON.stringify(redactSandbox(res), null, 2)}
          </pre>
        </Section>
      </div>

      <footer className="mt-12 border-t border-hairline pt-6 font-mono text-xs text-fg-dim">
        Architect Analyzer · data fetched live · token stays server-side
      </footer>
    </div>
  );
}

/** Strip the sandbox URL from the raw dump so it stays hidden everywhere. */
function redactSandbox(res: AppStateResponse): AppStateResponse {
  const clone = JSON.parse(JSON.stringify(res)) as AppStateResponse;
  if (clone.state && "sandbox_url" in clone.state) {
    clone.state.sandbox_url = "[hidden]";
  }
  return clone;
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-ink-2/60 p-4">
      <div className="font-mono text-2xl font-semibold text-cyan-bright tabular-nums">
        {value}
      </div>
      <div className="label mt-1">{label}</div>
    </div>
  );
}

/* --------------------------- States --------------------------- */
function LoadingState() {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-hairline bg-panel/40 p-7">
      <div className="relative h-1 overflow-hidden rounded bg-ink-2">
        <div
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent"
          style={{ animation: "scan 1.1s ease-in-out infinite" }}
        />
      </div>
      <p className="mt-5 font-mono text-sm text-fg-muted">
        Fetching app state from Architect…
      </p>
      <div className="mt-6 space-y-3">
        {[80, 60, 70, 45].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded bg-ink-2"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-14 flex flex-col items-center rounded-3xl border border-dashed border-hairline bg-panel/20 py-16 text-center">
      <div className="font-mono text-4xl text-fg-dim">⌖</div>
      <p className="mt-4 max-w-sm text-sm text-fg-muted">
        Enter an app id above to generate a full technical dossier.
      </p>
    </div>
  );
}
