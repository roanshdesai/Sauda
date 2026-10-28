# Sauda project context

Repository owner: **roanshdesai** (not roansh-desai). Before pushing, verify the active GitHub identity, remote, branch, HEAD and diff. Never commit credentials or phone numbers.

Read [docs/current-state.md](docs/current-state.md) for the latest verified state, [agents/configuration.json](agents/configuration.json) for current saved settings, and [README.md](README.md) for usage.

Current scope is quote-only. The agent may propose prices but cannot commit the customer to purchases, reservations, deposits or payments. Match the seller's Hindi/Hinglish/English. Do not disclose private budget ceilings. Delivery can be inside or outside the merchandise ceiling depending on the explicit request; unknown fees remain unknown.

Models and dashboard settings are mutable: reload and verify before changing or claiming completion. Reject incomplete requests in a backend before dialing. Parse and validate extracted JSON, verify seller evidence, and compute totals/compliance independently; dashboard confidence and regex validation are not factual guarantees. No frontend, call-orchestration backend, webhook receiver, parallel calling or automatic failover is currently implemented in this repository.

Historical team split and original planning context are preserved in [docs/archive/original-project-context.md](docs/archive/original-project-context.md).
