# Backend v0.1 verification — 28 October 2026

- `uv run pytest -q`: **51 passed**, plus 10 existing planner subtests. One upstream Starlette warning about its HTTPX test-client adapter; no failures.
- `uv run ruff check backend tests/test_backend.py`: passed.
- `uv run ruff format --check backend tests/test_backend.py`: passed.
- `git diff --check`: passed.
- Real local HTTP smoke against Uvicorn on loopback: health and OpenAPI returned 200, watch request persisted, preview returned ₹740 / ₹790 / ₹820 and ₹27,008 merchandise cap. Live-call endpoint returned 409 as configured. No provider calls.
- Provider-contract tests use `httpx.MockTransport`. Tests cover both existing agent IDs, multiple sellers, partial dispatch failure, duplicate/resumed requests, concurrent SQLite reservations, timeout recovery with correlation checks, webhook authorization and provider refetch, late events, missing/ambiguous extraction, price basis, strict ceilings and delivery scope.

## Not established by these checks

No backend-originated phone call, real external webhook delivery, public deployment, multi-user frontend, production concurrency or live spend cap has been verified. No Bolna API key is configured in the local environment. Both dashboard agents retain their existing settings.

Quote calculations are explicitly provisional and require review; the backend never emits an automatic recommendation, savings claim or verified inclusive total. The previous watches roleplay was an agent-dashboard test and must not be relabelled as a backend integration test.
