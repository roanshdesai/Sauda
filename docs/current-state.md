# Current verified state — 29 October 2026

## Saved agents

Primary `3bedc40e-9f88-491a-ad87-952be647f59b`: Google Gemini 3.7 Flash. Backup `f7d6dccb-944e-42dc-80ef-69c786195c40`: OpenAI GPT-4.1. Both use conversation prompt **v15**, 500 output tokens, temperature 0.2, Sarvam Bulbul v3 Sumit, Deepgram nova-3, English default with native en/hi audio profiles, Asia/Kolkata, India routing.

Current welcome: “Hello, this is Sauda calling for a customer about prices and availability. Would you prefer English, Hindi, or Hinglish?” No upfront AI announcement; answer honestly if asked whether AI. Establish a language at the opening, retain it through offers/closing, and switch only on an explicit request. Hinglish is a conversational style on the Hindi audio profile. Both published rich-text compositions, fallback prompts and en/hi profiles were verified with fresh API reads; LLM, extraction, hangup and webhook configuration were preserved. **v15 phone audio has not been retested.** Dashboard names retain v3 for identity continuity.

Automatic hangup is enabled using `agents/hangup-prompt-v1.txt`. Call Summary remains enabled. Quote evidence uses extraction prompt v8 and GPT 5.4 Mini, Free Text with an outer-object regex. The backend must still parse and validate the JSON, evidence and arithmetic. Authenticated webhooks are configured on both agents as of 29 October; no purchase/function tool or automatic failover is configured.

## Live tests (consenting roleplay recipient only)

| Scenario | Model / prompt during call | Duration | Final cost | End |
|---|---|---|---|---|
| Five kurtas | Gemini / v9 | 145 s | $0.154 | Recipient hung up |
| Five kurtas comparison | GPT-4.1 / v10 | ~200 s | $0.286 | Recipient hung up |
| 32 Spider-Man watches | Gemini / v13 | 134 s | $0.160 | **Agent ended call** |
| 32 watches, backend + webhook | Gemini / v14 | 114 s | $0.1325 | **Agent ended call** |

The watch call demonstrated product-independent offers: ₹740, ₹790, ₹820 per watch, not the kurta ladder of ₹4400/₹4700/₹4900. Seller quoted ₹830 each plus ₹80 delivery, arriving at Marine Drive by 3 November. Arithmetic gives ₹26,560 merchandise plus ₹80 = ₹26,640. Tax/other mandatory item charge inclusion was NOT explicitly confirmed: do not present this as a fully validated all-inclusive total. This is roleplay evidence, not a real shop quote. No order/reservation occurred.

Watch execution `2ad5aeb7-33d4-434e-b695-0352cc00f300` showed Hangup decided at 1:57.2, Hangup queued at 2:10.5, disconnect at 2:13.5; final table: Completed / Caller / Agent ended call. This verifies automatic phone disconnect after closing on that call. That was the v13 call; v14 was subsequently phone-tested through the backend on 29 October.

User feedback: first call slow/awkward pauses; backup about the same; watch test “quite good” but initially replied Hinglish to English. Actual watch transcript was English after the opening exchange and showed a stray Hindi token in the first consent. v14 started in English and ignored isolated transcription fragments, but the user again reported Hinglish audio during the 29 October test despite an English saved transcript. Both agents were still using Hindi-only audio profiles. v15 now selects a language at the opening and adds native English/Hindi profiles; the suspected cause is not yet proven by a phone retest. Both models passed a targeted `yeah yeah श्री` English-response test; primary also countered ₹740 in English afterward. Full historic suite was not rerun on v14.

Latency: first call LLM avg 2.34s / overall P90 3.80s; backup LLM avg 1.69s / overall P90 3.00s. This is not a controlled benchmark. User did not perceive an improvement; verbosity and repeated questions remain concerns, especially on backup. No claim of sub-second response or solved latency.

## Budget and scope

User authorized up to US$5 total for testing/prompt iterations. Starting displayed balance $9.97, latest refreshed $8.93 after the 29 October language text tests: displayed reduction **$1.04**, subject to billing delay/rounding. No top-ups or subscriptions.

Watch request: 32 working children's Spider-Man watches, any working digital/analog child-appropriate type; ₹844 maximum per watch including item taxes/mandatory fees, so merchandise cap ₹27,008. Delivery may be additional; request free delivery first, then obtain a separate fee. No numeric delivery ceiling authorized, and quote-only mode does not authorize payment. Kurta request had a different, strictly-below all-inclusive cap. Never merge those budget scopes.

