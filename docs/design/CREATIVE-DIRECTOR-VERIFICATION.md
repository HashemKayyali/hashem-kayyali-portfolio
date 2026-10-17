# Creative Director verification — 13 October 2026

Working local review: [Creative Lab Arabic](http://127.0.0.1:4176/preview/creative/ar/), [corrected V2 Arabic](http://127.0.0.1:4176/preview/ar/), [interactive comparisons and real videos](http://127.0.0.1:5176/preview/creative-review.html). English and the other existing locales work by replacing the locale segment. These are local noindex previews; no publication or merge.

## Delivered behavior

Approved V2 now uses an adaptive wide canvas instead of1320/1200px page caps. At1366×768 its headline changes117.5→82px (~30% smaller), portrait620→420px (~32% shorter), and actions move from~751px to~572px bottom position. Body remains legible rather than uniformly scaled. Gutters12–40px vary by viewport, long prose retains reading measures, and height-aware laptop rules reduce oversized openings. Wide case media retains its true ratio/captions and a1440px evidence frame within the broader page canvas.

One Engineering Exhibition Lab is implemented in new Home/Gallery components, separate `/preview/creative/` routes and lazy scoped CSS. Home has a portrait/identity/evidence opening, three distinct product stages, concise focus/career/toolkit/contact. Gallery groups four connected products and seven software/systems entries, retains all11 projects/six filters/index, and uses genuine images plus small labelled diagrams for protected systems. Native shared nav/locale/Back/case studies persist within Lab routes. Five localized interface group/edition labels are new; professional copy and all source dictionaries/media are unchanged.

## Commands and actual outcomes

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit0 |
| `npm test` |8/8 pass |
| `node --test preview/*.test.mjs` |18/18 pass, including new creative route isolation plus existing contrast/privacy/shader/motion/content tests |
| `npm run validate:content` |14/14 pass |
| `npm run build:light` | exit0;170 noindex locale route shells,85 per experience |
| Playwright MCP final viewport capture |32 final Lab Home/Gallery EN/AR cases,8 required sizes; no overflow/page errors; one h1;11 gallery projects; exactly one eager first exhibit |
| Playwright MCP route audit |85 Lab destinations across all5 locales;55 case studies; no lost Lab links, broken loaded images, overflow or page errors |
| Intermediate mobile/tablet audit |20 cases:320/390/800/801 ×5 locales; full-width mobile copy and one-row header |
| Actual interaction script |26/26 checks pass; Back131→131px; locale1600→1600px; focus/filter restored; menu Enter/Tab/Escape/outside; native5-language select; reduced motion/reflow/native résumé link |
| Final case geometry |12 EN/AR openings at1366/2560 for Bike Tower/Terminal/Eventies; all media/captions within their figures |
| PDF HTTP and bytes |200 application/pdf,190494 bytes, `%PDF-`, SHA matches genuine public source |
| Independent review |two initialP2 issues fixed; final delta review finds no material defect |

The first route-audit helper mistakenly required a case view on the gallery URL; the recorded five `casePresent:false` gallery values are expected, not app failures. The corrected destination predicate separates gallery from detail. A browser PDF fetch returned204 from the MCP surface; direct HTTP and exact bytes verify the real download. Neither harness issue was patched around in product code.

## Visual evidence and real recordings

Ignored evidence root: `output/playwright/creative-director/`. Baseline32 EN/AR Home/Gallery captures cover1280×720,1366×768,1440×900,1536×864,1920×1080,2560×1440,390×844,320×740. Approved after32 captures and32 composed A comparisons accompany32 final Lab openings plus32 scrolled work captures. Home full-page evidence at1366/390 is explicitly reduced-motion final state so reverse scroll reveals do not hide offscreen media; Gallery full-page evidence follows a real scroll tour. Final ordinary-motion openings wait for both portrait/title completion and fonts.

Independent source board was captured before Lab implementation: `preview/creative-art-direction.html`, `source-board-1366.png`, `source-board-390.png`. Final same-input combined comparisons and focused crop exist; root `design-qa.md` records each defect, fix, recapture, all five fidelity surfaces and result `passed`. Source covers Home only; Gallery is evaluated against the written direction/real media and is not falsely presented as a pixel clone.

Six actual WebM videos at1366EN,1536AR,1920EN,2560AR,390EN,320AR show real GSAP portrait/selected work/gallery/image-to-case/Back. Duration~9.7–11.4s, native recorded dimensions, zero page errors. Final three wide videos were recaptured after the case-media fix; `videos-wide-final.json` documents that. Native video metadata and a real intermediate portrait frame were inspected in the browser. The first recording attempt failed when the old managed preview server stopped; a partial file is retained. The new standalone hidden Vite preview process serves4176 successfully, and all recordings were repeated successfully.

## Performance observations

Chrome DevTools MCP used the already-installed official server, no package download, network throttling or external analytics. Original load traces cover1366 laptop,2560 wide,390 mobile andCPU4. Separate refinement/final CPU4 traces and a final Arabic Gallery scroll trace are retained. Foreground rAF gaps are measured only while actual GSAP portrait progress is15–75%, rather than counting startup as a mid-reveal freeze.

| Run | Central max | P95 | Central >50ms tasks |
| --- | ---: | ---: | ---: |
| Initial Lab laptop |41.7ms |14.2ms |0 |
| Initial Lab wide |34.8ms |20.6ms |0 |
| Initial Lab mobile |15.0ms |13.8ms |0 |
| Initial LabCPU4 |83.3ms |83.3ms |5 |
| Intermediate containment-onlyCPU4 |131.9ms |104.3ms |4 |
| Final LabCPU4 |27.9ms |20.9ms |0 |

Containment alone was not accepted as a fix. The final implementation retains per-name masks and the exact1.1s portrait side wipe/1.35s settle, removes redundant Latin character work only in Lab, avoids moving the large translucent field concurrently and waits for portrait completion before passive chapter setup. Existing explicit-scroll override stays responsive. The exact shader/one-worker/12fps desktop/8fps mobile/reduced-motion lifecycle is preserved; no GSAP global FPS cap or Lab pinning.

Final CPU4 trace LCP2035ms, CLS0.00; probe LCP2036ms differs by1ms rounding. Startup still has a985ms long task under4× CPU. Initial normal-load timings predate the final scheduling change and are labelled accordingly, not marketed as final-device guarantees. Network is local, caching/device load differs, and there are no field/CrUX data. Gallery scroll probe includes intentional50ms step waits; its sample intervals are not an FPS benchmark. The complete raw traces/probes and `performance-final-summary.json` support these precise limits.

Build: main JS416.02KB/gzip140.86KB, shared CSS136.79KB/gzip22.08KB; Lab lazy chunk14.33KB/gzip3.88KB plus25.97KB/gzip4.40KB CSS. No new runtime dependency, paid API, AI-generated asset or V1 write.

## Preservation and checkpoints

Before-task ZIP: `output/checkpoints/design-intelligence-before-2026-10-13-133857.zip`,648 verified source files and status/hash manifest. Geometry milestone134549 and Lab/performance milestone140725 also verified. Final milestone is listed in the final checkpoint manifest. Source preservation compares every original file; professional dictionaries/data/media are byte-identical, no original file is missing, and HEAD remains6a1ae32. V1 fragment digest remainsa378a6f8…5671bf; its original component/runtime SHA values match the frozen provenance. Old work was not reset, committed, pushed, merged or deployed.

## Recommendation and remaining limits

Recommend Lab for owner review: the first screen makes hardware/software evidence visible alongside identity, the complete collection has a clear discipline hierarchy, and frame variety makes distinct projects easier to understand. This is a design judgment, not measured recruiter/conversion evidence. Corrected V2 remains available independently. Promotion awaits the owner's visual decision.

Physical-device GPU behavior, Safari/Firefox, a real screen reader and native200% browser zoom were not tested;683×384 checks equivalent layout reflow on a1366×768 window. Some legacy profile/case captions remain small and can receive a later scoped legibility pass. External website uptime is not guaranteed. Startup work is still heavier than the portrait's central animation. Local server longevity depends on the running machine; `npm run dev:light` and `npm run preview:light` reproduce the two URLs after a restart.
