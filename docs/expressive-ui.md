# Sauda — The art of asking

An alternate public landing page and shopping workspace, built from the UI resource catalogue and the user's Sravas reference. This is a separate design branch, not a replacement for the original workspace.

## Branches and previews

- Original: `codex/sauda-live-test-ui`, preserved at `8f107dec6ef21f364e0611c753ad8033b58a265b`.
- Alternate: `codex/sauda-expressive-ui`, based on that exact revision.
- Alternate checkout: `/Users/roanshdesai/Developer/Sauda-expressive`.
- Local landing: `http://127.0.0.1:5174/`.
- Local workspace: `http://127.0.0.1:5174/#/workspace`.
- The original backend and preview remain on port 8000. The alternate Vite server proxies `/v1` to that backend, using the existing session cookie and access code.

Run the existing backend first, then in this checkout's `frontend` directory:

```sh
npm ci
npm run dev -- --port 5174 --strictPort
```

Build with `npm run build`. The backend's existing static-file handler can serve that build when running from this checkout with its own configured environment. No environment file, database or credentials are committed. This alternate has not been deployed to a public host.

## Design and libraries

- [Sravas](https://www.sravas.com/): reference for warm editorial typography, tactile imagery and a story-led page. No Sravas assets, copy or code were copied.
- [Magic UI](https://magicui.design/docs/components): adapted Blur Fade and Number Ticker components with the MIT notice retained in `frontend/THIRD_PARTY_NOTICES.md`.
- [Motion](https://motion.dev/docs/react): entrance reveals, layout transitions, conversation steps, language transitions, hero parallax and reading progress.
- [Lenis](https://lenis.dev/): smooth anchor scrolling on the public landing only. Destroyed on workspace entry; disabled for reduced-motion preferences.
- Lucide icons; locally bundled Instrument Serif, DM Sans and Geist Mono fonts.
- Original CSS for the moving shopping-list strip, receipt, paper note, wave illustration and workspace theme. These are not claimed as downloaded library components.

The landing is public; the workspace remains access-code protected. It reuses the existing API, request form, quote review, transcript and activity components. All landing prices and conversations are explicitly illustrative. The page does not perform calls, discover shops or place orders. Language previews are text only. The FAQ records the remaining phone-audio verification limit.

Reduced-motion handling is implemented for parallax, Lenis, reveals, number animation and decorative loops. The shopping strip has a pause button. Negotiation playback starts only on user action and offers manual step controls. FAQs use native `details` elements. Workspace code is lazy loaded after navigation.

## Validation — 29 October 2026

- TypeScript and production Vite build passed.
- Desktop Chrome at 1576px and mobile at 390 × 844 were visually inspected. No horizontal document overflow at those sizes.
- Verified navigation to workspace and back, mobile navigation, case switching, manual conversation steps, final price/quantity/delivery updates, and Hindi preview.
- Existing session authenticated and loaded all three saved requests. Sign-out and access-code sign-in passed through the Vite proxy.
- Desktop and mobile request dialogs opened and were visually checked; no new shopping request or phone call was made for this design check.
- Browser error logs were empty during the checked flows.
- Reduced-motion code was reviewed; OS-level preference emulation was not exercised.
- API/backend source and agent settings were not changed. Earlier backend test results belong to the base branch; this validation does not claim a new live call or new phone-language proof.

Local review captures (ignored by Git): `private/design-preview/landing.png`, `private/design-preview/workspace.png`, `private/design-preview/mobile.png`.

## Hero artwork

Created with the built-in imagegen tool, then copied into the project as `frontend/public/images/sauda-still-life.png` (1254 × 1254). It depicts shopping objects; it is not product-stock evidence or an actual shop photograph.

Final generation prompt:

> Use case: stylized-concept. Asset type: premium web landing page hero artwork for Sauda, a shopping negotiation assistant. Create a highly art-directed photorealistic 3D still life on a seamless warm ivory #f4f1e9 studio floor/background. A sculptural vermilion-red vintage telephone handset, curving coiled cord, stands leaning diagonally against a large beautiful folded kraft-paper shopping bag with twisted paper handles. Small ivory shopping receipt curling out of the bag, one sage-green folded garment partly visible, and two minimal small children's wristwatches with round plain colorful faces at the base. The telephone handset is the bold central focal point, the bag slightly behind. Sophisticated editorial product photography, playful yet expensive, tactile paper fibers, matte red lacquer, realistic soft directional sunlight from top left casting broad shadows rightward. Composition: square image, full still life centered with generous clear ivory margin all around, object occupies 75 percent of frame. Camera elevated three-quarter view, not isometric, 85mm product lens. Rich tactile details, sculptural volume, harmonious colors vermilion, kraft tan, pale sage, cream. No human hands, no people, no lettering, no text, no logos, no UI, no watermark. This is a standalone artwork to be composited into a cream website, not a website screenshot.
