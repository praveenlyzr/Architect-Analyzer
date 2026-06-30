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

## Access (password protected)

The live site is gated with AWS Amplify basic auth. This README is private, but
the deployed app is public, so the credentials are noted here for the team:

- **URL:** https://main.d26f6eu9be3g1n.amplifyapp.com/
- **Username:** `admin`
- **Password:** `architectroxx`

Basic auth is configured at the Amplify app + branch level (not in code). To
change or rotate it: _Amplify console → App settings → Access control_, or via
CLI with `aws amplify update-branch --enable-basic-auth --basic-auth-credentials <base64(user:pass)>`.

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
