# Cloudinary upload report

Append-only log of controlled uploads (no credentials recorded).

## 2026-10-19T10:10:10.933Z

- portfolio/projects/eventies/cover: uploaded v1792404610, 1600×960 webp, 233.2 KB.
- STOPPED: portfolio/projects/eventies/cover: Cloudinary copy does not match the local original (checksum or dimensions).

## 2026-10-19T10:10:51.396Z

- portfolio/projects/eventies/cover: already present with identical content (v1792404610); adopted.

Note on the first run: the upload itself succeeded. The STOPPED line came from a verifier bug: the Admin API resource lookup does not return an `etag`, so the comparison was against `undefined`. The verifier now downloads the delivered original and compares MD5 (`d67f0c1a…0b97`, 238,828 bytes, identical to `/covers/eventies.webp`). The second run found that identical asset and adopted it without uploading again. Cloudinary holds exactly one copy.

## 2026-10-19T10:36:25.993Z

- portfolio/projects/eventies/screenshot-01: uploaded v1792406176, 1920×1200 webp, 254.6 KB.
- portfolio/projects/glitzz-lab/screenshot-03: uploaded v1792406178, 1920×1200 webp, 162.6 KB.
- portfolio/projects/vr-cycling/cover: uploaded v1792406181, 1448×1086 webp, 174.8 KB.
- portfolio/site/process/02-system: uploaded v1792406184, 1280×853 webp, 62.0 KB.

## 2026-10-19T10:45:40.131Z

- portfolio/projects/basket-beats/card-cover: uploaded v1792406713, 900×506 webp, 61.3 KB.
- portfolio/projects/basket-beats/cover: uploaded v1792406716, 960×540 webp, 85.8 KB.
- portfolio/projects/bike-land-trainer/cover: uploaded v1792406719, 1448×1086 webp, 212.0 KB.
- portfolio/projects/bike-land-trainer/screenshot-01: uploaded v1792406721, 1586×992 webp, 254.5 KB.
- portfolio/projects/bike-tower/card-cover: uploaded v1792406724, 749×563 webp, 31.0 KB.
- portfolio/projects/bike-tower/cover: uploaded v1792406726, 1331×1000 webp, 97.9 KB.
- portfolio/projects/eventies/screenshot-02: uploaded v1792406729, 1920×1200 webp, 131.0 KB.
- portfolio/projects/eventies/screenshot-03: uploaded v1792406732, 1920×1200 webp, 223.5 KB.
- portfolio/projects/eventies/screenshot-04: uploaded v1792406734, 1920×1200 webp, 110.5 KB.
- portfolio/projects/financial-operations/cover: uploaded v1792406737, 1600×900 webp, 131.1 KB.

## 2026-10-19T10:46:09.572Z

- portfolio/projects/glitzz-lab/cover: uploaded v1792406747, 1600×836 webp, 141.0 KB.
- portfolio/projects/glitzz-lab/screenshot-01: uploaded v1792406749, 1920×1200 webp, 154.2 KB.
- portfolio/projects/glitzz-lab/screenshot-02: uploaded v1792406752, 1920×1200 webp, 135.3 KB.
- portfolio/projects/glitzz-lab/screenshot-04: uploaded v1792406755, 1920×1200 webp, 123.0 KB.
- portfolio/projects/glitzz-lab/screenshot-05: uploaded v1792406757, 1920×1200 webp, 177.1 KB.
- portfolio/projects/outreach-automation/cover: uploaded v1792406759, 1600×902 webp, 125.2 KB.
- portfolio/projects/terminal-nfc/cover: uploaded v1792406761, 1600×902 webp, 106.8 KB.
- portfolio/projects/traffic-flow-analytics/cover: uploaded v1792406764, 1600×900 webp, 143.6 KB.
- portfolio/projects/umniah-youthconnect/cover: uploaded v1792406766, 1600×903 webp, 142.9 KB.
- portfolio/site/process/01-context: uploaded v1792406768, 1280×853 webp, 62.0 KB.

## 2026-10-19T11:02:12.762Z

- portfolio/site/process/03-iteration: uploaded v1792407730, 1280×853 webp, 77.7 KB.
