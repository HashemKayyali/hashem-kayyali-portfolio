# Premium motion — first approval slice

User brief is the implementation authorization; retain existing routing, localized copy, SEO and assets. No commits, push, deployment or V1 edits.

- [x] Inspect actual GSAP usage and capture baseline through official Playwright / DevTools MCP.
- [x] Home: masked word reveal, coordinated supporting copy, portrait reveal/depth and stronger warm-white/burgundy composition. Keep the removed signature absent.
- [x] Featured projects: three art-directed presentations using existing approved media; shared ScrollTrigger reveal, parallax, restrained exit. Rebuild triggers when filters change.
- [x] Navigation: short outgoing/incoming timeline; latest navigation wins; native links, keyboard focus, deep links, locale changes, Back/Forward scroll restoration; scoped useGSAP cleanup.
- [x] Functional browser checks: normal/reduced motion, five languages, mobile/RTL, filters, repeated/rapid navigation, retained content/metadata.
- [x] Record actual normal-motion desktop/mobile browser videos, runtime GSAP timelines/ScrollTrigger evidence and fresh DevTools traces.
- [x] Prepare one working review page and stop for approval. Experience / Skills overhaul deferred; existing timeline recorded as baseline only. Rive stays optional/inactive with functioning fallback/spec, not claimed complete.

Motion language: masked vertical typography, portrait wipe then scale settle, project media wipe paired with copy, small native-scroll depth. No pins, scroll hijacking, cursor gimmicks or new generated screenshots. GSAP / ScrollTrigger / @gsap/react are directly used; one existing low-resolution fluid renderer remains shared.

Performance constraints: prioritize transform/opacity, isolate masks, cap fluid paints at 12 desktop / 8 mobile fps; reduced motion and constrained devices remain fully readable/static. Keep hidden/offscreen repaint suppression. Measure rather than claim production performance from localhost.

Delivery: `/preview/premium-review.html`, five real browser WebM recordings and English/Arabic visual captures. Review report: `output/playwright/motion-lab/overhaul-review.md`. Approved professional data and V1 unchanged. Final build: 85 localized route shells, entry JS 130.74KB gzip. Local warm-load DevTools observation: desktop LCP439ms, mobile CPU4× LCP1983ms, CLS0. Eight trusted navigation interactions observed a maximum Event Timing duration of 136ms; not field INP. Read-only review findings corrected: RTL effect timing, filter geometry, exit context retention, canceled observer initialization. Approval remains pending.
