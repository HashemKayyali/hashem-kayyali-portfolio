# Original V1 smoke — source and recovery

V1 is read-only: `C:/Users/hashe/Desktop/site`. No V1 source, asset, cache, Git state or build was written. Existing `dist/` was served read-only at port 8781 for actual-site recordings; the complete application was not copied.

## Original source architecture

`components/ui/global-burgundy-warp-background.tsx` owns a fullscreen WebGL canvas, vertex shader and original fragment shader. React useEffect creates and cleans up buffers/programs/listeners. Six triangle vertices cover the frame. There is no image texture or external smoke asset/dependency.

GLSL: sine hash → cubic-smoothed bilinear value noise → five-octave rotated fBM (amplitude .54, rotation .82/.57, lacunarity 2.03, decay .5) → radial twist → q domain warp → r domain warp → field → sinusoidal ribbon → folds/highlights → five uniform pigment ramps → dark vignette and screen-space grain. Time starts at 4.2 seconds and has an internal .10 factor. Crucially q.x/q.y and r.x/r.y have different axis-specific time offsets.

Resize measures the real canvas, correcting aspect in GLSL. V1 caps DPR to 1.25 (or 1 low power), uses .72/.82/.9 rendering quality tiers with a 480×360 minimum, and schedules at 20fps mobile /30fps desktop. Hidden/reduced/low-power loops stop; reduced mode retains a bitmap for consumers. Context loss stops the loop. `burgundy-warp-runtime.ts` publishes shared frames, groups requests by ramp/density, and delivers at 15fps so equal-ramp consumers share a render. A lazily compiled 512×384 scratch WebGL context handles custom ramps. This is a domain-warp field, not a Navier–Stokes velocity simulation.

V1 composites its dark field behind an overlay/sheen; those dark page overlays were not ported to the editorial V2. There are no smoke textures to recover.

## What V2 had lost

- `light-warp.ts` used three noise octaves (two mobile), mediump precision, faster time factors, a simplified plume/envelope in smoke mode and a synthetic band in ribbon mode. `fluid-renderer.ts` painted gradient/plume substitutes for fallbacks on the UI thread.
- The previous Home Worker had restored five octaves, radial and nested q/r structure, but q.y used scalar `-t*.28` and r.x scalar `+t*.22`, translating both axes. Original V1 uses `-vec2(t*.28,0)` / `+vec2(t*.22,0)` respectively.
- That Worker used density .86 and a thresholded pigment (`smoothstep(.40,.58,folds)`), losing the original continuous five-stop fold blending. Its bitmap was only 320×240 desktop /224×168 mobile.

## Exact source reused and deliberate adaptations

`preview/v1-warp-shader.ts` contains the **verbatim original GLSL fragment**, independently hashed by a permanent test. `scripts/recover-v1-warp.py` is the read-only transcription procedure and refuses to overwrite an existing recovered module.

- Fragment SHA-256: `a378a6f85f61762e2c10ddd7561ec1bde7bb5a9fa97424eee93cd281fd5671bf`.
- V1 component file SHA-256: `1a72b2a1267887a19d6c19727e67ed84738998c8fe4c830892e7fdc1a972d45f`.
- V1 runtime SHA-256: `e386feb983c79fc79f884cfa64c3974f39fbc3c4a5fbcbed99411d2d226eb52a`.

The editorial shader is derived from the verbatim string by omitting the final dark vignette and screen-space grain. All original geometry, noise, motion, folds, highlights and five blend equations remain identical. Density is 1, as in the original shared field. V2 uniforms come from existing brand.css tokens: paper, paper, primary Burgundy, supporting Burgundy, Dark Wine. Paper-to-pigment antialiasing produces intermediate tones; no separate grey/pink/magenta pigment is introduced. The local reference tool compares both ramps at precisely the same density, time and resolution.

`home-silk.worker.ts` compiles this actual editorial shader; `HomeSilk.tsx` supplies its ramp, schedules/copies frames, defers startup until portrait completion and owns one shared Worker. Other existing `MotionField` surfaces now register with that same runtime through `fluid-renderer.ts`, so there is no second main-thread approximate renderer. Existing `light-warp.ts` is retained for history/tooling but no longer imported by portfolio runtime.

Performance adaptations preserve motion equations: bounded 512×384 desktop /320×240 mobile bitmap (matching the original scratch renderer's scale), 12/8 background frame caps, paused elapsed time when hidden/offscreen, resource disposal and breakpoint sizing independent of DPR. Local decorative field crops/feathering remain the existing V2 layout, rather than transplanting V1's fullscreen dark app.

`public/v2-media/v1-warp-still.webp` is a genuine browser capture of this shader at time 4.2s, 512×384, density 1 (30,538 bytes), registered in the existing media manifest. Reduced motion / unavailable WebGL / constrained devices use this image. No CSS-generated plume or AI image substitutes for it.

## Review evidence

- Actual V1-site recordings: `output/playwright/design-intelligence/v1-en-1440-smoke-portrait.webm`, `v1-en-390-smoke-portrait.webm`.
- Actual pre-session V2 recordings: `before-en-1440-smoke-portrait.webm`, `before-en-390-smoke-portrait.webm`.
- Matched shader still: `v1-v2-shader-reference.png` and development-only `/preview/v1-smoke-reference.html` at port 5176. The tool is excluded from the production entry.
- Final V2 recordings/screenshots and traces are indexed by the local review page and verification report.

Shader-source equality proves authentic equations; real browser recordings establish the appearance and scheduling. The original V1 fullscreen composition and V2 local paper composition intentionally differ. No pixel-identical full application or physical-device GPU guarantee is claimed.
