# First live kurta roleplay test

28 October 2026, initiated 17:58 IST. User consented to role-play the shopkeeper at their verified number ending 3834. No real business was contacted.

Execution: e17aa893-ecc5-47fc-9478-90d9bd149674. Primary: 3bedc40e-9f88-491a-ad87-952be647f59b. Saved conversation prompt at call time: v9. Gemini 3.7 Flash, Sarvam Bulbul v3 Sumit, Deepgram nova-3.

Dashboard outcome: Completed, 145 seconds, callee hung up, cost $0.154. Recording displays approximately 2:24.9. Balance after call: $9.61 (starting session balance $9.97, displayed reduction $0.36; billing/rounding may lag). No top-up or new purchase.

Request: five green men's kurtas, all size 38, each strictly under INR 5000 all-inclusive, pickup near Breach Candy by 29 October. No purchase or reservation authorized.

## Observations
- Reached user, who confirmed finishing the call.
- Asked for exact size and quantity and confirmed stock.
- Asked whether 5500 per kurta includes taxes/mandatory charges.
- Asked for pickup readiness; seller said 7:30 without morning/evening.
- Switched to English when requested, but final quote-only closing reverted partly to Hinglish.
- One initial discount request was repeated in English after language switch, then one final counter. Three audible bargaining questions, two distinct negotiation rounds. This is a nuance for the strict two-request rule.
- Final question asked for all five kurtas' total; seller answered 5050 without a basis. Agent recapped 5050 EACH without checking. This is an ambiguity failure. If per item, five cost 25250, exceeding the requested limit; that is a conditional calculation, not a confirmed quote total. Do not report success or validated savings.
- Explicit quote-only disclaimer; no order, reservation or purchase accepted.
- Summary invented 7:30 AM, extraction invented 7:30 PM. Neither is supported by the transcript. Built-in summary must not be authoritative for downstream decisions.
- Extracted all-in totals were null, correctly avoiding multiplication in the extractor, but final unit basis and PM were unsupported. High confidence/valid JSON do not establish factual accuracy.
- User rated experience: "Too slow or awkward pauses". We inspected transcript and dashboard diagnostics, not independently listened to audio.

## Latency evidence
Dashboard averages: transcriber 672 ms; transcriber-to-LLM 2 ms; LLM 2.34 s; voice 25 ms. Overall P90 3.80 s across 12 turns. LLM P90 2.83 s, transcriber P90 1.62 s, voice P90 171 ms over 9 sampled turns (dashboard notes P90 equals peak at this sample size). These metrics are for this one call; do not generalize them to all calls.

Model generation dominates the displayed delay. Do not shorten speech endpointing blindly because speech already contains fragmented/interrupted turns. Compare the existing backup with the same voice and request before claiming improvement.

## Follow-up work
Conversation prompt v10 adds explicit price-basis and AM/PM clarification, preserving the requested language through closing. Extraction revisions are being regression-tested against the observed ambiguity. No second call launched as part of this review.

## Revisions and focused regressions
Both agents saved conversation prompt v10 and extraction prompt v8 using GPT 5.4 Mini for the extraction category. Conversation models remain primary Gemini 3.7 Flash and backup GPT-4.1. GPT-4.1 Mini extraction with revised v6/v7 still inferred a unit price; GPT 5.4 Mini with v7 fixed basis but copied a unit amount into the first all-in total. v8 with GPT 5.4 Mini passed the ambiguity fixture: final basis unknown, both whole-quantity totals null, AM/PM unconfirmed, no commitment. Normal known-total fixture still returned 1200/950 and no commitment. JSON results parsed locally and asserted. These are targeted tests, not a full rerun of the prior suite.

Backup conversation v10 text test asked morning/evening, kept English, and clarified an explicitly ambiguous 5050 amount. It still bundled two questions and gave a verbose close at 5200 each without using the optional second counter. That test does not establish the ability to recognize all naturally ambiguous bare-price replies. The user explicitly authorized a second call to compare pauses; backup execution c8376244-9043-4527-8490-9dce5860b874 launched at 18:08 IST.
