# Production blockers

None open. The Terminal media is resolved (21 Oct 2026):

- Cover: owner-supplied promotional artwork (`/covers/terminal-nfc*.webp`), captioned as promotional artwork, not an exact screenshot.
- Gallery: six real admin-dashboard crops (`/v2-media/terminal-sim-01…06`), exact pixel regions of owner-supplied screenshots, all captioned as demo data. Source mapping: 01 simulator workspace (crop of the Flight workspace), 02 main control PC, 03 guided-setup readiness, 04 motion sensor and calibration, 05 mobile (Arabic), 06 Loyverse reconciliation (carries the app's own DEMO DATA banner). Screenshots containing an operator email, card codes or Studio test records were not used.
- The retired POS poster, the invoice screenshot and `/projects/the-terminal-nfc/` stay withheld and unused.
- `media/cloudinary-manifest.json` regenerated; the old Terminal cover is marked stale there and its Cloudinary entries are gone from `preview/cloudinary-static.ts`. Covers are served locally, so nothing is uploaded or needed from Cloudinary.
- No Studio cover override exists for the Terminal (production currently has one only for Umniah).
