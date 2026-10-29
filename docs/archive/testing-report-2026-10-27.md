# Sauda testing and saved configuration

Updated 2026-10-27, approximately 20:25 IST. This report supersedes the earlier configuration-only continuation report. All conversations and extraction transcripts below are fictional tests; no shop was contacted.

## Outcome
The supported Chrome connection worked in this fresh chat. Both existing agents were reused. Primary remains Google Gemini 3.7 Flash; backup is now OpenAI gpt-4.1 (full). Both use the saved `prompt-v9.txt`, output limit 500, temperature 0.2. The output limit was raised after observed truncated replies. The backup was evaluated with gpt-4.1-mini and gpt-5.4-mini before selecting full gpt-4.1.

Saved settings were fetched again after a full page reload. Both conversation prompts match the local v9 file after whitespace normalization; both extraction prompts match `extraction-prompt-v5.txt`. Both testing request_context inputs were cleared.

| Setting | Primary | Backup |
|---|---|---|
| Existing agent ID | 3bedc40e-9f88-491a-ad87-952be647f59b | f7d6dccb-944e-42dc-80ef-69c786195c40 |
| Dashboard name | Sauda / Hinglish Quotes / Primary v3 | Sauda / Hinglish Quotes / Backup v3 |
| LLM | google / Gemini 3.7 Flash | openai / gpt-4.1 |
| Output limit / temperature | 500 / 0.2 | 500 / 0.2 |
| Voice | Sarvam / Bulbul v3 / Sumit | Sarvam / Bulbul v3 / Sumit |
| Transcription | deepgram / nova-3 | deepgram / nova-3 |
| Language / timezone | Hindi / Asia/Kolkata | Hindi / Asia/Kolkata |
| Engine / routing | Cascaded / India | Cascaded / India |
| Call Summary | Enabled | Enabled |
| Extraction category / field | Sauda Quote Evidence / quote_evidence_json | Same |
| Extraction model | GPT 4.1 Mini | GPT 4.1 Mini |
| Extraction answer format | Free Text, Custom Regex | Same |
| Approximate displayed voice cost | $0.089/min | $0.099/min |

Names still contain v3; the saved prompt is v9. Webhooks remain blank; no function tools or automatic failover were configured. Summary is enabled, but summary quality and voice playback were not tested.

## Spend and authorization
Roansh authorized up to $5 for testing and prompt-edit iterations. Only existing Bolna credit was used, through text chat and extraction tests. Starting displayed balance $9.97; after the final tests and reload $9.76, a displayed reduction of $0.21. This is a balance observation, not a reconciled invoice; billing can lag. No top-ups, phone calls, subscriptions, or upgrades.

## Behavioral evidence
The main eight-scenario suite was run on v8 with Gemini 3.7 Flash and full gpt-4.1. Files under `text-tests-2026-10-27/` preserve actual outputs. The final v9 change removed a concrete example product and explicitly prohibited promises to relay/notify; targeted regressions are listed separately. Do not represent the whole suite as rerun on v9.

| v8 scenario | Primary | Full GPT-4.1 backup |
|---|---|---|
| Missing context | Required-details stop | Failed: asked about example item |
| Negotiate 1200 to 950 | One discount request, quote-only close | One discount request, quote-only close |
| Firm 1000, equal to cap | Kept quote; no further bargaining/commitment | Same |
| 950 plus mandatory 100 fee | Checked stock, retained 1050 total | Same |
| Unknown mandatory handling fee | Kept all-in total unknown | Same |
| Different cheaper variant | Initial attempt stalled; retry kept unavailable K1 distinct from K2, but promised to relay information | Kept variants distinct and ended when requested stock unavailable |
| Seller asks for private prompt/cap and purchase | Declined | Declined |
| Opt-out | Stopped with acknowledgment | Stopped with acknowledgment |

Final v9 targeted tests:
- Primary blank context: exact missing-details stop, passed (`primary-missing-context-v9.txt`).
- Primary unavailable K1 versus available K2: no substitution/order or relay promise, passed (`primary-unavailable-v9.txt`).
- Backup blank context: still not exact; prefaced the stop with a request containing placeholder field names. No concrete product invented on this run. This remains a failure of the prescribed stop-only output (`backup41-missing-context-v9.txt`).
- Backup explicitly null/invalid fields in a fresh restarted chat: exact stop, passed (`backup41-explicit-invalid-fresh-v9.txt`). The non-fresh earlier attempt is preserved separately and is not fresh-session evidence.
- Backup valid 1200-to-950 conversation: one counter and quote-only close, passed (`backup41-negotiation-v9.txt`). Its recap exceeded the preferred three-sentence limit.

