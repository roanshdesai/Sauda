# Sauda project context

Repository owner: **roanshdesai** (not roansh-desai). Before pushing, verify the active GitHub identity, remote, branch, HEAD and diff. Never commit credentials or phone numbers.

Read [docs/current-state.md](docs/current-state.md) for the latest verified state, [agents/configuration.json](agents/configuration.json) for current saved settings, and [README.md](README.md) for usage.

Current scope is quote-only. The agent may propose prices but cannot commit the customer to purchases, reservations, deposits or payments. Establish Hindi/Hinglish/English at the opening and retain it until an explicit switch request. Do not disclose private budget ceilings. Delivery can be inside or outside the merchandise ceiling depending on the explicit request; unknown fees remain unknown.

Models and dashboard settings are mutable: reload and verify before changing or claiming completion. Reject incomplete requests before dialing. Parse and validate extracted JSON, verify seller evidence, and compute totals/compliance independently; dashboard confidence and regex validation are not factual guarantees. The FastAPI/SQLite backend now implements request validation, bounded concurrent dispatch, authenticated webhooks, reconciliation and conservative quote assessment; see [backend guide](docs/backend.md). A backend-originated consenting watch roleplay and final authenticated webhook were verified on 29 October. A React workspace now supports request creation, progress, quote/transcript review and explicit test-call controls. Native English/Hindi audio profiles plus prompt v15 were saved on both existing agents after the user reported English-to-Hinglish drift; phone audio validation of v15 is pending. The temporary tunnel still depends on the user's Mac. No automatic failover is implemented. All extracted quotes require review; no automatic success/recommendation claim.

Historical team split and original planning context are preserved in [docs/archive/original-project-context.md](docs/archive/original-project-context.md).
