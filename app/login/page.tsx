"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = params.get("next") || "/";
        router.replace(next);
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Login failed.");
        setLoading(false);
      }
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={submit}
        className="rise w-full max-w-sm rounded-3xl border border-hairline bg-panel/60 p-8 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan/40 bg-cyan/10 font-mono text-cyan-bright">
            ▲
          </div>
          <div className="font-mono text-sm uppercase tracking-[0.3em] text-fg-muted">
            Architect <span className="text-cyan-bright">Analyzer</span>
          </div>
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight text-fg">
          Restricted access
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Enter the password to continue. Your session lasts 8 hours.
        </p>

        <div className="relative mt-6">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-fg-dim">
            🔒
          </span>
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-hairline bg-ink-2 py-3.5 pl-11 pr-4 font-mono text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-cyan/60"
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose/40 bg-rose/5 px-3 py-2 text-xs text-rose">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-xl border border-cyan/50 bg-cyan/10 py-3.5 font-mono text-sm font-medium text-cyan-bright transition-all hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Verifying…" : "Enter →"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
