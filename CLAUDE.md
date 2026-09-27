# CLAUDE.md

The full guide for AI coding tools is in AGENTS.md (the same text serves
Claude Code, Codex, Cursor and others):

@AGENTS.md

Short version: start in `apps/examples`; the API key lives only in
`apps/base/api/.dev.vars`; all SDK traffic goes through the Worker proxy
(`/infrared/*` and `/infrared/s3-proxy/*`); every run costs AItokens, so
check the cost first; pass buildings / trees / ground to the run explicitly.
