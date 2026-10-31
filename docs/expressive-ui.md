# Sauda — You shop. We bargain.

An alternate public landing page and shopping workspace using the user's UI-LINKS.md catalogue. The selected direction is light, playful tech with bold colours and layered components: violet type, lime quote cards, yellow shop cards and lavender controls.

## Branches and local preview

- Original: `codex/sauda-live-test-ui`, preserved at `8f107dec6ef21f364e0611c753ad8033b58a265b`.
- Alternate: `codex/sauda-expressive-ui`; draft PR #3 targets the original UI branch.
- Checkout: `/Users/roanshdesai/Developer/Sauda-expressive`.
- Landing: `http://127.0.0.1:5174/`; workspace: `http://127.0.0.1:5174/#/workspace`.
- Start the existing backend on port 8000, then run `npm ci` and `npm run dev -- --port 5174 --strictPort` from `frontend/`.
- `npm run build` produces the frontend distribution. The dev server proxies `/v1` to port 8000 with same-origin session handling.

The alternate has not been deployed to a public host. No credentials, environment file, database or recordings are committed.

## Design library components

- [Libraries.dev Thinking Orbs](https://libraries.dev/orbs), installed as `thinking-orbs`: animated agent centre with light theme, pause and reduced-motion handling.
- [Libraries.dev Liquid Metal](https://libraries.dev/metal), installed as `metal-fx`: WebGL metallic action border with the library's non-WebGL fallback.
- [Magic UI](https://magicui.design/docs/components): adapted Animated Beam, Border Beam, Blur Fade and Number Ticker. MIT notice retained; local styles, pause/reduced motion and Indian number formatting added.
- [Motion](https://motion.dev/docs/react): chat transitions, language selection, layout indicators, accordion transitions, magnetic links and pointer glow.
- [Lenis](https://lenis.dev/): smooth public-page anchors; destroyed on workspace navigation and when looping effects are paused or reduced motion is requested.
- Lucide icons and locally bundled Geist / Geist Mono fonts.
- Original Sauda layouts, orbit rings, waveforms, card layering, spotlight surfaces and workspace styling. These are not claimed as copied library components.

The previous editorial stylesheet, generated still-life artwork and unused fonts were removed from this branch. Git history retains the previous design.

## Interactive behaviour

The playground offers watches, kurtas and gift bags. Changing the budget updates the opening offer and total; a four-step illustrative conversation confirms a price, quantity and delivery or pickup. Playback is opt-in, can be paused, and has manual steps. Language previews are text only. FAQs expand independently of the shopping workflow. A header control pauses looping decorations; reduced-motion preferences also disable decorative motion.

The protected workspace retains the existing API, sign-in, request form, saved requests, quote review and transcript functionality. All landing examples are explicitly labelled simulations. They do not call shops, place orders, or represent real quotes. Actual completed test-call results remain in the protected workspace. Automatic shop discovery and fresh phone-audio language verification remain outside this design change.

## Validation — 31 October 2026

- TypeScript and Vite production build passed; effects and Motion use separate chunks.
- Chrome desktop at 1440 × 1000 and phone at 390 × 844 visually checked, with no horizontal document overflow.
- Checked product switching, budget keyboard adjustment and recalculation, conversation playback, manual steps, language selection and FAQ expansion.
- Existing access-code sign-in through the proxy loaded the saved workspace requests. Request dialog checked without creating a request or making a call.
- Browser errors checked during the preview flows. Reduced-motion implementation reviewed; OS preference emulation not performed.
- Backend and agent settings were not changed. No new live-call or phone-language validation is claimed.

Ignored local screenshots are under `private/design-preview-v2/`.

Licenses: `frontend/THIRD_PARTY_NOTICES.md` and `frontend/licenses/Apache-2.0.txt` include the Magic UI, Libraries.dev and bundled Paper Shaders notices.
