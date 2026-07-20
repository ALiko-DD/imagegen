# Image Integrity

## Purpose

Provide a medium-neutral baseline against unintended tiling, checkerboard patterns, digital ripples, grime overlays, block buildup, chromatic speckling, edge halos, excessive microcontrast, and synthetic detail unrelated to the represented subject or material.

## Apply when

- The output is a raster image.
- The user has not requested visible corruption across the same role.
- Clean tonal transitions, coherent texture, or stable fine detail matter.
- Photography, illustration, UI, diagrams, products, or mixed layouts may suffer from unrelated visual contamination.

## Do not apply when

Do not prohibit a feature in a role where the user explicitly requests glitch, halftone, screentone, dithering, scan lines, dirt, patina, weathering, grain, mesh, tile, checker patterns, or other deliberate repetition.

Do not treat legitimate brick, fabric, paper, canvas, packaging patterns, or material grain as contamination.

## Compatible controls

- Combine with photographic rendering for camera-like or photoreal output.
- Combine with clean rendering for clean fields and intentionally crisp graphic regions.
- Combine with edit integrity for reference-image editing.
- Combine with existing medium, material, lighting, color, quality, and negative modifiers after resolving conflicts.

## Conflicts and exceptions

- Intentional texture overrides only the matching clause and only in the named role.
- Natural grain may remain when it is irregular, subtle, subordinate, and consistent with the requested medium.
- Actual patterned objects may repeat; unrelated periodic contamination may not.
- Do not use `no texture` when material-specific microtexture is required.

## Atomic Prompt clauses

| ID | Select when | English clause |
| --- | --- | --- |
| `integrity.tonal-continuity` | Gradients, shadows, skies, skin, or smooth surfaces matter | Preserve clean, continuous tonal transitions without ripple-like bands, block boundaries, or dirty overlays. |
| `integrity.material-coherence` | Surfaces need believable texture | Keep every surface texture coherent with its material, scale, lighting, and viewing distance. |
| `integrity.detail-falloff` | The image risks uniform over-detail | Concentrate resolved detail on the primary subject and allow natural detail falloff in secondary regions. |
| `integrity.restrained-processing` | The image risks crunchy processing | Use restrained local contrast and restrained sharpening, with clean edges and no halos or crunchy microcontrast. |
| `integrity.structured-contamination` | Periodic or dirty artifacts are a likely failure | Introduce no unintended tiled, checkerboard, ripple-like, grime-like, blocky, or chromatically speckled contamination. |
| `integrity.synthetic-microdetail` | Decorative detail may overwhelm the subject | Do not generate synthetic micro-detail that is unrelated to the depicted material, construction, or visual hierarchy. |

Select the smallest set that covers the task. Do not paste the table into an actual Prompt.

## Native-format insertion

### JSON

Use selected clauses inside `visual_integrity.global` or in a `scoped` entry whose target already exists.

### Prose

Place one concise `Image integrity:` sentence after visual treatment and before output or prohibitions.

### Markdown

Place selected clauses under `## Visual Integrity` only when the Prompt already uses Markdown.

## Preflight checklist

- [ ] Every selected clause targets a plausible failure for this image.
- [ ] Requested texture and legitimate material repetition remain allowed.
- [ ] Natural grain has not been confused with structured contamination.
- [ ] No clause duplicates an existing task-specific negative constraint.
- [ ] Positive tonal, material, or detail behavior appears before targeted exclusions.
