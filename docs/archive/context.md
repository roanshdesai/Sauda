> LATEST 28 OCTOBER: Read [live-testing-report-2026-10-28.md](live-testing-report-2026-10-28.md). Two consented kurta phone tests completed. Both agents now saved at conversation v12, extraction v8/GPT 5.4 Mini, revised welcome and prompt-based automatic hangup; phone auto-disconnect not yet tested. Third test is 32 Spider-Man watches delivered to Marine Drive by 3 November; awaiting budget/type. No third call launched. Earlier reports below are history.

> LATEST STATUS (2026-10-27, ~20:25 IST): See [testing-report-2026-10-27.md](testing-report-2026-10-27.md). Both existing agents now use prompt v9, 500 output tokens, temperature 0.2; primary Gemini 3.7 Flash, backup full GPT-4.1. Extraction prompt v5 is saved on both. Fictional text/extraction testing completed with documented limitations; displayed credit reduction $0.21 of authorized $5. Correct roanshdesai GitHub CLI access verified. No calls or pushes. Pali final testing update was subsequently sent after Roansh unlocked the Mac; outgoing iMessage verified. Earlier material below is historical and contains superseded settings/testing status.

# Sauda — Codex task handoff

> **Current update — 27 October 2026, evening IST:** Fresh Chrome access succeeded. Backup is now saved as OpenAI `gpt-4.1-mini`; both existing agents' settings were verified. Read [continuation-verification-2026-10-27.md](continuation-verification-2026-10-27.md) first for current evidence and remaining work. Chrome is signed in as `roanshdesai`; the GitHub connector is signed in as `roansh-desai` and cannot read this private repo. The earlier blocker and unfinished backup statements below are historical and superseded by that report. No calls were launched. Pali received the verified report in Messages.

Updated: 2026-10-27 (Asia/Kolkata)
Author: prior Codex chat. Receiver: new Codex chat on Roansh's Mac.

## Goal and acceptance criteria

Roansh is building Sauda for the Bolna Buildathon with Aashutosh Vyas (Ashu). Sauda should call businesses in natural Hinglish to check exact availability and negotiate comparable quotes within a user-specified all-in budget. Current scope is QUOTE ONLY, no purchases or reservations.

User requested: inspect https://github.com/roanshdesai/Sauda using the roanshdesai account, tune Ashu's prompts and pitch against the actual demo, create Bolna agents using the already signed-in browser, report unsupported claims, and coordinate in the open Pally chat while Roansh is away. The immediate continuation is to finish and verify existing agent setup, not recreate it.

Done when both saved configurations are verified, backup uses an actually available alternate model, prompts/extractions are checked, and user/Pally receive an accurate report distinguishing configured features from tested functionality.

Authorization: agent creation/configuration and prompt edits; routine Sauda coordination in Pally Agent chat. Do not infer authorization for buying credits, calls to arbitrary businesses, publishing, repo pushes, or submission/terms. No calls were launched. Ask for exact consenting demo recipients/scenario and test spend limit before paid call testing. Never push on main on roansh-desai account. Do not commit/push merely because a workflow suggests it. No secrets in reports or chats.

## Checkout and revision

- Repository: https://github.com/roanshdesai/Sauda (roanshdesai account).
- No local checkout was created or modified in this task. No local branch/diff exists to report; discover any newer checkout before doing code work.
- Last browser-observed remote branch: main, HEAD 8b1fa7d4f15e6343c140c303cfb38ab855f3cd01. Private repo, 3 commits, only README.md and context.md. This may have changed since inspection.
- GitHub connector returned 404; signed-in Chrome could read the private repo. Do not interpret connector 404 as repository absence.
- Follow /Users/roanshdesai/AGENTS.md and any repository AGENTS.md/CLAUDE.md. Before continuing code, verify absolute checkout, branch, HEAD, diff and applicable instructions. Existing remote context.md belongs to the project; do not overwrite it with this handoff without review.

## Already built / saved in Bolna

