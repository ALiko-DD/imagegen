# Visual Noise Control

## Purpose

Use these cross-cutting authoring controls after request diagnosis, request extraction, structure-family routing, and native-format selection. They reduce avoidable visual contamination and synthetic rendering without creating another structure family or modifier taxonomy.

The controls are composable. Do not force the request into exactly one file.

## Control files

| Control | File | Function |
| --- | --- | --- |
| Image integrity | [image-integrity.md](image-integrity.md) | Default prevention of unintended structured contamination and overprocessed detail |
| Photographic rendering | [photographic-rendering.md](photographic-rendering.md) | Camera-like lighting, optics, materials, detail falloff, and grain |
| Clean rendering | [clean-rendering.md](clean-rendering.md) | Smooth fields, intentional crisp edges, clean negative space, and suppressed incidental texture |
| Edit integrity | [edit-integrity.md](edit-integrity.md) | Constrained edits, artifact cleanup, global transformations, and source preservation |

## Selection sequence

1. Complete conditional request diagnosis when required.
2. Extract the full user contract.
3. Select one of the thirteen structure families.
4. Select JSON, prose, or Markdown.
5. Identify visual roles, regions, surfaces, edit targets, and preservation anchors.
6. Record intentional grain, texture, dirt, patina, halftone, checker patterns, or other exceptions.
7. Select the visual-noise control stack.
8. Reconcile the stack with explicit user requirements and existing modifiers.
9. Author concise control clauses in the selected native format.

Do not ask diagnosis subagents to select controls or write Prompt clauses.

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
- Do not apply clean no-grain requirements to named analog, documentary, weathered, printed, or textured roles.
- Prefer positive rendering behavior followed by a short targeted exclusion list.
- Do not add unrequested boosters such as `8K`, `16K`, `masterpiece`, `maximum detail`, `HDR`, or `extreme sharpness`.

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

- [ ] Diagnosis, request extraction, family routing, and format selection occurred before control selection.
- [ ] The control stack matches the requested medium and named visual roles.
- [ ] Intentional texture exceptions are explicit and scoped.
- [ ] Same-role grain, cleanliness, material, and preservation conflicts are resolved.
- [ ] JSON remains valid JSON; prose and Markdown remain their selected formats.
- [ ] Every scoped target already exists in the Prompt.
- [ ] No selected requirement is duplicated.
- [ ] The Prompt does not promise artifact-free output or lossless editing.
