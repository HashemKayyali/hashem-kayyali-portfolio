# Production blockers (editorial pass, 2026-10-21)

1. **The Terminal cover image is the retired POS poster.** `/covers/terminal-nfc.webp` (and its -320/-640/-960 widths) reads "NFC-Based Point of Sale System" and still appears on the Home and Projects cards and in neighbouring case-study links. The Terminal case study itself no longer shows it (`visibleCaseMedia` returns no media for `terminal-nfc`, so the page shows the architecture diagram only).
   - No approved cover for the current RFID simulator-control system exists yet, and none was invented.
   - Before production: supply an approved current-system cover (replace the file, or set a cover through Studio), then remove the exclusion in `preview/case-presentation.ts` if new case-study images are added.
2. The legacy raw folder `/projects/the-terminal-nfc/` (invoice screenshot) remains withheld and unused; do not reintroduce it as current evidence.