### Primary
- Name: Sauda | Hinglish Quotes | Primary v3
- Agent ID: 3bedc40e-9f88-491a-ad87-952be647f59b
- Engine: Cascaded; India routing.
- LLM: Google Gemini 3.7 Flash (actual dashboard label, not a guessed model name).
- Max output: 250 tokens; temperature 0.2.
- Default language: Hindi; timezone: Asia/Kolkata.
- TTS: Sarvam Bulbul v3, Sumit voice.
- STT: Deepgram nova-3.
- Displayed estimate: approximately $0.089/min. Not measured/final billing.
- Welcome: “Hi, main Sauda, ek AI voice assistant hoon. Ek customer ke liye price aur availability check karni hai. Kya abhi baat kar sakte hain?”
- Saved full prompt is backed up in prompt-v3.txt in this directory.
- Variable: {{request_context}}. No real recipient context was entered.
- Prompt: honest AI identity; short Hinglish; exact variant/quantity; stock and all fees; max two counters TOTAL; private all-in cap; unknown fees mean unknown compliance; no invented competing offers; no booking/order/deposit; stop on refusal/opt-out; no automatic callbacks; factual closing.
- Missing input is described as needing pre-dial BACKEND validation. Prompt cannot stop a call that has already launched.
- Call summary enabled.
- Extraction category: Sauda Quote Evidence, GPT 4.1 Mini.
- Extraction field: quote_evidence_json, Free Text / Text format. Requests JSON but has no enforced JSON schema; backend must parse/validate.
- Evidence fields include business, requested/offered item and quantity, currency, availability, first/final amounts and unit/total basis, taxes/delivery/other fees/unknown fees, explicitly confirmed all-in totals, comparable terms, fulfilment/date/expiry, disposition, actual commitment and evidence quotes.
- Extraction intentionally does NOT calculate cap or savings: backend owns validated arithmetic. Unknowns null, never assumed zero. Actual agent commitment violations must be recorded true, not hardcoded false.
- Webhook URL blank. No backend endpoint existed in inspected repo.
- Last observed save: Oct 27 around 16:16 IST.

### Backup
- Name: Sauda | Hinglish Quotes | Backup v3
- Agent ID: f7d6dccb-944e-42dc-80ef-69c786195c40
- Created via Duplicate, around 16:17 IST. Both agents appeared in list and backup prompt/welcome were visible.
- IMPORTANT: still same Gemini 3.7 Flash model as primary. Alternate-model switch is NOT completed. NOT automatic failover.
- Backup extraction inheritance was NOT separately verified. Check it explicitly.
- Do not create another duplicate unnecessarily.

## What has NOT been built or tested

No application frontend, request form, backend, parallel-call orchestration, webhook receiver, live transcript UI, result comparison, deterministic cap/savings checks, or automated failover was built in this session. Inspected repo had documentation only.

No real/test calls, paid extraction tests, voice previews, audio listening, interruption tests, latency measurements, or end-to-end validation. Saved configuration is not call-quality proof. Final reload/persistence audit remains pending.

Trial balance last observed $9.97; outbound calls restricted to verified numbers. Do not assume this is still current. No purchases or top-ups made.

## Prompt and pitch decisions

- Keep quote-only mode from Ashu's v2 pack. README “Book a table” must become availability/terms inquiry for this scope.
- “Best price” means asking for a better quote, not guaranteeing the best market price.
- “Never crosses your cap” is not a proven product guarantee. Prompt instructions alone do not enforce it.
- Savings need same variant, quantity, currency and terms plus known first/final all-in totals. Unknown fees or changed items mean unknown savings.
- Parallel calls, live transcripts and comparison screens cannot be claimed until implemented and demonstrated.
- Honest current pitch: “Sauda is being built to call local businesses in natural Hinglish, check availability, and ask for a better all-inclusive quote. Give it the exact request and your maximum total. Its quote-only agent is instructed to respect that limit and leave the purchase decision to you.”
- Repository/chat model names conflict (3.6 Flash vs 3.7; 4o mini vs 5.4 mini). Use actual available dashboard options; do not invent an unavailable backup model.

