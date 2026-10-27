# Sauda — Context & Project Split

## Overview
Sauda is an autonomous voice agent built for the Bolna Symphony Buildathon (submission deadline: Saturday, October 31, 2026). It places parallel outbound calls to local shops and restaurants in India, negotiates prices in natural Hinglish within a user-defined ceiling, and returns a clear savings summary.

---

## Team & Work Split

### Roansh Desai
- **Web App & Frontend:** UI to input task/query, set max budget, view active call progress, and review final quotes.
- **Backend Orchestration:** Service to trigger parallel calls via Bolna API, handle webhook events, and aggregate results.
- **Bolna Call Flow:** Setting up the base Bolna agent pipeline and webhook integrations.
- **Demo Recording & Repo:** Managing repo infrastructure, assets, and recording the demo call.

### Aashutosh Vyas (@Aashutoshvyas2020)
- **Prompt Engineering & Persona:** Designing and tuning the Hinglish bargaining prompt and negotiation persona.
- **LLM & Latency Optimization:** Selecting model configs, latency tuning, and response pacing.
- **Test Calls:** Running real-world test scenarios and edge-case negotiation handling.
- **Pitch Script:** Drafting and polishing the submission pitch narrative.

### Shared
- End-to-end testing on real calls
- Final pitch & submission review

---

## Technical Stack
- **Telephony & Agent Runtime:** Bolna
- **LLM:** Gemini 3.6 Flash (prioritizing minimal latency over deep reasoning for live dialogue)
- **Speech / Audio:** Sarvam AI / Bolna audio pipeline (Hindi/English code-switching)
- **App / Backend:** Lightweight full-stack app to trigger calls, receive Bolna webhooks, and display savings

---

## Key Constraints & Guidelines
1. **Hard Budget Ceiling:** Agent must never agree to a price exceeding the user's specified maximum.
2. **Latency First:** Keep reasoning steps minimal during live calls; sub-second turnaround is crucial for believable phone bargaining.
3. **Secrets:** Never commit API keys or credentials to Git.
