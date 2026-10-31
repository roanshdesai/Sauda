# Magic UI

BlurFade.tsx, NumberTicker.tsx, AnimatedBeam.tsx and BorderBeam.tsx are adapted from https://github.com/magicuidesign/magicui (retrieved 2026-10-29 and 2026-10-31). Changes: reduced motion support, local styles, Indian number formatting and accessible labels.

MIT License

Copyright (c) Magic UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


# Libraries.dev — Thinking Orbs and Liquid Metal

Installed as `thinking-orbs` and `metal-fx` from https://github.com/Jakubantalik/Libraries.dev.

MIT License

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Liquid Metal bundled shader notice

metal-fx
Copyright (c) Jakub Antalik

This product includes software developed by Paper Design, Inc.

  Paper Shaders (https://github.com/paper-design/shaders)
  Copyright (c) Paper Design, Inc.
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0

Specifically:

  * The `liquidMetal` fragment shader is consumed unmodified at build time
    from the `@paper-design/shaders` npm package and inlined into the
    distributed bundle. See src/engine/shaders.ts.

  * The sizing vertex shader in src/engine/shaders.ts (`VERT_SHADER_SRC`) is
    copied verbatim from `packages/shaders/src/vertex-shader.ts` @ 0.0.80.
    It is vendored rather than imported because the package exposes it only
    through `ShaderMount`, which owns its own canvas and animation loop.

No changes were made to either shader's source.

The Apache 2.0 license is included in `licenses/Apache-2.0.txt`.

# Liquid Sculpture Hero — Guglielmo Giannattasio

`src/components/ui/liquid-sculpture-hero.tsx` is adapted from the component supplied by the user and mirrored at:
https://github.com/N00385644/liquid-hero/blob/dce8ea5a723fa29ee06a6f57e9e99c80d6bab2d0/src/components/ui/liquid-sculpture-hero.tsx

21st lists the component as MIT: https://21st.dev/@gughigug/components/liquid-sculpture-hero.md

Copyright (c) Guglielmo Giannattasio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Changes: local images, bundled fonts, pause/reduced-motion and combined visibility handling, theme callback, navigation slot, portrait spacing and GPU cleanup.

The four sculpture images in `public/sculpture/` came from these user-supplied URLs:

- https://cdn.21st.dev/assets/mirror/ae/ae8c3de9003460e59182e950ccd345f68f27f9d0e4808b64c92c962a4eca7120.webp
- https://cdn.21st.dev/assets/mirror/a1/a1fa387b6e417b26a25f317559c87cce4d241c1052c52a2b3bc2966b2aaf9b65.webp
- https://cdn.21st.dev/assets/mirror/b0/b0c8d8e5d64b8cec906a3b390e3dc7c9a5af08334bf0632873c601782cb4bc46.webp
- https://cdn.21st.dev/assets/mirror/9a/9a82cb59be1bfde59855b79d7a565e487155a89f4d52eac74dcc10e267b2b6d1.webp

The component's MIT listing does not separately establish image redistribution rights. Confirm those rights before public deployment.

# Supplied 21st text patterns and shadcn/ui

`encrypted-text.tsx` and `animated-hero.tsx` adapt the component snippets supplied by the user. Changes: stable accessible text, independent scramble updates, reduced motion, pause controls, Motion package reuse, scoped CSS and truthful Sauda links/copy.

`button.tsx` follows the supplied shadcn/ui Button (https://github.com/shadcn-ui/ui), MIT, Copyright (c) 2023 shadcn. The MIT permission and warranty terms above apply.

The ASCII renderer is a new procedural interpretation of the supplied “dwar” recipe from https://21st.dev/community/ascii; no proprietary shader source or photograph is included.

Current Libraries.dev packages are `liquid-gooey`, `voice-glow` and `border-beam`, by Jakub Antalik. Earlier package notices above are retained as historical attribution.

Instrument Serif is bundled through `@fontsource/instrument-serif` under the SIL Open Font License 1.1; the installed package includes its license.
