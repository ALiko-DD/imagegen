# Visual Noise Control

## Purpose

Use these cross-cutting authoring controls after the main agent has extracted the request, selected a structure family, and selected the native format. They reduce avoidable visual contamination and synthetic rendering without creating another structure family or modifier taxonomy.

The controls are composable. Do not force the request into exactly one file.

## Control files

| Control | File | Function |
| --- | --- | --- |
| Image integrity | [image-integrity.md](image-integrity.md) | Default prevention of unintended structured contamination and overprocessed detail |
| Photographic rendering | [photographic-rendering.md](photographic-rendering.md) | Camera-like lighting, optics, materials, detail falloff, and grain |
| Clean rendering | [clean-rendering.md](clean-rendering.md) | Smooth fields, intentional crisp edges, clean negative space, and suppressed incidental texture |
| Edit integrity | [edit-integrity.md](edit-integrity.md) | Constrained edits, artifact cleanup, global transformations, and source preservation |

## Selection sequence

1. Have the main agent diagnose and extract the full user contract from the original request and attachments.
2. Resolve blocking ambiguity or conflict with one minimal user clarification.
3. Select one of the thirteen structure families.
4. Select JSON, prose, or Markdown.
5. Identify visual roles, regions, surfaces, edit targets, and preservation anchors.
6. Record intentional grain, texture, dirt, patina, halftone, checker patterns, or other exceptions.
7. Select the visual-noise control stack.
8. Reconcile the stack with explicit user requirements and existing modifiers.
9. Author concise control clauses in the selected native format.

The main agent selects controls and writes Prompt clauses as part of the same pre-generation pass; do not delegate either task to subagents.

## Control-stack matrix

| Requested result | Controls |
| --- | --- |
| Ordinary photography or photoreal rendering | Image integrity + photographic rendering |
| Clean studio or catalog photography | Image integrity + photographic rendering + clean rendering |
| UI, forms, diagrams, flat graphics, or clean brand boards | Image integrity + clean rendering |
| Illustration, anime, painting, collage, or comics | Image integrity + existing medium and material modifiers |
| Local reference-image edit | Image integrity + edit integrity + target rendering controls |
| Artifact cleanup | Image integrity + edit integrity in artifact-cleanup mode |
| Global style transformation | Edit integrity in global-transformation mode + target rendering controls |
| Mixed photographic and graphic canvas | Scope photographic controls to captured subjects and clean controls to graphic regions |
| Multi-image series | Use shared controls only when every output needs them; otherwise scope controls per output |

## Conditional clean-fidelity recipe

Use this recipe when the requested result is a pristine, high-fidelity photographic image, especially a studio product image, catalog image, polished advertising visual, or another clean photoreal presentation. It operationalizes user wording such as `clean image`, `smooth surfaces`, `minimal texture`, `low noise`, `high resolution`, `crisp details`, `sharp focus`, `studio lighting`, `photorealistic`, and `no film grain` without blindly pasting that booster stack.

1. Start with `integrity.low-digital-noise` and only the image-integrity clauses needed for the likely failure modes.
2. Add `photo.clean-fidelity` and the applicable physical-lighting, focus, or material clauses for genuinely photographic roles.
3. Add `clean.pristine-surfaces` and other clean-rendering clauses only to backgrounds, gradients, graphic elements, or surfaces that should actually be smooth and pristine.
4. Use `photo.studio-lighting` only for a requested or clearly entailed controlled studio/catalog setup; otherwise use the scene's physically plausible lighting.
5. Use `clean.no-film-grain` only when a grain-free finish is requested or clearly compatible with the intended medium.
6. Treat `high resolution` as a request for resolved, output-relevant detail, not permission to invent `8K`, `16K`, HDR, extreme sharpening, or uniform micro-detail. API `quality: high` remains a separate runtime setting.
7. When high-contrast text, a logo, label linework, or fine graphics sit on a smooth photographic surface, apply the text-neighborhood safeguard below; general low-noise wording is insufficient for this risk.

For a clean studio product image, the usual stack is:

```text
image-integrity: low digital noise + coherent detail
photographic-rendering: clean photoreal fidelity + controlled studio lighting + believable focus + credible materials
clean-rendering: smooth backdrop and pristine named surfaces + no film grain when compatible
```

This is a selection recipe, not boilerplate. Author the smallest nonduplicative set of atomic clauses in the Prompt's native format.

### Recipe exclusions

- Do not apply `smooth surfaces` or `minimal texture` globally to skin, hair, fabric, wood, stone, paper, foliage, food, or other materially textured subjects.
- Do not add `photorealistic`, photographic focus, or studio-lighting language to UI, diagrams, flat graphics, anime, painting, or other non-photographic roles.
- Do not require a grain-free finish when the user asks for film, documentary, analog, weathered, printed, or intentionally textured output.
- Do not turn `crisp details` or `sharp focus` into uniformly sharp depth, crunchy microcontrast, halos, or synthetic microtexture.

## Text-neighborhood safeguard

Trigger this safeguard when all are true:

- text, a logo, label linework, or another high-contrast graphic must appear on a photographic or rendered surface;
- the supporting surface is smooth, softly graded, glossy, translucent, molded, painted, or otherwise visually uniform;
- the graphic must remain small, exact, reference-matched, or sharply legible.

Treat two named roles separately:

