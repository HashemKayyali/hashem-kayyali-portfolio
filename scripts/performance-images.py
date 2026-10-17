"""Deterministic, public-source thumbnails; leaves covers and galleries intact.

Run with Pillow installed: python scripts/performance-images.py
Card variants use existing card crops, preserving the approved composition.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
public = ROOT / "public"
sources = sorted((public / "projects").glob("*/card-cover.webp"))
sources += sorted((public / "experience").glob("*.webp"))
sources = [p for p in sources if "-thumb-" not in p.stem]
manifest = []
for source in sources:
    with Image.open(source) as opened:
        oriented = ImageOps.exif_transpose(opened)
        image = oriented.convert("RGBA" if "A" in oriented.getbands() else "RGB")
        variants = []
        for width in (320, 640):
            # Never upscale a small logo: optimize at source width and publish
            # its real descriptor rather than claiming nonexistent pixels.
            actual_width = min(width, image.width)
            height = round(image.height * actual_width / image.width)
            resized = image.resize((actual_width, height), Image.Resampling.LANCZOS)
            target = source.with_name(f"{source.stem}-thumb-{width}.webp")
            resized.save(target, "WEBP", quality=82, method=6, exact=True)
            variants.append({"url": "/" + target.relative_to(public).as_posix(), "width": actual_width, "height": height, "bytes": target.stat().st_size})
        manifest.append({"source": "/" + source.relative_to(public).as_posix(), "bytes": source.stat().st_size, "width": image.width, "height": image.height, "variants": variants})
out = ROOT / "output" / "performance-images.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"sources": len(manifest), "sourceBytes": sum(row["bytes"] for row in manifest), "thumb320Bytes": sum(v["bytes"] for row in manifest for v in row["variants"] if v["url"].endswith("-320.webp")), "thumb640Bytes": sum(v["bytes"] for row in manifest for v in row["variants"] if v["url"].endswith("-640.webp")), "manifest": str(out)}, indent=2))
