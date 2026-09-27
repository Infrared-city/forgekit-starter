# CLAUDE.md

The full guide for AI coding tools is in AGENTS.md (the same text serves
Claude Code, Codex, Cursor and others):

@AGENTS.md

Short version: start in `apps/examples`; the API key lives only in
`apps/base/api/.dev.vars`; all SDK traffic goes through the Worker proxy
(`/infrared/*` and `/infrared/s3-proxy/*`); every run costs AItokens, so
check the cost first; pass buildings / trees / ground to the run explicitly.

**Never deploy an open Worker:** it spends the owner's tokens for anyone with
the URL. Before any deploy, `APP_PASSWORD` (Worker secret) and
`ALLOWED_ORIGINS` must be set, or Cloudflare Access must protect it. If not,
stop and warn the user. The Worker fails closed (503 without
`APP_PASSWORD`); never weaken that, and never put
`ALLOW_OPEN_PROXY_FOR_LOCAL_DEV` in `wrangler.toml`.
