# Render Free + Neon Free

The `Dockerfile` builds Aashu's frontend and serves it with the FastAPI backend on
one origin. Requests, call reservations and quote results live in PostgreSQL, so
Render restarts do not erase them. Local development still supports SQLite.

## Accounts and initial setup

Use the owner's personal account, **roanshdesai@gmail.com**, for both services.
The GitHub repository is **roanshdesai/Sauda**, not the hyphenated account.

1. Create a dedicated **Free** Neon project named `sauda`. Prefer Singapore when
   available to match Render. Copy its pooled PostgreSQL connection URL privately;
   retain `sslmode=require` and `channel_binding=require`.
2. Create a Render Blueprint from this repository and the deployment branch using
   `render.yaml`. It selects a **Free** Docker web service in Singapore. Do not add
   a Render database or paid disk. Automatic deploys are disabled.
3. Set `DATABASE_URL` to the Neon URL. The Blueprint generates separate operator
   and webhook secrets. Keep these values private. `SAUDA_API_TOKEN` is the
   workspace access code; it must not appear in frontend configuration.
4. Enter the existing `BOLNA_API_KEY` and consenting `SAUDA_ALLOWED_NUMBERS` only
   into Render's private environment settings. Leave `SAUDA_LIVE_CALLS_ENABLED=false`
   until an explicitly approved test. These variables may be empty for UI-only setup.
5. Deploy and verify `/health`, `/`, `/sculpture/light.webp`, protected `/v1/config`,
   and an HTTPS workspace login. Save a fictional request, restart the service,
   and verify that the request survives.
6. Once the hosted service is verified, set both existing Bolna agents' extraction
   webhook URL to `https://<service>.onrender.com/v1/webhooks/bolna`, with
   `X-Sauda-Webhook-Secret` set to the new Render secret. Do not recreate the agents.
   A new authorized call and its final webhook are required to prove hosted end-to-end flow.

The cloud database starts empty. This setup does not upload the private local
SQLite database, call transcripts or recordings. They remain in ignored `private/`.

## Operational boundaries

Render's free service sleeps after inactivity; the first request can be slow.
Open the site before a demo. Neon can also suspend compute when idle. This setup
is intended for the Buildathon, not an availability guarantee. Check the providers'
current free-plan limits before enabling broader use.

The app refuses SQLite when Render's `RENDER=true` environment marker is present.
The Docker command trusts proxy headers because Render terminates HTTPS at its
proxy. Do not expose that same command directly to untrusted clients without a
trusted reverse proxy; restrict forwarded-header trust for other hosting environments.

PostgreSQL read/modify/write operations use a short transaction-level advisory
lock, equivalent to SQLite's single-writer behavior. All writers use the same lock;
provider calls happen only after reservation commits. This is deliberately simple
for a single-operator demo. It works with transaction pooling. Database connections
close after each operation, and automatic prepared statements are disabled.

Never redial a request with `dispatch_unknown` to fix a database or network error.
Reconcile it against provider history first. Turning live calls off prevents new
dispatches and does not disconnect an already accepted provider call.

## Verification

```sh
uv sync --frozen
uv run pytest -q
uv run ruff check backend tests
cd frontend
npm ci
npm run build
```

To run the real PostgreSQL integration suite as well, set
`SAUDA_TEST_POSTGRES_URL` to a **disposable test database** and run `uv run pytest -q`.
Tests create isolated random schemas and remove those schemas afterward. Never use
production database credentials. The suite covers concurrent request idempotency,
single call reservations, rollback, reconciliation, terminal status ordering and
the backend API with a fake phone provider; it does not dial real numbers.

Sources: [Render free limits](https://render.com/docs/free),
[Blueprint fields](https://render.com/docs/blueprint-spec),
[Neon connections](https://neon.com/docs/connect/connect-from-any-app).
