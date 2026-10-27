# Sauda

Sauda is a voice agent that phones shops and restaurants for you and bargains like a seasoned local. Built for the Bolna Symphony Buildathon (submission deadline: Sat 31 Oct 2026).

## What it does

You give it one request, for example:

- "Which of these 3 shops has this in stock, and at what price?"
- "Book a table for 6 in Bandra"

plus a max budget. It calls the places in parallel, talks to a real person, and negotiates hard but naturally: it counters every quote, pushes back ("can you do better?"), reads the mood of the person on the line, and never crosses your ceiling. It then returns one summary: who said yes, the final price and how much it saved.

## Why voice

Most small businesses in India only deal by phone. The agent has to handle interruptions and negotiate live in a way that feels human.

## Stack

- Bolna: runs the calls and the voice
- LLM: Gemini 3.6 Flash with minimal reasoning decides each counter-offer in real time (backup: GPT-4o mini)
- Speech: Sarvam AI / Bolna pipeline for Hindi-English code-switching
- Web app & backend: trigger parallel calls, manage webhooks, set max price, watch live transcript and savings

## Demo

A recorded call (audio and screen) between our agent and a real person, ending with the price dropping. The focus is on how it lowered the price.

## Team and split of work

Team of 2: Roansh Desai and Aashutosh Vyas (@Aashutoshvyas2020).

Roansh:
- Web app & frontend
- Backend service to fire parallel calls and build summary
- Bolna call flow & webhook setup
- Demo recording & repo

Aashutosh:
- Bolna account, API key and agent setup
- Voice pick
- Bargaining prompt, persona & negotiation logic
- LLM & latency tuning
- Test calls
- Pitch script

Both:
- Live call testing
- Demo video & pitch review

## Timeline

- Tue 27 Oct: bargaining prompts ready
- Wed 28 Oct: LLM running inside the Bolna call flow
- Thu 29 Oct: everything plugged together
- Fri 30 Oct: test and record the demo
- Sat 31 Oct: submit

## Notes

- Never go over the user's max price.
- Keep reasoning minimal for the live call, since latency matters more than depth.
- Do not commit API keys. Share them off-repo.
