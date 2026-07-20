---
name: imagegen
description: Generate or experimentally edit raster images with source-audited native-format Prompts, thirteen mutually exclusive structure families, composable visual-noise controls, environment checks, and a deterministic third-party Codex Responses API fallback. Use when Codex must create a PNG, reduce avoidable visual noise or synthetic rendering, preserve quality during image editing, handle a hidden image_generation tool Schema, or respond to an explicit $imagegen request.
---

# ImageGen

Create one validated PNG or stage a multi-output request without forcing every Prompt into Markdown.

Resolve this file's directory as `<skill-dir>`. Load references progressively:

1. Load [request-diagnosis.md](references/request-diagnosis.md) only when the diagnosis gate triggers.
2. Route to one structure template.
3. Load [visual-noise-control/INDEX.md](prompts/visual-noise-control/INDEX.md), then only applicable control files.
4. Load [modifiers/INDEX.md](prompts/modifiers/INDEX.md) only when visual refinements are needed.
5. Load [prompt-system.md](references/prompt-system.md) only for boundary, format, or provenance questions.
6. Load [runtime-contract.md](references/runtime-contract.md) before script execution.

## Non-negotiable rules

- Preserve exact user-supplied text, names, facts, numbers, dates, prices, colors, counts, ratios, formats, references, and prohibitions.
- Do not invent products, people, brands, labels, copy, routes, parts, panel events, UI content, edit targets, or private intent.
- Do not silently truncate, pad, translate, correct, or embellish the request.
- Keep JSON as JSON and prose as prose; use Markdown only when sections materially improve a long mixed-constraint Prompt.
- Save Prompt files as strict UTF-8 without BOM and resolve every `{argument ...}` placeholder.
- Never pass non-ASCII Prompt text through arguments, environment variables, here-strings, stdin, or generated shell source.
- Treat source examples as structural evidence, never as ready-to-send user content.
- Never expose bearer tokens, authorization headers, full configuration, or the full Prompt in diagnostics.
- Never create a substitute image with SVG, HTML, Canvas, Pillow, or procedural rendering.
- Never use fallback routing to bypass safety, content, permission, policy, or destructive-action refusal.
- Treat configured API editing as experimental and report that limitation.

## Workflow

### 1. Choose the diagnosis path

Classify the request as generation, reference-image editing, or multiple outputs.

Use the direct path only when every condition is true:

- one output, one operation, and one clear central subject or artifact;
- no attachment or reference image;
- no material ambiguity or conflict;
- no missing fact would require invention.

Trigger diagnosis when any hard trigger exists:

- an attachment, reference image, or edit target affects the result;
- multiple outputs, stages, or dependent results are required;
- the goal, attachment role, or edit scope has materially different interpretations;
- explicit requirements conflict.

Also trigger diagnosis when at least two signals exist:

- exact visible text, facts, values, prices, or counts;
- coupled layout, reading order, component, or spatial constraints;
- preservation, modification, and prohibition boundaries;
- brand, identity, product, packaging, or cross-output consistency.

Do not decide from request length, keyword count, adjective count, or a subjective score.

**Complete when:** the request is assigned to the direct path or the diagnostic path from observable conditions.

### 2. Run two independent diagnoses when required

Read [request-diagnosis.md](references/request-diagnosis.md). Build one source package from verbatim user messages and original attachments in their original order.

- Send the same immutable source package and neutral instruction to exactly two fresh, isolated subagents in parallel.
- Use matching inherited model settings when supported.
- Give neither agent a role, summary, preliminary interpretation, candidate family, candidate Prompt, or the other output.
- Validate every claim against the original source package.
- Keep supported agreement and supported complementary findings.
- Resolve disagreement from source evidence. Do not vote, average confidence, or add a third judge.
- Remove unsupported assumptions even when both agents agree.
- Follow the reference degradation rules when equal dispatch or attachment access fails.
- Ask one minimal clarification only for unresolved blocking ambiguity.

**Complete when:** a source-backed evidence ledger exists, or the documented degradation path has produced an equivalent main-agent diagnosis.

