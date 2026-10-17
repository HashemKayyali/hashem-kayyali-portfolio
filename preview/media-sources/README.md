# Visual production sources

Two new, original raster illustrations were generated with the actual available
`image_gen.imagegen` tool on 2026-10-12. Source PNG files are retained here outside
the public delivery directory. Neither is a product screenshot or evidence of a
customer/deployment. The existing project media remain the primary evidence.

## Bike Tower concept

Generation source: `exec-002ef235-7508-4ec9-97bf-6ef62ad7f0b5.png`.
Purpose: explain the idea of physical input → coordinated software → responsive light.
Brief: a premium landscape engineering still life on warm ivory; a sculptural pedal
and crank on the left, an abstract controller block at center, four symbolic rose /
burgundy light columns on the right, joined by a fluid folded burgundy trace. Fine
materials, soft light, no labels, logos, measurements, fabricated UI or detailed PCB.
The controller and light structures are conceptual shapes, not photographed hardware.

## Eventies concept

Generation source: `exec-7076f921-4d57-41a1-bf25-538536f443ba.png`.
Purpose: connect an authentic event-services platform interface to a restrained
conceptual event-preparation atmosphere.
Brief: warm-white architecture, a modular exhibition plinth, a blank translucent
display, one stage spotlight, burgundy flowing fabric and restrained floral detail;
professional soft daylight, no people, client logos, text, fabricated interface or
claim of an actual venue or deployment.

## Delivery and privacy

`prepare-media.py` produces 320 / 640 / 1280 / 1600-pixel WebP derivatives, clipped
to native source widths. Intrinsic dimensions and source sets are rendered in the
preview; offscreen images are lazy loaded. Every conceptual visual has a localized
caption explicitly stating that it is AI-generated and not an actual deployment.

The same script makes **opaque, deterministic** privacy redactions in copies of real
Terminal customer name/phone fields and the operator identifier, plus Bike Tower's
local IP header. It does not fabricate replacement names, alter product UI behavior
or touch the original assets. The browser image viewer uses these same redacted copies.

`public/v2-media/manifest.json` records sources, classifications, purposes, redaction
rectangles, derivative dimensions and bytes. `fluid-still.webp` is a small captured
frame of the implemented shared V1-inspired shader, used as a static fallback; it is
procedural decorative artwork, not imagegen or project evidence.
