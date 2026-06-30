"use client";

import type { Workflow, WorkflowNode } from "@/lib/types";

const CATEGORY: Record<
  string,
  { ring: string; glyph: string; label: string }
> = {
  input: { ring: "border-cyan/40 bg-cyan/10 text-cyan-bright", glyph: "→", label: "Input" },
  agent: { ring: "border-amber/40 bg-amber/10 text-amber", glyph: "◆", label: "Agent" },
  end: { ring: "border-green/40 bg-green/10 text-green", glyph: "■", label: "Output" },
};

function cat(node: WorkflowNode) {
  const key = (node.nodeCategory ?? node.type ?? "").toLowerCase();
  if (CATEGORY[key]) return CATEGORY[key];
  if (key.includes("agent")) return CATEGORY.agent;
  if (key.includes("input")) return CATEGORY.input;
  return CATEGORY.end;
}

/** Order nodes by following edges from the input node when possible. */
function orderNodes(wf: Workflow): WorkflowNode[] {
  const nodes = wf.nodes ?? [];
  const edges = wf.edges ?? [];
  if (!edges.length) return nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const targets = new Set(edges.map((e) => e.target));
  const start = nodes.find((n) => !targets.has(n.id)) ?? nodes[0];
  const out = new Map(edges.map((e) => [e.source, e.target]));
  const ordered: WorkflowNode[] = [];
  const seen = new Set<string>();
  let cur: WorkflowNode | undefined = start;
  while (cur && !seen.has(cur.id)) {
    ordered.push(cur);
    seen.add(cur.id);
    const next = out.get(cur.id);
    cur = next ? byId.get(next) : undefined;
  }
  nodes.forEach((n) => {
    if (!seen.has(n.id)) ordered.push(n);
  });
  return ordered;
}

export function WorkflowGraph({ wf }: { wf: Workflow }) {
  const nodes = orderNodes(wf);
  if (!nodes.length)
    return <p className="text-sm text-fg-dim">No workflow defined.</p>;

  return (
    <div className="rounded-2xl border border-hairline bg-panel/40 p-6">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:overflow-x-auto md:pb-2">
        {nodes.map((node, i) => {
          const c = cat(node);
          return (
            <div
              key={node.id}
              className="flex flex-col items-stretch gap-3 md:flex-row md:items-center"
            >
              <div className="min-w-[170px] rounded-xl border border-hairline bg-ink-2 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs ${c.ring}`}
                  >
                    {c.glyph}
                  </span>
                  <span className="label">{c.label}</span>
                </div>
                <div className="mt-2 text-sm font-medium text-fg">
                  {node.label ?? node.id}
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div className="flex items-center justify-center text-fg-dim md:px-1">
                  <span className="hidden md:inline font-mono">———▸</span>
                  <span className="md:hidden font-mono">▾</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
