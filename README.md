# Architect Analyzer

Inspect any **Architect** app from a single app id. Paste an id and the analyzer
pulls the app's live state from the Architect API and renders a full technical
dossier:

- **Product Requirements** — the full PRD, rendered from markdown
- **Agents** — role, goal, model, temperature, and system instructions
- **Workflow** — input → agent → output topology
- **Requirements & Planning conversations** — the chats that shaped the app
- **Build Log** — the event-by-event build timeline
- **Raw State** — the complete JSON payload

Built with Next.js (App Router) and deployed on AWS Amplify.

## Access (password protected, 8-hour sessions)

The live site is gated by an app-level login. This README is private, but the
deployed app is public, so the password is noted here for the team:

- **URL:** https://main.d26f6eu9be3g1n.amplifyapp.com/
- **Password:** `architectroxx`

A correct password sets a signed, HttpOnly session cookie that **expires after
8 hours** (`SESSION_TTL_MS` in `lib/auth.ts`); after that you're prompted again.
Next.js middleware (`middleware.ts`) enforces it on every route and API call.

Why not Amplify basic auth? HTTP Basic credentials are cached by the browser
with no expiry, so they can't satisfy the 8-hour requirement. This cookie-based
scheme can. Two env vars drive it:

| Variable      | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `APP_PASSWORD` | The login password (`architectroxx`)                          |
| `AUTH_SECRET`  | Random secret used to HMAC-sign session tokens (rotating it logs everyone out) |

To change the password, update the `APP_PASSWORD` env var in the Amplify console
(or via CLI) and redeploy.

## Security: the Memberstack token never reaches the browser

The Architect API requires a Memberstack bearer token. That token is **only**
read server-side, inside the API route at `app/api/app/[appId]/route.ts`, from
the `MEMBERSTACK_TOKEN` environment variable. The browser calls our own
`/api/app/:id` endpoint, which proxies to Architect with the token attached.
The token is never sent to the client, never inlined into the bundle, and the
`.env*` files are git-ignored.

## Local development

```bash
npm install
cp .env.example .env.local   # then paste your real token into .env.local
npm run dev                  # http://localhost:3000
```

`.env.local` (git-ignored):

```
MEMBERSTACK_TOKEN=your_memberstack_jwt_here
```

## Deploying to AWS Amplify

1. Push this repo to GitHub.
2. In the AWS Amplify console (or CLI), create a new app and connect the repo.
3. Amplify auto-detects Next.js; the included `amplify.yml` defines the build.
4. **Set the environment variable** `MEMBERSTACK_TOKEN` in
   _App settings → Environment variables_. This keeps the secret out of source
   control while making it available to the server runtime.
5. Deploy. Amplify builds the SSR app and hosts the API route as a serverless
   function.

### Optional environment variables

| Variable             | Default                          | Purpose                          |
| -------------------- | -------------------------------- | -------------------------------- |
| `MEMBERSTACK_TOKEN`  | _(required)_                     | Bearer token for the Architect API |
| `ARCHITECT_API_BASE` | `https://api.beta.architect.new` | Override the API base URL        |

## Project structure

```
app/
  layout.tsx              # fonts + global shell
  page.tsx                # analyzer UI
  globals.css             # blueprint design system
  api/app/[appId]/route.ts # server-side token proxy
components/                # UI building blocks
lib/                       # types + formatting helpers
amplify.yml                # Amplify build spec
```
