# Sauda workspace

React, TypeScript and Vite, using the existing same-origin FastAPI service. The approved public landing is unchanged.

## Run

From the repository root, use `./private/dev-backend.sh` and `./private/dev-frontend.sh`. Open `http://127.0.0.1:5173/#/workspace`. The access code is the local `SAUDA_API_TOKEN`; never put it in source, frontend environment variables, screenshots or logs. Authentication uses an eight-hour HttpOnly session, not browser storage.

Build with `npm run build` from `frontend/`. Vite retains the `/v1` proxy to port 8000.

## Interface

- Sign-in contains only the brand, access-code field, Continue and service errors.
- The workspace contains a searchable request list, New request and sign out. On phones, Requests returns from a saved request to the list.
- One inline form saves the existing request schema. Options holds strict-budget, additional delivery and extra recipients. Required fields remain visible. Recipient consent is never prechecked.
- Saving never calls anyone. Identical submission retries reuse an idempotency key; changed payloads receive their own keys.
- Saved details show actual request facts, call status and quote results. Native disclosures contain call options, quote breakdown, evidence, transcripts and nonbinding proposals.
- No eyebrow labels, promotional paragraphs, dashboard counters, activity/setup tabs or decorative call-progress stages remain.
- Warm stone and ink continue the public hero palette. `src/workspace.css` owns workspace styling; the obsolete desk, brief and call-room stylesheets were removed.

## Service and safety

`src/App.tsx` owns authentication, selection, list/search and five-second saved-state polling while visible. `components/workspace/RequestEditor.tsx` saves through `POST /v1/requests`; `RequestDetail.tsx` retains call creation and explicit provider refresh. `api.ts`, `types.ts` and backend contracts are unchanged.

Calls require backend readiness and explicit confirmation of consenting test recipients. The server still checks every number against its allowlist. Unknown dispatch warns against retrying. No live transcript or microphone activity is fabricated. Quote amounts remain extracted estimates, not seller agreement or orders; missing totals and fees remain unconfirmed.

No request-delete endpoint exists. Do not create disposable requests in the operator database for UI checks.

## Verification — 31 October 2026

- TypeScript and Vite production build passed.
- Browser smoke used the actual FastAPI application with temporary SQLite storage, ephemeral authentication and calls disabled. Its Vite proxy targeted that isolated backend; the operator database was not mutated.
- Verified invalid/valid login, HttpOnly cookie, empty local storage, past-date/invalid-phone/duplicate-phone/consent validation, real request persistence, exact budget and recipient fields, idempotent replay, search, logout and subsequent authenticated reload.
- Checked list, editor and saved-detail navigation at 360, 390, 768 and 1440px without horizontal document overflow. Desktop/mobile screenshots were inspected in ignored `private/workspace-review/`.
- Actual operator-service sign-in and request reads also passed without saved-data mutation or call POSTs.
- No calls were placed, calling settings changed, credentials exposed, push performed or backend code changed.
- The operator service had no saved quotes. Populated quote/evidence/transcript rendering and enabled-call dispatch were not exercised; no live audio verification is claimed. Existing backend tests were not rerun for this frontend-only change.
- Temporary smoke servers, databases and scripts were removed after verification.
