# Sauda workspace

React + TypeScript + Vite, served by the FastAPI backend. The interface reads real saved requests and call results. It does not seed invented quotes or claim unverified savings.

## Run

From `frontend/`, run `npm ci` then `npm run build`. Start or restart the backend using the command in the README and open http://127.0.0.1:8000. Use the private `SAUDA_API_TOKEN` as the workspace access code; never paste it into source, screenshots, issue comments or chat. An eight-hour HttpOnly session keeps the raw code out of browser storage. There are no separate user accounts yet.

For development, run `npm run dev` in `frontend/` with the backend running on port 8000. Vite proxies `/v1` so cookie authentication and same-origin checks still apply. Do not add credentials to Vite environment variables.

## Working flow

1. Create a brief with the product, acceptable variant, quantity, budget basis, fulfilment, area, deadline and consenting test recipients. Creating it never dials.
2. Review the generated offers. Choose the existing primary or backup agent. Starting calls requires a separate confirmation, server-side live-call enablement and an allowlisted recipient.
3. Saved-state polling updates progress every five seconds while the page is visible. It does not start provider polling or redial. The explicit Refresh control fetches provider state if a webhook is delayed.
4. Review the quote breakdown, extracted excerpt and full saved transcript. All quotes remain marked Needs review. The displayed total is arithmetic from extraction, not a verified final invoice. Multiple quotes can be selected by shop; there is no automatic winner.

The Activity tab lists saved calls. Workspace shows actual readiness flags. Calling is currently paused after the supervised test. A clearly labelled UI-test gift-bag request verifies form submission and has zero calls; it is not a customer order.

## Design

The user requested a Vercel-inspired direction and supplied `UI-LINKS.md`. The design uses Geist and Geist Mono, restrained borders, a warm white canvas, quiet typography and blue/amber status accents. Sauda has its own S mark and shopping/negotiation content. No Vercel logo or copied application screens.

References inspected:

- [Vercel Geist](https://vercel.com/geist/introduction), [typography](https://vercel.com/geist/typography), [colors](https://vercel.com/geist/colors).
- [Vercel DESIGN.md reference](https://github.com/voltagent/awesome-design-md/tree/main/design-md/vercel), found in the user's resource catalogue.

Desktop and 390px mobile views were checked in Chrome. Native dialog focus, labelled fields, keyboard controls, reduced-motion handling and a separate call confirmation are implemented. This is a functional local first version, awaiting the user's visual review and stable deployment.
