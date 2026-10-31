# Sauda

Sauda calls shops to check availability and negotiate nonbinding price quotes in Hindi, Hinglish, or English. Built for the Bolna Symphony Buildathon by Roansh Desai and Aashutosh Vyas.

## Current state

Two existing Bolna agents now connect to a **FastAPI + SQLite backend** and a **React workspace** for requests, calling progress, quote review and transcripts. A backend-originated watch roleplay completed on 29 October: the authenticated webhook saved the final result automatically, with ₹820 per watch plus ₹76 delivery and automatic hangup. These are fictional shop test results, not real-business quotes.

The new v15 setup asks for English, Hindi or Hinglish at the opening, retains that choice, and configures separate English/Hindi audio profiles. Saved settings and targeted text tests are verified; a new phone test of this revision is still needed. See [current state](docs/current-state.md) and [test report](reports/2026-10-29/live-backend-and-ui.md).

Build the UI before starting the backend:

```sh
cd frontend
npm ci
npm run build
cd ..
uv sync --frozen
# Populate ignored .env as described in docs/backend.md.
uv run --env-file .env uvicorn backend.app:create_app --factory --host 127.0.0.1 --port 8000 --no-access-log
```

Open **http://127.0.0.1:8000**. Sign in using the private `SAUDA_API_TOKEN` as the workspace access code. The browser receives an eight-hour HttpOnly session; no secret is embedded in the bundle or localStorage. Live calling defaults off. Preparing a request never dials; starting a test call requires a separate confirmation and the backend allowlist. See the [backend guide](docs/backend.md) and [UI guide](docs/ui.md).

Sauda is **quote-only**: no purchases, reservations, deposits, or payment commitments. Prompt instructions are not a substitute for backend input validation, evidence checks, or budget enforcement.

| Component | Current setting |
|---|---|
| Primary conversation model | Google Gemini 3.7 Flash |
| Backup conversation model | OpenAI GPT-4.1 |
| Voice / transcription | Sarvam Bulbul v3, Sumit / Deepgram nova-3 |
| Conversation prompt | [v15](agents/prompts/prompt-v15.txt) |
| Quote extraction | [v8](agents/extraction/extraction-prompt-v8.txt), GPT 5.4 Mini |
| Hangup | [Prompt-based automatic closing](agents/hangup-prompt-v1.txt) |

See [current state](docs/current-state.md) and [configuration](agents/configuration.json) for verification boundaries and remaining work. Historic failed tests are retained and must not be presented as passes.

## Negotiation behavior

- Make concrete, nonbinding offers from the current request's budget; do not disclose the ceiling.
- Use up to three distinct offers, increasing only after seller resistance. Respect a clear refusal or opt-out.
- Establish English, Hindi or Hinglish at the opening and keep it through closing unless explicitly asked to switch.
- Confirm exact quantity/variant, unit versus total price, mandatory charges, and pickup/delivery timing.
- Ask for free delivery when requested; record additional delivery fees separately when the user's budget allows them.
- End after the final quote-only recap and thanks. Phone hangup evidence is recorded per test; a saved toggle alone is not proof.

## Prepare an INR offer plan

Python 3, standard library only:

```sh
python3 tools/quote_plan.py --quantity 32 --max-unit 844 --delivery additional
python3 tools/quote_plan.py --quantity 5 --max-unit 5000 --strict
python3 -m unittest discover -s tests -v
```

The watch example has a merchandise ceiling of ₹27,008, with delivery additional. It proposes ₹740 / ₹790 / ₹820 per watch. The kurta example proposes ₹4,400 / ₹4,700 / ₹4,900. The planner uses exact decimal arithmetic, rejects invalid amounts/quantities, and leaves unknown delivery fees unknown. It does not validate an entire real-world request, interpret seller evidence, place a call, or authorize a purchase.

## Repository layout

- `agents/`: saved configuration, versioned conversation/extraction prompts, and fictional test requests.
- `reports/`: sanitized behavioral test outputs and live roleplay reviews.
- `docs/current-state.md`: latest handoff and implementation limits.
- `docs/archive/`: original project plans and earlier reports, retained as history.
- `tools/quote_plan.py`: product-independent numeric offer preparation.
- `backend/`: FastAPI endpoints, Bolna adapter, SQLite persistence and quote assessment.
- `frontend/`: Geist-based React workspace, served by the backend after a production build.
- `docs/backend.md`: local setup, endpoint contract, webhook configuration and operating limits.
- `tests/`: meaningful budget-scope and arithmetic checks.

Phone numbers, credentials, account email, recordings and raw UI screenshots are excluded. Never commit API keys. See [export manifest](docs/artifact-export.json) for the scope of the imported agent pack.

## Team responsibilities

Roansh: frontend, backend orchestration, webhook integration, demo recording and repository. Aashutosh: prompt/persona, voice and LLM tuning, test calls and pitch. Both: live testing and demo review. The original plans are archived; feature descriptions there are goals rather than implementation evidence.
