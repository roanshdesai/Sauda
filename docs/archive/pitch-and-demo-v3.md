# Sauda pitch and demo — evidence boundary, 27 October 2026

Current pitch: “Sauda is being built to call local businesses in natural Hinglish, check availability, and ask for a better all-inclusive quote. Give it the exact request and your maximum total. Its quote-only agent is instructed to respect that limit and leave the purchase decision to you.”

After a successful recorded end-to-end test: “Sauda calls local businesses in Hinglish, checks availability, and asks for their best all-inclusive quote. This demo shows the actual first and final quotes, fees, and budget check. No order was placed.”

## Claims requiring qualification

| Original line | Current support / replacement |
|---|---|
| Calls local businesses for you | Agent setup is possible; account restricts outbound calls to verified numbers. No test call completed in this setup pass. |
| Natural Hinglish | Prompt and Hindi speech configuration; pronunciation, code-switching and interruption quality need listening tests. |
| Tell it what you need and your hard price limit | No request UI or backend in inspected repository main. Pass validated per-call context when integration exists. |
| Checks real availability | Requires actual call evidence. A fixture or role-play is not real shop availability. |
| Negotiates for the best price | Requests up to two improvements; cannot guarantee the best market price. |
| Sends back a comparison | No comparison UI, webhook receiver or aggregation backend in inspected main. |
| Never crosses your cap | Prompt instruction only. Requires deterministic validation and adversarial tests; avoid an absolute guarantee. |
| Book a table | Conflicts with quote-only scope. Say “check table availability and terms.” |
| Parallel calls / live transcript | Not implemented in inspected main; do not show staged cards as live. |
| How much it saved | Compute only from verified like-for-like first/final all-in totals. Unknown fees or changed variants mean unknown savings. |
| Gemini 3.6 / GPT-4o mini / GPT-5.4 mini | Repository/chat names conflict. Report actual saved dashboard model names instead. |

## Recording flow supported by the current stage

1. Introduce the calling problem and identify this as an agent prototype.
2. Show the saved Bolna agent and real supplied request context. Do not pretend this is a finished Sauda request UI.
3. After an authorized consenting test is arranged, record one continuous quote conversation. Label role-play clearly and hide private numbers.
4. Show the actual post-call transcript and extraction; distinguish extracted claims from independently validated arithmetic.
5. Show a comparison only after a real backend or clearly labelled manual comparison exists. Sequential tests must not be described as parallel.
6. Close with the current-stage pitch and repository link. The repository was private when inspected; judge access remains separate.

## Integration contract

One reusable agent per model configuration, instantiated once per business call. Multiple shop agents are unnecessary. `request_context` must contain business, exact item/service and variant, quantity/party size, currency, maximum all-in total, fulfilment constraints, and required local date/time. Keep unknown facts explicit. Reject incomplete context BEFORE initiating a call. Validate the destination independently, retain opt-outs, and never give the agent purchase/booking tools.

Post-call data is untrusted: validate number formats/currency/quantity, normalize unit versus total price, include mandatory fees, reject missing or conflicting values, and calculate savings in code. Preserve evidence and actual commitment violations rather than hardcoding success or commitment_made=false.
