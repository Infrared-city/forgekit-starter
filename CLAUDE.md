# CLAUDE.md

See [AGENTS.md](./AGENTS.md) — the repo intro, the three-tier structure
(Core / Optional layer / Reference example), architecture rules, dev
commands, and deploy steps all live there. Read it before making structural
changes, especially before adding a dependency to `apps/base/api` or
`packages/sdk` (Core — keep minimal) versus `packages/primitives/*` or
`packages/interfaces/*` (Optional layer — fine to extend).