### 3. Extract the request contract

Extract from the original user material:

- use, audience, final artifact, and output count;
- subject, scene, action, hierarchy, and reading order;
- exact text, facts, values, labels, counts, and named assets;
- layout, composition, visual style, medium, camera, light, color, material, and atmosphere;
- width, height, ratio, orientation, file expectations, and transparency;
- required elements, optional elements, and prohibitions;
- rendering mode, cleanliness target, intentional grain or texture, and contamination-cleanup target;
- for editing: input order, image roles, allowed changes, preservation anchors, edit mode, and the cleanest valid source.

Do not fill unknown facts with plausible content. If the user supplies only an aspect ratio, preserve the ratio and leave pixel dimensions unspecified; do not derive a resolution or filename. Ask only when a missing item changes the subject, exact content, attachment role, edit scope, output count, or core layout.

**Complete when:** every explicit value is recorded once, unknowns are either nonblocking or clarified, and no invented fact enters the contract.

### 4. Select one structure family

Apply precedence before ordinary routing:

1. If an input image must be modified, preserved, replaced, or composited, use `reference-image-edit`.
2. If separate files, pages, slides, or answer images are required, use `multi-image-series`.
3. If both apply, split into two Prompts: edit one baseline first, then define the output series.
4. Otherwise choose one family by required inputs, field structure, and validation contract.

| Family | Use when | Template |
| --- | --- | --- |
| `single-frame-scene` | One finished photographic, cinematic, or environmental frame | [template](prompts/single-frame-scene.md) |
| `commercial-copy-layout` | Copy hierarchy and hero placement define a campaign visual | [template](prompts/commercial-copy-layout.md) |
| `nonsequential-collection-grid` | Independent slots share one visual system | [template](prompts/nonsequential-collection-grid.md) |
| `sequential-comic-storyboard` | Ordered panels require continuity and causality | [template](prompts/sequential-comic-storyboard.md) |
| `character-asset-reference` | Identity must persist across views, poses, or expressions | [template](prompts/character-asset-reference.md) |
| `infographic-chart-explainer` | Facts and values need visual encoding or explanation | [template](prompts/infographic-chart-explainer.md) |
| `technical-annotated-diagram` | Parts, assembly, geometry, or callouts dominate; provisional | [template](prompts/technical-annotated-diagram.md) |
| `map-spatial-guide` | Topology, routes, landmarks, direction, or legend dominate; provisional | [template](prompts/map-spatial-guide.md) |
| `print-document-form` | Fixed paper fields, cells, formulas, or print integrity dominate | [template](prompts/print-document-form.md) |
| `ui-page-mockup` | Components, viewport, navigation, controls, and state are mandatory | [template](prompts/ui-page-mockup.md) |
| `brand-design-system` | Identity tokens, usage rules, applications, and assets dominate | [template](prompts/brand-design-system.md) |
| `reference-image-edit` | Inputs, operations, preservation, and comparison define success | [template](prompts/reference-image-edit.md) |
| `multi-image-series` | Separate ordered outputs share invariants; provisional | [template](prompts/multi-image-series.md) |

Use [prompt-system.md](references/prompt-system.md) only when adjacent families remain difficult to distinguish.

**Complete when:** exactly one template is loaded, or the edit-plus-series request is explicitly separated into two stages.

### 5. Write the native-format Prompt

Use the selected template's required fields, default format, valid skeleton, writing guidance, and checklist. Never copy its raw examples into the user's Prompt.

Then:

1. Declare visual roles, regions, surfaces, edit targets, preservation anchors, and intentional texture exceptions.
2. Select a control stack from [visual-noise-control/INDEX.md](prompts/visual-noise-control/INDEX.md).
3. Add only controls relevant to likely failure modes and scope mixed photographic and graphic treatments.
4. Load only modifier dimensions that materially change the result.
5. Prefer positive observable behavior, then a short targeted exclusion list.
6. Express each semantic requirement once.

