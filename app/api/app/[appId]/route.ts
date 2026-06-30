import { NextRequest, NextResponse } from "next/server";

// This route runs ONLY on the server. The Memberstack token is read from a
// server-side environment variable and is never exposed to the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE =
  process.env.ARCHITECT_API_BASE ?? "https://api.beta.architect.new";

const APP_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appId: string }> },
) {
  const { appId } = await params;

  if (!APP_ID_RE.test(appId)) {
    return NextResponse.json(
      { error: "Invalid app id format." },
      { status: 400 },
    );
  }

  const token = process.env.MEMBERSTACK_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Server is not configured: MEMBERSTACK_TOKEN is missing. Set it as an environment variable.",
      },
      { status: 500 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${API_BASE}/api/v1/apps/${encodeURIComponent(appId)}/state`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the Architect API." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Architect API returned ${upstream.status}.`,
        detail: detail.slice(0, 500),
      },
      { status: upstream.status },
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
