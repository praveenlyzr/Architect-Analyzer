"use client";

import { useState } from "react";
import type { AgentConfig } from "@/lib/types";
import { Field, Pill } from "./primitives";

export function AgentCard({ agent }: { agent: AgentConfig }) {
  const [showInstr, setShowInstr] = useState(false);
  return (
    <div className="rounded-2xl border border-hairline bg-panel/60 p-5 backdrop-blur-sm transition-colors hover:border-hairline-bright">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 font-mono text-cyan-bright">
            ◆
          </div>
          <div>
            <h3 className="font-semibold text-fg">{agent.name ?? "Agent"}</h3>
            {agent.agent_id && (
              <div className="font-mono text-xs text-fg-dim">
                {agent.agent_id}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {agent.model && <Pill tone="cyan">{agent.model}</Pill>}
          {agent.provider_id && <Pill>{agent.provider_id}</Pill>}
        </div>
      </div>

      {agent.description && (
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">
          {agent.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Temperature" mono>
          {agent.temperature ?? "—"}
        </Field>
        <Field label="Top P" mono>
          {agent.top_p ?? "—"}
        </Field>
        <Field label="Memory" mono>
          {agent.has_memory ? "on" : "off"}
        </Field>
        <Field label="Knowledge" mono>
          {agent.has_knowledge_base ? "on" : "off"}
        </Field>
      </div>

      {(agent.agent_role || agent.agent_goal) && (
        <div className="mt-5 space-y-4 border-t border-hairline pt-4">
          {agent.agent_role && (
            <Field label="Role">
              <span className="text-fg-muted">{agent.agent_role}</span>
            </Field>
          )}
          {agent.agent_goal && (
            <Field label="Goal">
              <span className="text-fg-muted">{agent.agent_goal}</span>
            </Field>
          )}
        </div>
      )}

      {agent.agent_instructions && (
        <div className="mt-4 border-t border-hairline pt-4">
          <button
            onClick={() => setShowInstr((s) => !s)}
            className="label flex items-center gap-2 transition-colors hover:text-cyan-bright"
          >
            <span className={showInstr ? "rotate-90" : ""}>▸</span>
            System Instructions
          </button>
          {showInstr && (
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-hairline bg-ink-2 p-4 font-mono text-xs leading-relaxed text-fg-muted">
              {agent.agent_instructions}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
