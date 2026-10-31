# Sauda — Voice agents. Reimagined

The public frontend follows the user-selected [Liquid Sculpture Hero](https://21st.dev/@gughigug/components/liquid-sculpture-hero): warm stone `#EBE9E5`, ink `#151514`, metallic filaments, Geist headings and Instrument Serif italic accents. The headline is “Voice agents. Reimagined”. The private shopping desk and backend contracts are unchanged by this integration.

## Local preview

- Branch: `aashu/frontend-omp`; no push or deployment is part of this work.
- Landing: `http://127.0.0.1:5173/`; workspace: `http://127.0.0.1:5173/#/workspace`.
- Existing launchers: `./private/dev-backend.sh` and `./private/dev-frontend.sh`.
- Frontend build: `npm run build` from `frontend/`.
- Vite retains the same-origin `/v1` proxy to port 8000. Never expose the local access code or enable paid calls for visual testing.

## Selected assets and components

- `frontend/src/components/ui/liquid-sculpture-hero.tsx`: Guglielmo Giannattasio’s original WebGL2 flow-map/GPGPU particle engine and hero layout, adapted from the [source mirror](https://github.com/N00385644/liquid-hero/blob/dce8ea5a723fa29ee06a6f57e9e99c80d6bab2d0/src/components/ui/liquid-sculpture-hero.tsx). The creator credit remains visible. Light, dark and portrait images from the supplied 21st CDN URLs are served locally from `frontend/public/sculpture/`.
- `encrypted-text.tsx`: the supplied 21st-style progressive character reveal. Screen readers receive stable complete text; visual character flips update independently of reveal progress.
- `animated-hero.tsx`: the supplied spring-driven rotating-word pattern, used below the primary hero for “Price. Availability. Delivery.” Real workspace and playground links replace the template’s article, signup and call links.
- `ascii-silk.tsx` and `ascii-silk-renderer.ts`: Canvas2D implementation of the supplied procedural silk/voxel recipe. The source is generated, not a photograph. Three-CSS-pixel cells, color correction, tint, post-effects and flicker animate independently of audio or calling state. Other primitive modes, glow points and reveal masks are supported by the renderer. The silk field is a procedural interpretation: the JSON does not include the original GLSL, so pixel-identical shader output is not claimed.
- Existing [Libraries.dev](https://libraries.dev/) Liquid, VoiceBeam and BorderBeam remain in the explicitly simulated playground and closing action. No paid catalog components were copied.
- Geist, Geist Mono and Instrument Serif are bundled locally. The hero does not fetch Google Fonts at runtime.

The header pause button controls decorative effects. Reduced-motion preferences show the static sculpture and final text. The sculpture and silk stop offscreen or while the tab is hidden. WebGL2 failure retains the original static sculpture. Hero controls are 44px touch targets; portrait artwork stays above the copy.

## Registry setup

This Vite app already uses TypeScript. It now also supports Tailwind CSS v4 and the shadcn component layout:

- Component path: `frontend/src/components/ui`, resolved as `@/components/ui`, not a second repository-root `/components/ui` directory. Keeping this path consistent lets registry imports resolve without duplicate components.
- Utility helper: `frontend/src/lib/utils.ts` (`@/lib/utils`), using `clsx` and `tailwind-merge`.
- Registry metadata: `frontend/components.json`.
- Tailwind theme and utilities: `frontend/src/registry.css`; the Vite plugin is configured in `frontend/vite.config.ts`. Preflight is deliberately omitted to preserve the existing app reset.
- The supplied shadcn `Button` uses Radix Slot and class-variance-authority. The rotating-word section uses it for real navigation links.
- Motion comes from the already installed `motion/react`; no duplicate `framer-motion` runtime is needed.

Run `npm ci` from `frontend/` on a fresh checkout. To add a future shadcn component, run `npx shadcn@latest add accordion` from that directory, then inspect its styles against the existing app. No `shadcn init` or TypeScript migration is needed for this checkout.

## Truthfulness and boundaries

The playground remains a labeled fictional text simulation. It does not make calls, capture a microphone, produce real merchant quotes, or claim savings. The authenticated workspace retains actual API-backed requests, recipient consent, readiness gating and quote evidence. No purchasing, reservations, deposits or commitments are introduced.

## Local verification — 31 October 2026

- TypeScript and Vite production build passed.
- Chrome: desktop hero, pointer-driven liquid response, light/dark switching, pause/resume, reduced motion, and no-WebGL fallback exercised.
- Responsive checks at 360, 390 and 768px found no horizontal document overflow. Desktop and mobile screenshots were inspected.
- Playground scenario switching, Hindi text playback through all four messages, and navigation to the real workspace login exercised without signing in or changing saved data.
- Canvas assertions exercised 25 primitive modes, animated matrix output, distinct voxel/halfblock/contour behavior, coverage, normal/inverted reveal masks and luminance/overlay boundaries. Silk animation and pause were checked from actual canvas pixels.
- No browser page errors or call-creation POSTs were observed during the smoke run.
- Screenshots: ignored `private/sculpture-review/`. Throwaway smoke scripts are removed after verification.
- Backend tests, live calls, fresh phone-language behavior, real-device GPU performance and screen-reader software were not tested in this pass. The component is listed as MIT by 21st; separate image redistribution rights still need confirmation before public deployment.

Licenses and source links: `frontend/THIRD_PARTY_NOTICES.md`.
