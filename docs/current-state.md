# Current verified state — 28 October 2026

## Saved agents

Primary `3bedc40e-9f88-491a-ad87-952be647f59b`: Google Gemini 3.7 Flash. Backup `f7d6dccb-944e-42dc-80ef-69c786195c40`: OpenAI GPT-4.1. Both use conversation prompt **v14**, 500 output tokens, temperature 0.2, Sarvam Bulbul v3 Sumit, Deepgram nova-3, Hindi default, Asia/Kolkata, India routing.

The configured welcome is now neutral English: “Hello, this is Sauda calling for a customer about prices and availability. Is now a good time?” No upfront AI announcement; answer honestly if asked whether AI. Match clear Hindi/Hinglish/English after the seller speaks, ignoring isolated erroneous language tokens. Both prompts, welcomes and enabled hangup settings were verified after full reload. Dashboard names retain v3 for identity continuity; do not infer prompt version from the name.

Automatic hangup is enabled using `agents/hangup-prompt-v1.txt`. Call Summary remains enabled. Quote evidence uses extraction prompt v8 and GPT 5.4 Mini, Free Text with an outer-object regex. The backend must still parse and validate the JSON, evidence and arithmetic. No webhook, purchase/function tool or automatic failover configured.

## Live tests (consenting roleplay recipient only)

| Scenario | Model / prompt during call | Duration | Final cost | End |
|---|---|---|---|---|
| Five kurtas | Gemini / v9 | 145 s | $0.154 | Recipient hung up |
| Five kurtas comparison | GPT-4.1 / v10 | ~200 s | $0.286 | Recipient hung up |
| 32 Spider-Man watches | Gemini / v13 | 134 s | $0.160 | **Agent ended call** |

The watch call demonstrated product-independent offers: ₹740, ₹790, ₹820 per watch, not the kurta ladder of ₹4400/₹4700/₹4900. Seller quoted ₹830 each plus ₹80 delivery, arriving at Marine Drive by 3 November. Arithmetic gives ₹26,560 merchandise plus ₹80 = ₹26,640. Tax/other mandatory item charge inclusion was NOT explicitly confirmed: do not present this as a fully validated all-inclusive total. This is roleplay evidence, not a real shop quote. No order/reservation occurred.

Watch execution `2ad5aeb7-33d4-434e-b695-0352cc00f300` showed Hangup decided at 1:57.2, Hangup queued at 2:10.5, disconnect at 2:13.5; final table: Completed / Caller / Agent ended call. This verifies automatic phone disconnect after closing on that call. The final v14 revision changed language handling afterward and was text-tested, not phone-tested.

User feedback: first call slow/awkward pauses; backup about the same; watch test “quite good” but initially replied Hinglish to English. Actual watch transcript was English after the opening exchange and showed a stray Hindi token in the first consent. v14 now starts in English and ignores isolated transcription fragments. Both models passed a targeted `yeah yeah श्री` English-response test; primary also countered ₹740 in English afterward. Full historic suite was not rerun on v14.

Latency: first call LLM avg 2.34s / overall P90 3.80s; backup LLM avg 1.69s / overall P90 3.00s. This is not a controlled benchmark. User did not perceive an improvement; verbosity and repeated questions remain concerns, especially on backup. No claim of sub-second response or solved latency.

## Budget and scope

User authorized up to US$5 total for testing/prompt iterations. Starting displayed balance $9.97, latest refreshed $9.10: displayed reduction **$0.87**, subject to billing delay/rounding. No top-ups or subscriptions.

Watch request: 32 working children's Spider-Man watches, any working digital/analog child-appropriate type; ₹844 maximum per watch including item taxes/mandatory fees, so merchandise cap ₹27,008. Delivery may be additional; request free delivery first, then obtain a separate fee. No numeric delivery ceiling authorized, and quote-only mode does not authorize payment. Kurta request had a different, strictly-below all-inclusive cap. Never merge those budget scopes.

## Evidence and remaining risks

- Original extractor returned prose or unsupported AM/PM and price basis. Revised v8/GPT 5.4 Mini passed targeted unknown-basis/whole-quantity-total/time-ambiguity and known-total fixtures; it is not deterministic or universally validated.
- The first call's summary guessed AM while extraction guessed PM. Summaries and model confidence are not authoritative evidence.
- Both agents can close text sessions automatically. Backup v11 demonstrated the complete three-offer ladder and explicit English/Hinglish/Hindi switching. Primary v12 demonstrated automatic Hindi detection and quote-only auto-close. See versioned evidence; do not label all historic tests as v14.
- Backup blank-context handling was unreliable in earlier tests. A backend must reject incomplete requests BEFORE dialing/welcome audio.
- Repeated/compound questions and verbose recaps still occur. Unknown taxes/fees and exact product comparability require independent validation.
- No actual web app, call orchestration, webhook receiver, parallel calling, comparison UI, automatic failover, real-business discovery, purchase handling, or submission has been built/proved here.
- `tools/quote_plan.py` is a small arithmetic/offer preparation utility, not the missing backend. Its four tests cover watch/kurta scope, exact decimals, and rejected malformed input.

## Repository handoff

Work prepared in `codex/sauda-agent-tests-2026-10-28`, based on main `8b1fa7d4f15e6343c140c303cfb38ab855f3cd01`. Account must be `roanshdesai`; the active CLI had drifted back to `roansh-desai` and was corrected before this push. Verify identity again before future pushes.

Sanitized source pack and failed/successful test evidence are included. Full phone numbers, account email, credentials, raw screenshots and audio remain outside Git. Historic original README/context are archived, preserving team split while correcting unsupported current feature claims. No Pally messages during this continuation: user said Pally is down.

Next: implement complete input and quote-evidence validation, connect backend/webhooks, then build the request/results interface. Any further call should use a complete request and a consenting verified recipient within the remaining test budget. Further unrequested real-business calls or purchases are not authorized.
