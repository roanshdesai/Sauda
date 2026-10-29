> LATEST STATUS (2026-10-27, ~20:25 IST): See [testing-report-2026-10-27.md](testing-report-2026-10-27.md). Both existing agents now use prompt v9, 500 output tokens, temperature 0.2; primary Gemini 3.7 Flash, backup full GPT-4.1. Extraction prompt v5 is saved on both. Fictional text/extraction testing completed with documented limitations; displayed credit reduction $0.21 of authorized $5. Correct roanshdesai GitHub CLI access verified. No calls or pushes. Pali final testing update was subsequently sent after Roansh unlocked the Mac; outgoing iMessage verified. Earlier material below is historical and contains superseded settings/testing status.

# Sauda continuation verification

Updated (UTC): 2026-10-27T14:22:21.411710+00:00
Author: Codex continuation chat.

## Goal and acceptance criteria
Reuse the two existing Bolna agents, select an available alternate backup model, verify saved configuration, and coordinate with Pali in Messages. Completed for configuration; behavioral testing remains pending. User authorized configuration and routine Sauda coordination. No paid calls, credits, publication, commits, pushes or submission were authorized or performed.

## Checkout and revision
No local checkout was created or modified in this continuation. Remote main was refreshed in signed-in Chrome and still points to 8b1fa7d4f15e6343c140c303cfb38ab855f3cd01, with README.md and context.md only, one branch and three commits. No local branch/diff exists for this work. Follow /Users/roanshdesai/AGENTS.md and discover project instructions before any future code work.

IMPORTANT account distinction: Chrome user-navigation menu explicitly confirms roanshdesai. The GitHub connector profile explicitly returns roansh-desai and returned 404 for roanshdesai/Sauda. Use the correct signed-in Chrome session for this repository; do not treat the connector 404 as absence. No account settings were changed.

## Current state
Fresh supported Chrome access succeeded without a permission denial. The previous Bolna blocker did not recur; its original cause remains unknown.

| Setting | Primary | Backup |
|---|---|---|
| Agent ID | 3bedc40e-9f88-491a-ad87-952be647f59b | f7d6dccb-944e-42dc-80ef-69c786195c40 |
| Name | Sauda &#124; Hinglish Quotes &#124; Primary v3 | Sauda &#124; Hinglish Quotes &#124; Backup v3 |
| Provider/model (dashboard labels) | google / Gemini 3.7 Flash | openai / gpt-4.1-mini |
| Max output / temperature | 250 / 0.2 | 250 / 0.2 |
| Engine / routing | Cascaded / India | Cascaded / India |
| Language / timezone | Hindi / Asia/Kolkata | Hindi / Asia/Kolkata |
| Voice | Sarvam Bulbul v3 / Sumit | Sarvam Bulbul v3 / Sumit |
| Transcription | Deepgram nova-3 | Deepgram nova-3 |
| Call Summary | Enabled | Enabled |
| Quote evidence | quote_evidence_json, GPT 4.1 Mini | quote_evidence_json, GPT 4.1 Mini |
| Extraction format | Free Text, Text (default) | Free Text, Text (default) |
| Webhook | Blank | Blank |
| Function tools | None configured | None configured |
| Displayed cost | Approx. $0.089/min | $0.060/min |

Backup model saved around 19:49 IST and verified after full reload. Primary fetched and checked in the reloaded session; its last saved timestamp remains 16:16 IST. Primary was not changed. No agents recreated.

Both full prompt/welcome UI sections compare identical, and both full extraction editor definitions compare identical. Prompt matches the existing v3 quote-only instructions: honest AI identity, exact item/quantity, two counters maximum, private all-in cap, unknown fees remain unknown, no commitments, opt-out handling. request_context is blank on both; no real call context supplied. Hangup-using-a-prompt toggle was off on both; call termination behavior was not tested.

Extraction preserves evidence and actual commitment violations, requests null for unknowns, and delegates cap/savings calculations to backend. It requests JSON in text without a schema-enforced JSON result. Parsing and arithmetic must be validated by integration code. Backup is a separate manual alternative, not automatic failover.

Opened native Messages Pally Agent conversation and sent a fresh progress request and final configuration report. The first message showed Read 19:48 IST; the final configuration report showed Read 19:51 IST. Requested demo scenario and backend location; no substantive incoming reply observed at the last check. No ongoing monitoring automation was created.

## Changed files
- continuation-verification-2026-10-27.md — this saved report.
- context.md — added current-state note pointing here; earlier handoff retained below as history.
- evidence-2026-10-27/ — saved relevant agent/repository UI snapshots and primary/backup model screenshots. No credentials or raw session logs.
- Bolna backup only — changed provider/model to openai / gpt-4.1-mini and saved.

## Failed approaches
GitHub connector repository read returned 404; profile verification showed the wrong account roansh-desai. Signed-in Chrome with roanshdesai successfully read the private repository. Do not repeat account permission troubleshooting as though the repository were absent.

## Tests and checks
- Backup save and full browser reload: model persisted.
- Both agent IDs verified from their agent-specific call-history links.
- Both model, voice, language, transcription, timezone, prompt, summary, extraction, webhook and tools settings inspected.
- Saved prompt/welcome sections compared equal; extraction editor definitions compared equal.
- Repo refreshed at the exact main revision above; no implementation code present in that remote branch.
- No voice playback, test call, extraction inference, live conversation, latency, parallel orchestration or end-to-end test run. Existing test-plan fixtures remain illustrative, not passed tests.

## Next step
Resolve the exact consenting verified demo recipient and scenario with Pali/Aashu, and obtain Roansh's test spend limit before calling. Confirm where backend work will live, then implement or inspect validation and webhook integration. The README's booking, parallel-call, cap-guarantee and savings claims remain unsupported by the inspected implementation. Do not publish those as demonstrated features.

## GitHub and testing follow-up
The user clarified that roanshdesai is already connected. Local gh auth status confirmed both accounts were available, with roansh-desai initially active. Switched the existing local gh login to roanshdesai; gh api user returned roanshdesai and gh repo view roanshdesai/Sauda succeeded. The connector profile separately still returns roansh-desai. Chrome remains roanshdesai. No new account permissions, commits or pushes.

Bolna Test options visibly offers Chat with agent (text) and Web Call (Beta), besides phone calls. Opened the primary text-chat panel; only the configured welcome message is visible, and no test messages were sent. Prepared text-test-cases-v3.json with eight fictional scenarios for both agents. Text/extraction pricing is unconfirmed; requested permission for up to $0.50 of existing credits, without calls or adding funds. No behavioral test result yet.

User subsequently authorized up to $5 total for testing and prompt-edit iterations. Use existing balance only; no top-ups or real phone calls in this text-test scope. Starting displayed balance $9.97; stop before spending $5 (balance floor $4.97), allowing for billing delay.
