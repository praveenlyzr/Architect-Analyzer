"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { relTime } from "@/lib/format";
import { Markdown } from "./Markdown";

const COLLAPSE_LEN = 600;

function Bubble({ msg }: { msg: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const isUser = (msg.sender ?? "").toLowerCase() === "user";
  const content = msg.content ?? "";
  const long = content.length > COLLAPSE_LEN;
  const shown = !long || expanded ? content : content.slice(0, COLLAPSE_LEN) + "…";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`label ${isUser ? "text-cyan" : "text-amber"}`}
          >
            {isUser ? "User" : "Architect"}
          </span>
          {msg.timestamp && (
            <span className="font-mono text-[0.65rem] text-fg-dim">
              {relTime(msg.timestamp)}
            </span>
          )}
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            isUser
              ? "border-cyan/25 bg-cyan/5"
              : "border-hairline bg-panel/60"
          }`}
        >
          <Markdown>{shown}</Markdown>
          {long && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-2 font-mono text-xs text-cyan-bright hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  if (!messages?.length)
    return <p className="text-sm text-fg-dim">No messages.</p>;
  return (
    <div className="space-y-5">
      {messages.map((m, i) => (
        <Bubble key={m.id ?? i} msg={m} />
      ))}
    </div>
  );
}