Preserve the chosen JSON, prose, or Markdown format. Do not append prose after JSON or convert formats solely to insert controls. Save the complete Prompt to a UTF-8 file; do not execute documentation or example blocks.

**Complete when:** one executable Prompt file preserves the request contract, follows one template, contains only applicable controls, and remains valid in its native format.

### 6. Perform semantic and structural review

Verify:

- subject, use, audience, hierarchy, exact text, facts, counts, dimensions, and prohibitions match the user;
- required and prohibited elements do not conflict;
- panels, components, routes, callouts, roles, and edit references resolve;
- preservation boundaries and allowed changes are explicit and compatible;
- intentional texture is not removed by cleanliness controls;
- visual controls and modifiers are scoped, dependency-complete, conflict-free, and nonduplicative;
- orientation is preserved; use `auto` when no supported size maps clearly;
- selected JSON parses and every placeholder is resolved.

Run the selected runtime's local check:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" prompt-check --prompt-file "<prompt-file>" --mode generate|edit
```

`prompt-check` is structural validation only and never replaces the semantic review above.

**Complete when:** semantic review passes and `prompt-check` returns success with `semantic_review_required: true`.

### 7. Execute one authorized pass

Use a built-in image tool only when the current session exposes a callable image-generation tool. Do not infer availability from configuration flags, `tools/list`, cached Schemas, or provider claims.

Send the checked Prompt unchanged and preserve input-image order. If the built-in route succeeds, save the PNG and continue to verification.

Use the configured API only when the built-in tool is absent, unavailable, rejects its Schema, or fails through technical transport. Never fall back after a safety, content, policy, or permission refusal.

Read [runtime-contract.md](references/runtime-contract.md), select the runtime once, and run:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" preflight
<runtime> "<skill-dir>/scripts/imagegen.<ext>" generate --prompt-file "<prompt-file>" --size "<size>" --out-dir "<outputs>"
<runtime> "<skill-dir>/scripts/imagegen.<ext>" edit --prompt-file "<prompt-file>" --image "<image-1>" --size "<size>" --out-dir "<outputs>"
```

Launch exactly one `generate` or `edit` command per user-authorized pass with `timeout_ms: 660000` or greater. The runtime owns the sole technical retry. After command failure, stop the pass. Do not automatically rerun the command, switch runtimes, revise the Prompt, or attempt another fallback within the same pass.

If a follow-up arrives while a `generate` or `edit` command may still be running, treat it as a status inquiry, not a new pass. A missing PNG or missing final JSON is not evidence that the API returned no image. Reconcile the original command, terminal, and process state first. Declare failure only after the original process has ended with a final runtime error. If its state cannot be confirmed, report the result as unknown. Never launch a replacement command.

Use `--dry-run` only for local request-shape validation. A dry run or fixture is never a generated result.

**Complete when:** one authorized command has returned a validated candidate path or a final actionable error without an agent-level rerun.

### 8. Verify, inspect, report, and stop

Run:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" verify --file "<output.png>"
```

Confirm that the file exists, has a valid PNG signature and dimensions, and is not merely a dry-run or fixture result. When visual inspection is available, inspect normal view and enlarged detail.

Report:

- absolute output path, actual width and height, and execution route;
- whether the runtime performed its internal technical retry;
- the experimental-edit limitation when applicable;
- visible tiling, ripple, grime, blocks, speckles, halos, synthetic material response, or collateral edits;
- unresolved limitations.

Report visible contamination honestly and without automatically generating another pass. Do not claim artifact-free output, lossless editing, or success when the file is missing or invalid.

Stop after the authorized pass. Generate again only after an explicit user request.

**Complete when:** the PNG is structurally valid, visual limitations are reported, and no unrequested pass is started.

## Maintenance validation

Run without a real image API request:

```text
node "<skill-dir>/scripts/tests/corpus-audit.mjs"
node "<skill-dir>/scripts/imagegen.mjs" self-test
python "<skill-dir>/scripts/imagegen.py" self-test
node "<skill-dir>/scripts/tests/offline-tests.mjs"
```

Run the `skill-creator` quick validator after structural changes.
