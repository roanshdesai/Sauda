# Sauda live tests and latest saved behavior

This supersedes the 27 October configuration report for current prompts. Latest saved on BOTH existing agents: conversation prompt v12; revised welcome without upfront AI announcement (honest disclosure if asked); hangup using a prompt ENABLED with hangup-prompt-v1.txt. Reload verified exact normalized prompts, welcome and hangup settings. Primary remains Gemini 3.7 Flash; backup remains GPT-4.1; both still use Sumit. Quote evidence extraction now uses GPT 5.4 Mini and extraction-prompt-v8.txt. No agents recreated, repository changes, commits, pushes or deployments.

## Live calls
Both were consented roleplays with Roansh's verified number ending 3834; no real business contacted.

| Test | Execution | Prompt at call time | Recording duration | Final displayed cost | Result |
|---|---|---|---|---|---|
| Primary kurta | e17aa893-ecc5-47fc-9478-90d9bd149674 | v9 | 144.895 seconds (table 145) | $0.154 | Completed; callee hung up |
| Backup kurta | c8376244-9043-4527-8490-9dce5860b874 | v10 | 199.915 seconds | $0.286 | Completed; callee hung up |

Backup initially showed provisional cost $0.199 while call-disconnected; final completed debug view showed $0.286. Do not use the provisional figure as final cost. Latest refreshed account balance $9.28 versus starting $9.97: displayed reduction $0.69 across tests so far, under the authorized $5 limit. Billing may lag.

User feedback: primary "Too slow or awkward pauses"; backup "About the same". Primary LLM average 2.34s, overall P90 3.80s. Backup LLM average 1.69s, overall P90 3.00s. Transcription averages were similar (672/677 ms), voice averages 25/126 ms. These are different short conversations and not a controlled benchmark. Backup measured faster generation but user-perceived improvement was absent; it repeated facts/questions and was interrupted frequently. No claim that latency is solved. Audio was not independently listened to; transcript, diagnostics and user feedback were inspected.

Primary inferred 5050 per unit after asking for a total; summary invented AM and extraction PM from unqualified 7:30. Backup repeatedly dodged a request for a proposed price, repeated generic discount requests and returned 5500 per kurta / 27500 total with no order, above the user's strict limit. Full evidence is in live-tests-2026-10-28/. Backup extraction retrieval in Debugging returned "Failed to fetch extraction data"; no final extraction result claimed for that call.

## User-requested behavior updates after both calls
The user explicitly requested stronger haggling, numeric offers rather than evasive best-price questions, an opening near 4400 when maximum is 5000, automatic cut, no initial AI announcement, and Hindi/Hinglish/English matching.

- Kurta request now has authorized nonbinding offers 4400, 4700, 4900 per unit (22000/23500/24500 for five). Increase only after resistance. Strict private ceiling stays below 5000 each/25000 total; never reveal it. All quotes remain nonbinding.
- Up to three distinct numeric proposals; one respectful concrete counter may follow an initial "final price", but repeated clear refusal ends negotiation. Opt-out ends immediately.
- Welcome: Namaste, main Sauda bol raha hoon. Ek customer ke liye price aur availability poochhni thi. Kya abhi baat ho sakti hai? No human impersonation; disclose AI honestly if asked.
- Latest language rule matches the seller's dominant language, with Hindi in Devanagari and matching language through closing.
- Hangup detector ends after the assistant completes its quote-only recap and thanks, without requiring the recipient to disconnect. It should not end while clarifying or negotiating.

## Focused text regressions
- Backup v11: gave 4400 then 4700 then 4900 after resistance; switched English to Hinglish to Hindi; closed quote-only; UI showed Chat ended automatically.
- Primary v11: directly offered 4400 against initial final 6200; stopped after repeated firm refusal; auto-ended. Its Hindi response mixed English, prompting v12 refinement.
- Primary v12: recognized Hindi without explicit language instruction, gave 4400 in Hindi, closed in Hindi at confirmed 22000 total with no-order disclaimer, and UI showed Chat ended.
- Both final v12 and hangup settings persisted after reload. Text auto-end is NOT proof that the phone disconnects after the spoken goodbye. Neither live call used the new hangup behavior.
- Updated extraction v8 with GPT 5.4 Mini passed the ambiguity fixture: final basis unknown, whole-quantity totals null, no invented AM/PM, no commitment. Normal known-total fixture retained 1200/950. Prior failed revisions preserved. Backend schema/evidence/budget validation remains required.

## Pending third test: new product
User said yes to another call but requested a different product to test generality: 32 Spider-Man watches for a child's birthday party, delivery to Marine Drive by 3 November 2026; explicitly check delivery charges. Budget and watch type were asked and remain pending. No third call launched. Full home address is unnecessary for this roleplay quote.

Product-independent prompt candidate v13 removes the concrete kurta opening example and requires using only the current request's numeric ladder and basis; adds explicit delivery-to-area/by-date and delivery-fee clarification. It is prepared locally but NOT saved to agents yet. Choose and calculate watch offers after the user supplies the budget, including shipping treatment. Do not reuse 4400 for watches. Files: watch-test-request-2026-10-28.json, prompt-v13-candidate.txt.

No new Pally messages; user said Pally is down. Backend, webhook integration, deterministic price validation and automatic failover remain unbuilt/unverified.
