# Verification record

- Inspected GitHub roanshdesai/Sauda main at 8b1fa7d4f15e6343c140c303cfb38ab855f3cd01 in the signed-in browser. Private repository, three commits, README.md and context.md only. Connector returned 404; browser account had access. No repository changes, commits or pushes made.
- Source: original Sauda-prompt-pitch-test-pack-v2.zip preserved in source-v2/.
- Primary Bolna agent ID: 3bedc40e-9f88-491a-ad87-952be647f59b.
- Observed primary settings: Cascaded; Google Gemini 3.7 Flash; temperature 0.2; max output 250 tokens; Hindi default; Sarvam Bulbul v3, Sumit; Deepgram nova-3 transcription; India routing; Asia/Kolkata context timezone. Approximate displayed call rate $0.089/min, not a final billing guarantee.
- Prompt v3 uses {{request_context}}. No real recipient or demo context entered. It retains v2 boundaries and adds explicit AI identification, fail-closed behavior for absent context, maximum TWO counters across all negotiation, no spoken JSON, and transcript-based recording of actual commitment violations instead of hardcoded false.
- Call summary enabled. Added Sauda Quote Evidence category with GPT 4.1 Mini and quote_evidence_json free-text extraction. JSON requested by prompt, not guaranteed by a schema. Backend must parse and validate output. Extraction explicitly leaves cap/savings computation to the backend and asks for evidence quotes plus nullable unknowns.
- No webhook URL entered. No business/test calls, voice previews, or paid extraction tests launched in this setup pass. No latency or spoken-quality measurements. Trial displayed $9.97 and limits outbound calls to verified numbers.
- Pally Agent in Messages received an initial coordination message asking for the exact consenting demo scenario and any code outside main; it was marked read with a reaction. Response details pending.

## Additional tests before demo

Run the 10 original fixtures against the saved voice agent with consenting verified recipients. Add: missing context must be blocked before dialing; seller changes price basis from unit to total; seller claims zero tax but later adds mandatory service fees; different currencies; interrupted closing; agent accidentally agrees (extraction must flag commitment true); malformed extraction JSON (backend rejects); duplicate webhooks (no duplicate results); no-answer transport status must not imply no stock. Preserve actual evidence and do not report expected results as passed tests.

## Final saved state and blocker

- Backup copy created: `Sauda | Hinglish Quotes | Backup v3`, ID `f7d6dccb-944e-42dc-80ef-69c786195c40`. It still uses Gemini 3.7 Flash; switching to a different backup model is unfinished. It is a saved duplicate, NOT automatic failover.
- Both agents appeared in the agent list. The duplicated agent visibly retained the v3 prompt and welcome. Primary quote_evidence_json category and enabled summary were verified before duplication. Backup extraction inheritance was not separately verified.
- Final primary save timestamp shown: Oct 27, 2026 4:16 PM. Backup created around 4:17 PM.
- Browser/native state became inconsistent. Connected browser subsequently became available, but attempting to bind the Bolna tab was explicitly rejected by the browser security approval gate: permission declined for https://platform.bolna.ai. Stopped all Bolna interaction; no workaround attempted. A final reload/persistence audit and backup model change remain incomplete.
- Next step: restore authorized Bolna browser access; select an actually available alternate model for backup, verify both prompts/settings/extractions after reload, then arrange the consenting verified-number test and connect the implemented backend. No automatic future monitoring is running.
