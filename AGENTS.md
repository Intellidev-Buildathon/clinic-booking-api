# Notes for coding agents

This repo is a reference client for `clinic-booking-app`. Do not change API
behaviour here: change it in `clinic-booking-app` first, then mirror the types.

## Workflow

- Every change needs tests.
- Run `pnpm typecheck && pnpm test` before every commit; both must pass.

## Commits

- Conventional commits: `type(scope): description`, imperative, lower case, no trailing period.
- Scope is the area touched (`types`, `client`, `repo`, `readme`), not a filename.
- Bodies are `- ` bullet points, not prose.

## Code conventions

- Use the global `fetch`; no HTTP libraries. The server side stays on `node:http`.
- Import local files with the `.ts` extension and only use erasable TypeScript syntax.
- Money is always integer **paise**. Times are **UTC** ISO strings, shown to users in **Asia/Kolkata**.
- Patient data stays in India; never send it to services hosted outside India.
- No new dependencies without a clear reason stated in the commit body. Pin exact versions.
