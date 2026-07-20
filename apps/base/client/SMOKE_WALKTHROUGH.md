# fn-49 Cutover Smoke Walkthrough

Tracked checklist for the manual end-to-end validation that every user flow
works against the local Python FastAPI backend after the TypeScript Hono cutover
(epic `fn-49-adapt-client-to-python-fastapi-backend`).

> **Gate scope.** The 8-flow checklist below is a **pre-merge user gate**, not an
> epic-close acceptance criterion. The epic closes when all engineering
> acceptance is met (code, types, tests, docs, automated contract probes — see
> below). The user runs this walkthrough in a real browser before merging the PR
> because flows like the indoor S3 upload, AI workflow execution, and Cognito
> signup flow cannot be exercised by an autonomous agent without real Cognito
> credentials and a browser.

## Automated contract validation (epic-close evidence)

Evidence captured at task close on 2026-04-07 by running the Python API locally
on `:9000` and exercising the smoke contract suite + a couple of curl probes:

- ✅ `bun run test` — full monorepo green
- ✅ `bun run --cwd apps/base/client test` — 23 passing (api/auth/envelope tests)
- ✅ `bun run --cwd packages/primitives/indoor-analysis test:run` — 71 passing
- ✅ `bun run --cwd packages/primitives/ground-materials test:run` — 58 passing
- ✅ `bun run build` — client + workspaces build clean (no `@api/*` imports)
- ✅ `SMOKE=1 bun run --cwd apps/base/client test:smoke` — 2 passed, 2 skipped
  (skipped probes need a real Bearer; covered by the manual gate below)
  - `GET /` returns `{"status":"ok"}`
  - `GET /openapi.json` returns FastAPI spec with `paths` field
- ✅ `GET /openapi.json` confirms every route the client targets exists:
  `/auth/{signup,signin,signin/challenge,refresh,signout,social/google}`,
  `/user/profile`, `/infrared/{buildings,weather/*,analyses/run}`,
  `/indoor/{presign,confirm,run}`, `/ai-workflows/*`,
  `/ground-materials/{registry,collect,clean,collect-and-process}`, `/map/*`
- ✅ Error envelope shape: `POST /infrared/buildings` without auth returns
  `{"error":"Missing Authorization header"}` (HTTP 401) — confirms the
  Python `{error}` envelope `lib/api-error.ts` parses

## Prereqs

```bash
# Terminal 1 — Python API
cd apps/base/api-python && uvicorn src.main:app --reload --port 9000

# Terminal 2 — client (Vite proxy will forward /api/* → http://127.0.0.1:9000)
bun run dev
```

## Manual flows (pre-merge user gate)

Walk through each flow in the running app and tick the box. Note any issues
inline next to the box. The PR for this epic must NOT be merged until every
box below is ticked OR the failure is documented as out of scope. These flows
are deliberately left for the user — they require real Cognito credentials, a
browser session, S3 CORS hand-off, and the AI backend, none of which an
autonomous agent can drive end-to-end.

- [ ] **1. Auth** — signup → signin → refresh on 401 (let token expire or
  invalidate manually) → signout → profile fetch
- [ ] **2. Buildings on map** — load `/map`, verify deck.gl building layer
  renders
- [ ] **3. Weather** — open analysis panel, verify weather data loads
- [ ] **4. Analysis run** — small extent + short date range → wait for
  completion → results render
- [ ] **5. Indoor** — upload a small IFC, confirm, run daylight-factor analysis,
  heatmap renders on `/interior` (watch for S3 CORS errors in console)
- [ ] **6. AI workflows** — list workflows, execute one, status polling →
  terminal status. Image Bearer gate is expected and unchanged.
- [ ] **7. Ground materials** — registry view works; draw/collect shows the
  friendly "temporarily unavailable" notice (no raw JSON toast)
- [ ] **8. Error UX** — trigger a deliberate 422 (e.g. invalid analysis input)
  and verify the toast renders a readable message from `ApiError.message`,
  not raw JSON

## Reproducing the automated validation locally

```bash
bun run test                              # whole monorepo — all packages green
bun run --cwd apps/base/client test       # 23 passing (api/auth/envelope tests)
bun run --cwd packages/primitives/indoor-analysis test:run    # 71 passing
bun run --cwd packages/primitives/ground-materials test:run   # 58 passing
bun run --cwd apps/base/client test:smoke # default: 4 skipped (no SMOKE=1)
bun run build                             # client + workspaces build clean
```

## Smoke contract suite (opt-in, requires API running)

```bash
# In a third terminal, with the Python API up on :9000:
SMOKE=1 SMOKE_BEARER=<id-token> bun run --cwd apps/base/client test:smoke
```

See `apps/base/client/README.md` for details on `SMOKE_BEARER` and
`SMOKE_BASE_URL`.

## Out-of-scope follow-ups discovered during the epic

| Item | Discovered in | Status |
|------|--------------|--------|
| AI workflow image responses gated behind Bearer (pre-existing in TS API too) | task 4 audit | Out of scope — separate fix epic |
| CloudFront `OriginReadTimeout` for analysis path | task 4 audit | Already 180s in `apps/base/api-python/serverless.yml:137` — no action needed |
| S3 bucket CORS for indoor presigned POST | task 4 walkthrough | TBD during walkthrough — file follow-up if broken |
| `forge-kit-feature` skill + `references/api-patterns.md` rewrite for Python | task 5 docs sync | TODO markers added; separate doc-only epic to rewrite |

## Ownership

Last verified: _pending walkthrough_
Verified by: _pending_