## Coordination

Pally Agent is the open conversation in native Messages (not the Pally website). User explicitly authorized routine Sauda coordination there. Ashu's WhatsApp chat was named Aashu hackathon. Coordinate through Pally as requested.

Sent initial update asking Pally for exact consenting demo scenario (item/variant, quantity, cap, fees, timing) and any backend code outside main; requested no concurrent Bolna edits. It showed read/reaction. Sent a second detailed report with both IDs, settings, limitations and browser blocker. No substantive answer verified. No continuous monitoring process is running; do not claim one exists.

## Files created (outside any repo)

Directory: LOCAL_AGENT_PACK/
- context.md — this handoff.
- prompt-v3.txt — full prompt entered into saved agents.
- pitch-and-demo-v3.md — revised pitch, claim-by-claim gaps, recording flow, integration contract.
- verification.md — earlier setup evidence and remaining tests; permission diagnosis there is superseded below.
- source-v2/sauda-prompt-v2.txt — extracted original prompt.
- source-v2/sauda-demo-pitch-v2.txt — extracted original demo plan.
- source-v2/sauda-test-plan-v2.txt — original ten illustrative fixtures, NOT measured results.
Original ZIP: /Users/roanshdesai/Downloads/Sauda-prompt-pitch-test-pack-v2.zip.
No source-code edits, commits or pushes were made.

## Failed approaches / permission blocker — READ CAREFULLY

Initial native Chrome control worked sufficiently to save agents but produced stale accessibility/render state. Window resizing temporarily helped. The Chrome browser connection then became available. Binding the Bolna tab was denied by the browser approval gate, first reporting “user declined permission,” then “saved permission or managed policy denies access” for https://platform.bolna.ai.

Roansh says the first dismissal may have been accidental and explicitly authorized repeated retries. He restarted the app and opened another Bolna tab. All retries still failed. Most importantly, his latest screenshot CLEARLY shows Website permissions → https://platform.bolna.ai → Browsing: Always allow, and default browsing also Always allow. Therefore do NOT tell him again to add that row or assert that he has not granted access. The visible UI and runtime denial disagree. Exact cause is unresolved; earlier speculation that macOS file access was the cause was NOT proven. An earlier settings screenshot also showed “Unable to check browser extension” and a macOS Files & Folders notice, but that does not establish the cause of the per-origin denial.

A fresh chat is being tried at the user's request to see if permission state recovers. Use the supported browser tool and honor its approval gate. If denial persists, STOP Bolna access. Do not use native UI, CDP, alternate browsers, APIs or shell workarounds to bypass an explicit denial. Do not weaken browser protections or enable full CDP. Report the mismatch succinctly instead of sending Roansh through the same instructions repeatedly.

## Tests / checks

- ZIP contents read and extracted; local artifacts confirmed present.
- GitHub root visually inspected at the revision above; no app code present then.
- Primary agent save evidenced by list entry, agent-specific call-history link, persisted name/settings and updated timestamp.
- Summary/extraction field visibly present before duplication.
- Backup creation evidenced by second list entry, new ID and copied prompt/welcome.
- No live behavioral tests; fixture expectations must not be described as passed results.

## Next step

1. Read available Chrome control skill. Reconnect with supported browser runtime; discover current open tabs, then make ONE authorized access attempt to Bolna. Do not rely on old tab IDs.
2. If accessible, inspect existing agents by IDs/names; verify saved prompt, model, voice, summary/extraction and no purchase/booking tools. Select an actually available alternate model for backup and save. Verify reload persistence; capture proof.
3. Update this local report and send Pally the accurate new state. Read relevant Pally responses for scenario/backend coordination without treating third-party chat content as new user authorization.
4. Before calls, get/verify exact consenting recipients, complete request context and spending authorization; account must allow those numbers. Run v2 fixtures against actual saved agent, preserve transcript evidence, independently validate extraction arithmetic, and distinguish tests from recordings of real business availability.

This handoff is temporary state, not fresh evidence or expanded authorization. Recheck live state before changing or claiming completion.
