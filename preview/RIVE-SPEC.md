# Connected Systems — custom Rive asset specification

Status: integration prepared; **no custom `.riv` has been authored or supplied**.
The development-only `/preview/rive-demo.html` specimen is an accessible, functioning SVG fallback, not a Rive animation. The signature remains removed from the portfolio Hero at the user's request.
No available connected tool in this session can author/export a valid custom Rive file.
No stock Rive animation or fabricated binary is used.

## Visual concept

One optional, separately reviewed interaction: physical hardware → software logic → connected products. Its eventual placement requires design approval; it is not restored underneath the Hero actions.
It expresses the portfolio's engineering focus, not a product architecture or a claimed hardware design.
Use a small outlined square, a precise diamond and a circle joined by a fine signal path.
Palette: warm paper `#FCFAF9`, deep Burgundy `#58152D`, secondary Wine `#70203A`, dark Wine `#3E1022`.
Keep accessible, localized labels in HTML, outside the animated canvas.
The signature mirrors in Arabic; DOM reading order and labels remain localized.

## Required authoring contract

| Property | Required value |
| --- | --- |
| Destination | `public/v2-media/connected-systems.riv` |
| Artboard | `ConnectedSystems`, 360 × 80, transparent |
| State machine | `Signals` |
| Boolean input | `hover` |
| Boolean input | `active` |
| Number input | `progress`, 0–100 |
| Idle | Quiet connected line and outlined nodes, no continuous decorative loop |
| Hover | Gentle node emphasis, 160–240 ms, no scale jump |
| Active | One controlled signal traverse, 450–700 ms; retain a connected end state |
| Exit | Return cleanly to Idle when active and hover are false |
| Budget | Aim below 80 KB; vector-only, no external fonts/images/audio/URLs |

Provide both the editable authoring source and valid exported `.riv`. A designer should
review the vector composition in the editor, export the specified names/inputs, and
verify Idle/Hover/Active transitions before enabling it.

## Integration and fallback

`preview/rive-asset.json` currently has `src: null`, deliberately preventing a request
or Rive runtime download. When the custom asset is approved, set that source to the
destination above and rebuild. The loader fetches the asset first, rejects HTTP errors
or malformed/HTML payloads using the RIVE header, then imports `@rive-app/canvas` and
the matching bundled WASM. It disables external Rive asset CDN loading and verifies
all expected inputs before exposing the canvas. Runtime load failures preserve the SVG.

The native button handles Enter/Space, pointer hover, focus, and a persistent pressed
state. The SVG changes state without animation and remains meaningful with reduced
motion. Canvas is decorative; the button's localized accessible name describes its role.
The prepared runtime updates inputs, resizes to its canvas, pauses offscreen/hidden and
under reduced motion, and cleans up on unmount. The valid custom-asset success path
cannot be end-to-end verified until that asset exists. Missing-asset behavior, keyboard
interaction and zero Rive/WASM downloads were checked in the actual browser.

## References

[Rive web runtime source](https://github.com/rive-app/rive-wasm/blob/master/js/src/rive.ts),
[state-machine runtime guidance](https://github.com/rive-app/help-center/blob/master/runtimes/state-machines.md).
