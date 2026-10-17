# Temporary engineering process illustrations

Generated at the owner's request with the built-in ImageGen tool. These are conceptual illustrations for the process, not photographs or evidence of a completed project. Approved project media stays in its existing folders.

1. `01-context.webp`: understand users, workflows and the requirement.
2. `02-system.webp`: connect clear modular parts into a system.
3. `03-iteration.webp`: build, test, measure and refine hardware/software.

Full original PNGs are in `originals/`. Web deliveries are1280px with matching640px responsive variants, full image/no crop. `manifest.json` records dimensions and hashes; `PROMPTS.json` preserves the exact three generation prompts.

To replace a step, put its new full image in this folder and update that step's `src`, `small`, `width`, `height` in `preview/process-illustrations.ts`. Keep the complete native ratio. Optional responsive640px versions use the `-640.webp` suffix. Changing an illustration never changes project cover assets or the GSAP chapter sequence.