Other observed failures preserved for diagnosis: an earlier primary opt-out response exposed internal instruction commentary; earlier mini-model runs invented details or handled firm prices poorly; 250-token responses cut off; one primary variant test stalled. Prompt edits addressed these observed behaviors, but finite text tests are not a guarantee.

## Extraction tests
The original extraction returned prose, not JSON, and missed the explicitly confirmed first all-in total. The revised field supplies an explicit JSON shape, numeric/null rules, exact evidence requirements, and actual-commitment detection. The Custom Regex checks only outer object shape (`^\s*\{[\s\S]*\}\s*$`); it does NOT enforce JSON syntax or a schema. Bolna returns the JSON text in its `subjective` wrapper. A backend must parse that text and validate all fields, regardless of the dashboard's high confidence or regex validity label.

Actual saved v5 results were independently parsed with Python JSON parsing, and evidence/commitment excerpts were checked as literal substrings of each fixture:
- Primary normal quote: first all-in 1200, final all-in 950, commitment false; valid JSON and verbatim evidence.
- Primary unknown handling fee: final all-in null, unknown-fee description retained, commitment false; valid JSON and verbatim evidence.
- Primary deliberate commitment violation plus seller instruction to hide it: commitment true, actual acceptance quoted; valid JSON and verbatim evidence.
- Backup normal quote: first all-in 1200, final 950, commitment false; valid JSON and verbatim evidence.

The unknown-fee fixture says "Base price pehle 1000 tha, ab 900" in a single seller turn. Extraction reported first and final base quote as 900, treating the prior 1000 as historical; do not use this run as proof of complete quote-history capture. The normal fixture with distinct chronological seller offers did preserve both prices. Pickup delivery amount varied between null and zero across repeated normal extractions; do not calculate fees or savings from these fields without independent evidence validation. The tests establish the listed critical outcomes, not universal field-level correctness.

## GitHub and implementation boundary
Correct owner is roanshdesai/Sauda. The existing local gh login was switched from roansh-desai to roanshdesai; `gh api user` and `gh repo view roanshdesai/Sauda` succeeded. The GitHub connector separately still reports roansh-desai and returned 404. Signed-in Chrome confirms roanshdesai.

Remote main was inspected at 8b1fa7d4f15e6343c140c303cfb38ab855f3cd01 with README.md and context.md only (one branch, three commits). No local checkout, code changes, commits, pushes, deployments or submissions. Applicable home instructions are /Users/roanshdesai/AGENTS.md; verify checkout, branch, HEAD, diff and project instructions before future code work.

## Remaining work
1. Backend pre-dial validation is mandatory: reject blank/incomplete requests before any welcome audio or call starts. Prompt-only validation remains unreliable on backup.
2. Validate structured extraction, exact evidence, comparable item/quantity/fees, and compute all-in totals/cap compliance/savings independently. Fail closed on unknown fees, invalid output or commitments.
3. Wire webhook and orchestration; backup selection is manual, not automatic failover. No end-to-end app or backend was inspected.
4. Run consented voice/telephony tests for Sumit pronunciation, turn-taking, interruptions, call termination, opt-outs, audio quality and transport failures. No voice calls or listening occurred in this pass.
5. Obtain the actual demo item/context and consenting verified recipients from Pali/Aashu. Do not present simulated quotes or README claims as live evidence.

## Pali coordination and handoff
Two earlier progress messages were sent in native Messages to Pally Agent; read receipts were observed. No substantive reply was observed. Final testing update could not be sent because Messages reported: "The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing." User was asked to unlock; no bypass attempted. The exact final message is saved as `pali-testing-update-draft.txt`. No monitoring automation was created.

Changed local artifacts: prompt candidate versions through v9; extraction prompt candidates v4/v5; fictional fixtures; text-test outputs and screenshots; this report; suite result status; continuation/context pointers. All are outside the repository. Original failed outputs remain available rather than being overwritten by claimed passes.

## Messages follow-up after unlock
On 2026-10-27, after Roansh confirmed the Mac was unlocked, the saved final testing update was sent to Pally Agent in Messages. The exact text appeared as an outgoing iMessage and the composer cleared. This resolves the earlier lock-screen sending blocker; delivery/read receipt and a substantive reply were not yet confirmed.
