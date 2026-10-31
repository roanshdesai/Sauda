# Backend live test, language revision and workspace — 29 October 2026

## Supervised call through the backend

One call was placed to the user's verified, consenting test number via `POST /v1/requests/{id}/calls`, using the existing primary agent and prompt v14. No real business was contacted. The request was 32 working children's Spider-Man watches, maximum ₹844 per item including mandatory item charges, delivery additional if the seller would not waive it, to Marine Drive by 3 November.

| Evidence | Result |
|---|---|
| Request | `672f5225-5f85-4c54-b498-7400a794f873` |
| Call | `13b1e1f0-b38c-4479-b6df-eb3283c577e2` |
| Provider execution | `8922f60b-5dca-46ad-b40f-950e00eadbad` |
| Final status | Completed |
| Duration | 114 seconds |
| Termination | `agent_ended_call` |
| Provider cost | 13.25 cents = $0.1325 |
| First seller price | ₹912 per watch |
| Final seller price | ₹820 per watch + ₹76 delivery |
| Arithmetic estimate | ₹26,240 merchandise + ₹76 = ₹26,316 |

While waiting, only saved request GETs were polled. The record moved to in-progress and then completed automatically through the authenticated webhook; no manual refresh or direct execution fetch caused that transition. The final saved update timestamp was `2026-10-29T13:47:53.262775+00:00`. A provider fetch and later manual refresh were used only after completion to inspect evidence and re-evaluate whitespace handling.

Live calling was disabled again after the test. The allowlist retains only the consenting user. The provider's displayed balance was $8.97 after the call, versus the original $9.97 baseline, approximately $1.00 used at that point. After the v15 text tests, a reload showed $8.93: approximately $1.04 used against the authorized $5 ceiling, subject to delayed billing/rounding. No funds were added. Full recipient, credentials, recording URL and execution payload remain in ignored private files.

## Evidence correction

One valid seller excerpt had a single space where the transcript contained two. Evidence matching now collapses whitespace on both sides while preserving words, order and seller-turn boundaries. Regression checks reject agent-only evidence and changed wording. After refreshing the completed record, that false missing-evidence flag disappeared. Tax/fee inclusion, item comparability and semantic agreement still require review; no verified inclusive total, savings or automatic recommendation is emitted.

## Language feedback and v15

The user heard Hinglish after speaking English. The saved v14 transcript contains English, which does not disprove their audio feedback. Inspection found that both agents had only Hindi transcription/voice configuration despite the English prompt. This is a likely contributing cause, not a confirmed audio diagnosis.

Both existing agents were updated in place with:

- An opening asking whether to use English, Hindi or Hinglish.
- Prompt v15: choose once at the beginning; keep the selected style for offers, questions, recap and goodbye; change only when explicitly requested. Incidental Hindi words do not change an English conversation.
- Native English and Hindi profiles, English active/default, Sumit/Bulbul v3 on both, and `caller_requested` switching. Hinglish uses the Hindi audio profile while retaining mixed conversational style.
- Updated published rich-text composition **and** the plain-text fallback; both language profiles carry the full prompt. The single-prompt editor shape is retained with English as the default.

Fresh GETs verified the saved configuration on both IDs. Only welcome, tasks' language configuration, prompt/composition and update timestamp changed. LLM selection, extraction, hangup, webhooks and other agent settings were preserved. The extraction UI still showed GPT 5.4 Mini and enabled summary after reload.

Targeted backup text test with the fictional watch context:

| Input / check | Observed response |
|---|---|
| “English, please”, stock at ₹912 | Entirely English; concrete ₹740 offer |
| English resistance with incidental “Haan” | Entirely English; ₹790 offer |
| Explicit request for only Hindi | Devanagari Hindi; ₹820 offer |
| Explicit request for Hinglish, final quote and delivery | Mixed Hindi-English recap and quote-only close; chat ended |

The primary also stayed fully English for its ₹740 opening and ₹790 counter after an incidental “Haan”. Both retained the selected English style in these targeted turns. The primary also acknowledged an explicit stop request in English and ended the text chat without another question.

These text checks do not exercise phone recognition, pronunciation, language-profile handoff audio or latency. **v15 needs a consented phone retest**, including separate Hindi/Hinglish openings. The earlier auto-hangup call used v14.

## Workspace verification

Implemented a React/TypeScript workspace with private operator sign-in, saved requests, search/filter, structured request creation, per-shop quote selection, arithmetic breakdown, transcript review, call activity, readiness flags and explicit call confirmation. It uses the existing backend rather than seeded results. Preparing a request does not dial.

Chrome checks covered desktop and 390px mobile layout, no horizontal overflow, login, search/filter empty state, new-request submission, additional-delivery checkbox, adding/removing a shop, quote details/transcript, Activity and Workspace. A clearly labelled fictional UI-test gift-bag request was saved with zero calls. Calling controls correctly remained disabled while live calling was paused. No console errors were observed. The user-provided HTTPS tunnel loaded the UI and authenticated successfully; Secure/HttpOnly session cookies and authenticated API reads returned 200, with no-store on API responses. A multi-shop live run is not claimed.

Validation: 56 pytest tests and 10 subtests passed; Ruff passed for backend and changed backend/UI tests; TypeScript and Vite production build passed. Tests cover cookie signing/expiry/tampering, exact-origin mutations, HTTPS Secure cookies, bearer compatibility, list/detail privacy and public static-file boundaries. One upstream Starlette/httpx deprecation warning remains. The existing unrelated import-order warning in `tests/test_quote_plan.py` is not part of the targeted Ruff check.

The temporary Cloudflare tunnel still depends on the local Mac and running server. This is not a durable hosted deployment. Remaining work: phone/audio validation of v15, user UI review, stable hosting, demo recording and submission.