1. **Printed strokes:** require one clean boundary per stroke with correct shape and spacing. Do not request global or aggressive sharpening.
2. **Immediate supporting surface:** keep the narrow surface around and between glyphs as the same smooth, low-frequency material field as the surrounding unprinted area.

Select `clean.single-edge-graphics` and `clean.graphic-neighborhood`. For reference-image editing, also select `edit.protect-printed-region`; add `edit.preserve-source-pixels` when unchanged source pixels can satisfy the requested composition. Keep text-bearing surfaces near front-facing and sufficiently large when the layout permits. Do not rotate, shrink, relight, or reproject them more than the requested result requires.

Prohibit only the relevant local failures: echo contours, concentric or ripple-like bands, embossed or glowing halos, alternating light-dark rings, chromatic fringes, contaminated pixels, and local texture amplification around strokes. Do not repeat the same prohibition globally in multiple sections.

Prompt wording can reduce but cannot guarantee removal of model-level ringing. Exact packaging text or logos are more reliably preserved by retaining original source pixels or compositing an authoritative supplied asset than by asking the model to redraw them.

## Default and exceptions

Apply image integrity by default to raster outputs. Scope or omit a clause when the user intentionally requests the same visual feature:

- film or sensor grain;
- paper fiber or canvas tooth;
- dirt, dust, grime, patina, weathering, or distressed printing;
- halftone, screentone, dithering, scan lines, glitch, mesh, tile, or checker patterns;
- brick, fabric, woven material, repeating packaging patterns, or other legitimate repetition.

An intentional feature is exempt only in its named role or region. The exemption does not authorize unrelated digital contamination elsewhere.

## Role map

For a simple image, controls may apply globally. For a mixed image, identify existing roles such as:

- photographic hero;
- product surface;
- graphic background;
- typography and logos;
- UI components;
- paper or print texture;
- edited region;
- preserved region.

Do not invent role IDs solely for visual-noise control. JSON `target` values must refer to a subject, component, region, surface, or field already declared in the Prompt.

## Precedence

Apply this order:

1. Explicit user requirements.
2. Exact content and edit or preservation boundaries.
3. Visual-noise controls.
4. Optional modifiers and defaults.

Resolve same-role contradictions before authoring. Do not hide both sides of a blocking conflict in the Prompt.

## Conflict rules

- Natural grain and structured contamination are different. Natural grain may be subtle, irregular, subordinate, and capture-consistent while tiled, ripple-like, blocky, or chromatic contamination remains prohibited.
- If visible grain and noise-free output target the same role, ask one minimal clarification.
- Do not prohibit plastic globally when the subject is plastic, resin, vinyl, enamel, clay, or a toy. Require physically credible material response instead.
- Do not apply restrained photographic sharpening to text, diagram lines, icons, or intentionally crisp UI edges.
- On text-bearing photographic surfaces, do not pair `sharp focus` or `crisp details` with local sharpening; use the text-neighborhood safeguard instead.
- Do not apply clean no-grain requirements to named analog, documentary, weathered, printed, or textured roles.
- Prefer positive rendering behavior followed by a short targeted exclusion list.
- Do not add unrequested boosters such as `8K`, `16K`, `masterpiece`, `maximum detail`, `HDR`, or `extreme sharpness`.
- Do not paste a fixed quality-keyword stack; translate each compatible intent into observable, role-scoped rendering behavior.

## Native-format insertion

### JSON

Add one optional top-level object. Omit empty keys and the entire object when no control is selected.

```json
{
  "visual_integrity": {
    "global": [
      "<selected global requirement>"
    ],
    "scoped": [
      {
        "target": "<existing role or region>",
        "requirements": [
          "<selected scoped requirement>"
        ]
      }
    ],
    "edit": [
      "<selected edit-integrity requirement>"
    ]
  }
}
```

Place `visual_integrity` beside visual-treatment fields and before output or task-specific negative constraints when practical. Never append prose after the closing JSON object.

### Prose

Insert short `Image integrity`, `Rendering integrity`, or `Edit integrity` clauses after visual treatment or allowed-change boundaries and before output and prohibitions.

### Markdown

Use `Visual Integrity` and, when needed, `Edit Integrity` sections only when Markdown was already selected for the request. Do not convert another format solely to add controls.

## Authoring limits

- Treat the files as clause libraries, not boilerplate blocks.
- Insert only clauses that address likely failure modes.
- Express each semantic requirement once.
- Scope mixed treatments explicitly.
- Preserve exact user text, facts, counts, and structure fields.
- Do not invent a capture medium, material, defect, or edit target.
- Do not claim that Prompt wording guarantees removal of model-level artifacts.

## Preflight checklist

- [ ] Main-agent request diagnosis, extraction, family routing, and format selection occurred before control selection.
- [ ] The control stack matches the requested medium and named visual roles.
- [ ] Intentional texture exceptions are explicit and scoped.
- [ ] Same-role grain, cleanliness, material, and preservation conflicts are resolved.
- [ ] The clean-fidelity recipe, when selected, is role-scoped and contains no incompatible booster terms.
- [ ] Every high-risk text-bearing smooth surface uses separate stroke and immediate-surface controls.
- [ ] JSON remains valid JSON; prose and Markdown remain their selected formats.
- [ ] Every scoped target already exists in the Prompt.
- [ ] No selected requirement is duplicated.
- [ ] The Prompt does not promise artifact-free output or lossless editing.
