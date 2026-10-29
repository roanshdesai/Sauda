# Backend v0.1

FastAPI + SQLite, Python 3.13. This is a single-operator backend for consented roleplay calls using the two existing agents. It provides request intake, deterministic offer plans, bounded concurrent dispatch, saved progress and quote assessments. It does not create agents or make purchases.

## Run locally

Install [uv](https://docs.astral.sh/uv/), then run from the repository root:

```sh
uv sync --frozen
cp .env.example .env
uv run python -c 'import secrets; print(secrets.token_urlsafe(32))'
```

Generate two different secrets. Put one in `SAUDA_API_TOKEN`, the other in `SAUDA_WEBHOOK_SECRET` in ignored `.env`. Leave `SAUDA_LIVE_CALLS_ENABLED=false`. Start:

```sh
uv run --env-file .env uvicorn backend.app:create_app --factory --host 127.0.0.1 --port 8000 --no-access-log
```

Open **http://127.0.0.1:8000/docs** for the interactive API. Click Authorize and enter the operator token. Health and API documentation are public; request, call, configuration and transcript endpoints require authentication. The operator token belongs only in a trusted operator client, never a public frontend bundle. There is no multi-user account isolation yet.

## Request contract

`POST /v1/requests` requires an `Idempotency-Key` header (8–128 characters). Reusing a key with identical normalized input returns the existing request; changing input returns 409. Creating or previewing a request never places a call.

Example body (the number is reserved fictional test data, not a live recipient; use a future date):

```json
{
  "item": "Spider-Man watches",
  "variant": "Any working children's wristwatch",
  "quantity": 32,
  "currency": "INR",
  "budget": {
    "amount_inr": "844.00",
    "basis": "unit",
    "delivery": "additional",
    "comparison": "at_most"
  },
  "fulfilment": "delivery",
  "area": "Marine Drive, Mumbai",
  "required_by": "2026-11-03",
  "sellers": [{"name": "Fictional test shop", "phone": "+12025550123"}],
  "mode": "consented_roleplay"
}
```

Budget `basis` is `unit` or `total`; `comparison` is `under` (strict) or `at_most`. `delivery` is `included` or `additional`, with `included` required for pickup. A total cap is divided downward to the nearest paise for offer preparation. Delivered offers with an inclusive cap use whole-order amounts. Extra delivery has no invented spending ceiling. Up to five distinct seller numbers per request. Currency is INR only. Dates use Asia/Kolkata and are checked again before dialing. Exact addresses are unnecessary for quotes.

Money is represented as decimal strings in request/planner responses, avoiding binary float arithmetic. Agent extraction v8 still requires JSON numbers/null and is checked accordingly. Phone numbers must be E.164. Blank/unresolved fields, non-positive or over-precision money, duplicate recipients, past dates, unknown keys and invalid quantities are rejected.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/v1/config` | Readiness flags and existing agent IDs; never credentials |
| POST | `/v1/requests` | Validate and persist a request + offer plan |
| GET | `/v1/requests/{id}` | Request, saved calls, aggregate progress and quote assessments |
| POST | `/v1/requests/{id}/preview` | Generate per-shop context; body `{"agent":"primary"}` or `backup` |
| POST | `/v1/requests/{id}/calls` | Explicit dispatch with the same agent selection |
| POST | `/v1/calls/{id}/refresh` | Poll authoritative Bolna state; no redial |
| POST | `/v1/calls/{id}/reconcile` | Attach a verified execution to an uncertain dispatch; body `{"execution_id":"UUID"}` |
| POST | `/v1/webhooks/bolna` | Receive notifications with `X-Sauda-Webhook-Secret` |

Call dispatch waits for the individual API responses, bounded by `SAUDA_DISPATCH_CONCURRENCY` (default 2, per process). This bounds dispatch HTTP requests, not the number of conversations simultaneously active in Bolna. Run one worker for the initial demo. Bolna's account limits still apply. A failed shop does not discard another shop's successful dispatch.

## Connect Bolna when ready

1. Add the Bolna API key to ignored `.env`; never commit it.
2. Put only verified, consenting test recipients in `SAUDA_ALLOWED_NUMBERS`, comma-separated.
3. Set `SAUDA_LIVE_CALLS_ENABLED=true` and restart when deliberately testing paid calls. No API calls are made at startup.
4. Deploy behind HTTPS with a persistent private SQLite volume, one worker, ingress request/rate limits and protected operator access. The local server is not a public deployment.
5. In **each existing agent → Extractions → Webhook Configuration**, set the public URL ending `/v1/webhooks/bolna`. Use **Add headers** to set `X-Sauda-Webhook-Secret` to the separate secret, enable relevant statuses, and save each agent. Do not put secrets in the URL. Configure proxy/application logs to omit bodies and authorization headers.
6. Preview the complete request, then start an explicitly authorized roleplay call. Verify an actual webhook and final `completed` record. The backend integration has only been tested with a mocked provider so far.

Until a public endpoint is configured, the operator can call `/refresh` to fetch execution status. The frontend can poll the saved request. The service does not run an automatic polling worker or stream live transcripts.

API contracts checked against official Bolna documentation:

- [Make a call](https://www.bolna.ai/docs/api-reference/calls/make): `POST /call`, `user_data.request_context`, returned `execution_id`.
- [Retrieve an execution](https://www.bolna.ai/docs/api-reference/executions/get_execution): `GET /executions/{id}`; wait for `completed`; `total_cost` is stored as provider cents.
- [Webhooks](https://www.bolna.ai/docs/post-call/polling-call-status-webhooks): custom headers and execution-shaped payloads.

## Duplicate calls and recovery

Before sending a paid call, a SQLite transaction permanently reserves one attempt per request/seller. Repeated start requests return the saved calls. Selecting a different agent after starting is rejected. There is no automatic redial, provider POST retry or backup failover.

An explicit provider 4xx rejection becomes `rejected`. Timeouts, invalid responses or server failures become `dispatch_unknown`: Bolna may already have placed the call. A process crash may leave `dispatching`. **Never delete these records or replay the POST to recover.** Inspect Bolna history first. Use `/reconcile` with the execution ID only when the retrieved agent, recipient and injected `sauda_call_id` match. If Bolna does not return that correlation field, the endpoint deliberately refuses to guess; investigate manually. A callback arriving before dispatch saves the ID gets 404; refresh/reconcile handles missed notifications.

Webhook body fields never directly overwrite saved status or quotes. After checking the secret and known execution ID, the backend fetches Bolna's execution with the server-side key and checks its agent/recipient. Repeated final payloads do not duplicate quotes. Late intermediate states cannot overwrite a terminal result. Provider failures retain previous saved results.

## Quote assessment boundaries

- Parse exactly one named `quote_evidence_json`, including category/subjective wrappers. Ignore summaries.
- Validate the complete v8 schema and exact seller evidence substrings; an agent recap is not seller evidence.
- Independently calculate quoted quantity amounts with Decimal and flag potential ceiling violations. Never reinterpret unknown price basis, unavailable quantity or missing currency as valid.
- Unknown taxes, fees and delivery are not zero. The original watch test produces arithmetic estimates ₹26,560 and ₹26,640, but no verified inclusive total or savings.
- All extracted quotes currently require review and are ineligible for automatic recommendation. Exact substring matching does not prove that each numeric/variant claim is semantically supported. The v8 schema does not distinguish included taxes from unknown tax breakdowns. A richer evidence/reviewer workflow is needed before positive budget/comparability approval.
- Commitment flags and a small English phrase detector flag risks; they do not prove absence of commitments across all languages. This backend cannot intercept or guarantee every word spoken by the hosted voice agent.

## Data, spend and tests

SQLite stores private requests, phone numbers and completed transcripts under ignored `private/`. It does not persist provider recording URLs or injected context/log payloads. Protect the volume, manage retention before deployment and do not publish the database. Request-body limit is 1 MB. This is single-operator authentication, not a public multi-tenant service.

No hard dollar-spend limiter is implemented: final provider cost arrives after the call. The existing $5 testing authorization is an operator budget, not something this service can guarantee. Leave live calls off outside deliberate supervised tests. No real businesses have been called by this backend.

```sh
uv run pytest -q
uv run ruff check backend tests/test_backend.py
uv run ruff format --check backend tests/test_backend.py
```

Tests exercise the API through FastAPI's HTTP test client and Bolna's real request contract through `httpx.MockTransport`; all provider traffic is simulated. Covers validation, persistence, request/call idempotency, concurrent reservations, partial failures, uncertain dispatch, reconciliation, webhook auth/forgery/replay, terminal ordering, identity mismatch and conservative extraction handling.
