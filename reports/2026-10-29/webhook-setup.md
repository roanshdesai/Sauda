# Webhook setup — 29 October 2026

Both existing agents now use the user's temporary Cloudflare tunnel, path `/v1/webhooks/bolna`, with the existing private `X-Sauda-Webhook-Secret` header. The URL and credential are intentionally omitted from this public report. No agents were created.

- Primary and backup: saved via the dashboard, independently retrieved with `GET /v2/agent/{id}` and compared to private pre-change snapshots.
- Changed fields on both: `webhook_url`, `webhook_headers`, `updated_at`. Prompt and task structures unchanged.
- Local backend restarted with the verified Bolna key; authenticated configuration endpoint confirms the provider is configured.
- Public health endpoint: HTTP 200, Sauda backend identity.
- Public webhook without header: HTTP 401.
- Public webhook with matching header and an unknown valid UUID: HTTP 404; no execution adopted.
- Backup dashboard **Send test**: reached the backend, passed header authentication, returned HTTP 422 (`Webhook must contain a valid execution id`). The sample is not an actual tracked call and was not accepted as one.

No call placed or new call charges incurred during setup. Live calling remains disabled, and no recipient was added to the allowlist. A real backend-originated call and its completed webhook still need testing. No API implementation changed, so the existing 51-test result remains the code baseline rather than a new test run.

This is temporary local hosting, not deployment. The Mac, backend and tunnel process must remain running; replacing the tunnel requires updating both agents. Private snapshots and cropped secret-free UI proof remain under ignored `private/webhook-setup-2026-10-29/`.
