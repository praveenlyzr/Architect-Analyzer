"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { relTime } from "@/lib/format";

const TYPE_STYLE: Record<string, { color: string; glyph: string }> = {
  User: { color: "text-cyan-bright", glyph: "✎" },
  Architect: { color: "text-amber", glyph: "◆" },
  Status: { color: "text-fg-dim", glyph: "•" },
  Write: { color: "text-green", glyph: "↳" },
  Read: { color: "text-fg-muted", glyph: "↲" },
  Agent: { color: "text-amber", glyph: "◇" },
  Tasks: { color: "text-cyan", glyph: "☑" },
  Session: { color: "text-cyan", glyph: "❖" },
  System: { color: "text-fg-dim", glyph: "⚙" },
  Workflow: { color: "text-amber", glyph: "⇄" },
  Activity: { color: "text-fg-muted", glyph: "∿" },
  Commit: { color: "text-green", glyph: "⎇" },
};

function styleFor(type?: string) {
  if (type && TYPE_STYLE[type]) return TYPE_STYLE[type];
  return { color: "text-fg-muted", glyph: "•" };
}

function metaDetail(m: ChatMessage): string | null {
  const meta = m.metadata ?? {};
  const tool = meta["tool_name"];
  const input = meta["tool_input"];
  if (typeof tool === "string") {
    if (input && typeof input === "object") {
      const path = (input as Record<string, unknown>)["file_path"] ??
        (input as Record<string, unknown>)["path"];
      if (typeof path === "string") return `${tool} · ${path}`;
    }
    return tool;
  }
  return null;
}

export function BuildLog({ messages }: { messages: ChatMessage[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!messages?.length)
    return <p className="text-sm text-fg-dim">No build activity recorded.</p>;

  const LIMIT = 18;
  const visible = showAll ? messages : messages.slice(0, LIMIT);

  return (
    <div>
      <div className="relative ml-2 border-l border-hairline pl-6">
        {visible.map((m, i) => {
          const s = styleFor(m.type);
          const detail = metaDetail(m);
          const content = (m.content ?? "").trim();
          return (
            <div key={m.id ?? i} className="relative pb-5 last:pb-0">
              <span
                className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border border-hairline bg-ink font-mono text-[0.6rem] ${s.color}`}
              >
                {s.glyph}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={`label ${s.color}`}>{m.type ?? "Event"}</span>
                {m.timestamp && (
                  <span className="font-mono text-[0.6rem] text-fg-dim">
                    {relTime(m.timestamp)}
                  </span>
                )}
              </div>
              {detail && (
                <div className="mt-0.5 font-mono text-xs text-cyan/80">
                  {detail}
                </div>
              )}
              {content && content !== m.type && (
                <div className="mt-1 line-clamp-3 text-sm text-fg-muted">
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {messages.length > LIMIT && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 rounded-lg border border-hairline bg-ink-2 px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors hover:border-cyan/50 hover:text-cyan-bright"
        >
          {showAll
            ? "Collapse"
            : `Show all ${messages.length} events`}
        </button>
      )}
    </div>
  );
}