## Backend implementation (28 October continuation)

`backend/` now supplies FastAPI request validation, Decimal offer generation, SQLite request/call persistence, explicit primary/backup selection, bounded concurrent dispatch, per-request/seller duplicate-call protection, authenticated webhooks verified by provider refetch, status refresh, uncertain-call reconciliation and aggregate quote assessments. See [backend guide](backend.md) for setup and API contracts. Live dialing defaults off and requires a server key plus a consenting-recipient allowlist. One backend-originated live roleplay and the final authenticated webhook are now verified. The new React workspace displays saved requests, progress, quotes and transcripts, with protected operator sessions and explicit call controls.

On 29 October, the backend restarted with the verified private Bolna key. Both existing agents saved the user's temporary Cloudflare tunnel URL and matching `X-Sauda-Webhook-Secret`; fresh API reads showed only webhook URL, webhook headers and update timestamp changed. Prompts/tasks were unchanged. Public checks returned 401 without the secret and 404 for an authenticated unknown UUID. Bolna's dashboard Send test reached the endpoint and returned 422 because its sample execution ID was invalid. This proves public routing and header delivery, not an accepted real-call result. After one supervised live call, live calling was disabled again; the private allowlist contains only the consenting user. The tunnel depends on the user's running Mac/process and its URL must be updated after replacement. See [setup verification](../reports/2026-10-29/webhook-setup.md).

Quotes remain marked for review. Schema and seller-substring checks do not prove semantic agreement, fee inclusion or comparable variants. No automatic recommendation, savings or verified inclusive total is emitted. Backend arithmetic checks cannot intercept a hosted voice agent's spoken commitments. No hard real-time dollar-spend limiter is implemented.

## Evidence and remaining risks

- Original extractor returned prose or unsupported AM/PM and price basis. Revised v8/GPT 5.4 Mini passed targeted unknown-basis/whole-quantity-total/time-ambiguity and known-total fixtures; it is not deterministic or universally validated.
- The first call's summary guessed AM while extraction guessed PM. Summaries and model confidence are not authoritative evidence.
- Both agents can close text sessions automatically. Backup v11 demonstrated the complete three-offer ladder and explicit English/Hinglish/Hindi switching. Primary v12 demonstrated automatic Hindi detection and quote-only auto-close. See versioned evidence; do not label all historic tests as v14.
- Backup blank-context handling was unreliable in earlier tests. A backend must reject incomplete requests BEFORE dialing/welcome audio.
- Repeated/compound questions and verbose recaps still occur. Unknown taxes/fees and exact product comparability require independent validation.
- A working React UI and a backend-originated roleplay are verified. Multi-shop quote selection is implemented but not tested with multiple live calls. No automatic failover, real-business discovery, purchase handling, stable hosting or submission is implemented/proved here.
- `tools/quote_plan.py` remains the small arithmetic utility reused by the backend; its original four tests cover watch/kurta scope, exact decimals and rejected malformed input.

## Repository handoff

Work prepared in `codex/sauda-agent-tests-2026-10-28`, based on main `8b1fa7d4f15e6343c140c303cfb38ab855f3cd01`. Account must be `roanshdesai`; the active CLI had drifted back to `roansh-desai` and was corrected before this push. Verify identity again before future pushes.

Sanitized source pack and failed/successful test evidence are included. Full phone numbers, account email, credentials, raw screenshots and audio remain outside Git. Historic original README/context are archived, preserving team split while correcting unsupported current feature claims. No Pally messages during this continuation: user said Pally is down.

Latest branch: `codex/sauda-live-test-ui`, based on merged main `2ae7afc62eb736ce7ea6d761e5cb52a0824b5105` (PR #1). The earlier branch paragraph describes the original export. See [latest report](../reports/2026-10-29/live-backend-and-ui.md) and [UI guide](ui.md) for this continuation.

Next: phone-test v15 with the user selecting English and then separate Hindi/Hinglish openings. Review the UI with the user, replace the temporary tunnel with stable hosting, and record the demo. Strengthen semantic evidence review before automatic recommendations. Further calls require a complete request and a consenting verified recipient within the remaining test budget; no unrequested real-business calls or purchases.
