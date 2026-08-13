---
name: imagegen
description: Generate or experimentally edit raster images with source-audited native-format Prompts, thirteen mutually exclusive structure families, composable visual-noise controls, environment checks, and a deterministic third-party Codex Responses API fallback. Use when Codex must create a PNG, reduce avoidable visual noise or synthetic rendering, preserve quality during image editing, handle a hidden image_generation tool Schema, or respond to an explicit $imagegen request.
---

# ImageGen

Create one validated PNG or stage a multi-output request without forcing every Prompt into Markdown.

Resolve this file's directory as `<skill-dir>`. Load references progressively:

1. Route to one structure template.
2. Load [visual-noise-control/INDEX.md](prompts/visual-noise-control/INDEX.md), then only applicable control files.
3. Load [modifiers/INDEX.md](prompts/modifiers/INDEX.md) only when visual refinements are needed.
4. Load [prompt-system.md](references/prompt-system.md) only for boundary, format, or provenance questions.
5. Load [runtime-contract.md](references/runtime-contract.md) before script execution.

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

### 1. Diagnose the request and create the Prompt

The main agent owns the whole pre-generation pass. Do not delegate request diagnosis, extraction, family selection, Prompt writing, or Prompt review to subagents.

Classify the task as generation, reference-image editing, or multiple outputs. Inspect the original user messages and every original attachment in order, then extract:

- use, audience, final artifact, and output count;
- subject, scene, action, hierarchy, and reading order;
- exact text, facts, values, labels, counts, and named assets;
- layout, composition, visual style, medium, camera, light, color, material, and atmosphere;
- width, height, ratio, orientation, file expectations, and transparency;
- required elements, optional elements, and prohibitions;
- rendering mode, cleanliness target, intentional grain or texture, and contamination-cleanup target;
- whether high-contrast text, logos, labels, or fine graphics occupy smooth photographic surfaces and require neighborhood protection;
- for editing: input order, image roles, allowed changes, preservation anchors, edit mode, and the cleanest valid source.

Do not fill unknown facts with plausible content. Resolve requirements from source evidence rather than request length, keyword count, adjective count, or voting. If the user supplies only an aspect ratio, preserve the ratio and leave pixel dimensions unspecified; do not derive a resolution or filename. Ask one minimal clarification only when an unresolved issue changes the subject, exact content, attachment role, edit scope, output count, or core layout. Leave nonblocking preferences unspecified.

Complete the routing, writing, and review actions below within this same main-agent pass. Do not create an intermediate diagnosis file unless the user explicitly asks for one.

#### Select one structure family

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

#### Write the native-format Prompt

Use the selected template's required fields, default format, valid skeleton, writing guidance, and checklist. Never copy its raw examples into the user's Prompt.

Then:

1. Declare visual roles, regions, surfaces, edit targets, preservation anchors, and intentional texture exceptions.
2. Select a control stack from [visual-noise-control/INDEX.md](prompts/visual-noise-control/INDEX.md).
3. For photographic, photoreal product, and photoreal reference-image edit tasks, insert this exact sentence once while first composing the Prompt file: `clean image, smooth surfaces, minimal texture, low noise, high resolution, crisp details, sharp focus, studio lighting, photorealistic, no film grain`. Do not translate, paraphrase, reorder, split, capitalize, or duplicate it. Place it in the visual-treatment or rendering content immediately before the selected visual-noise controls. In JSON, preserve it as one complete string in the applicable rendering field or `visual_integrity.global`; in prose or Markdown, preserve it as one standalone rendering-quality line. This required sentence is the sole exception to the fixed quality-keyword-stack prohibition. Do not append it in a second edit after the Prompt file has been created.
4. Do not insert that sentence into UI, diagrams, flat graphics, anime, painting, or other non-photographic tasks unless the user explicitly requests the complete sentence. Resolve an explicit same-role requirement for grain, heavy texture, or a non-studio medium before writing the Prompt.
5. Apply the index's conditional clean-fidelity recipe in addition to the exact sentence; the sentence does not replace scoped material, noise, or text-neighborhood controls.
6. When text or logos sit on smooth photographic surfaces, apply the index's text-neighborhood safeguard; for edits, prefer protected original source pixels over model redrawing when compatible.
7. Add only controls relevant to likely failure modes and scope mixed photographic and graphic treatments.
8. Load only modifier dimensions that materially change the result.
9. Prefer positive observable behavior, then a short targeted exclusion list.
10. Express each semantic requirement once.

Preserve the chosen JSON, prose, or Markdown format. Do not append prose after JSON or convert formats solely to insert controls. Save the complete Prompt to a UTF-8 file; do not execute documentation or example blocks.

**Complete when:** one executable Prompt file preserves the request contract, follows one template, contains only applicable controls, and remains valid in its native format.

#### Review and save the Prompt

Verify:

- subject, use, audience, hierarchy, exact text, facts, counts, dimensions, and prohibitions match the user;
- required and prohibited elements do not conflict;
- panels, components, routes, callouts, roles, and edit references resolve;
- preservation boundaries and allowed changes are explicit and compatible;
- intentional texture is not removed by cleanliness controls;
- every applicable photographic Prompt contains the exact required quality sentence once in its initial saved version and in the correct rendering location;
- clean-fidelity clauses are compatible with the medium, lighting, focus, materials, and named scope rather than copied as a generic booster stack;
- text-bearing smooth surfaces separately protect printed strokes and the immediate supporting material field, without aggressive local sharpening;
- visual controls and modifiers are scoped, dependency-complete, conflict-free, and nonduplicative;
- orientation is preserved; use `auto` when no supported size maps clearly;
- selected JSON parses and every placeholder is resolved.

Run the selected runtime's local check:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" prompt-check --prompt-file "<prompt-file>" --mode generate|edit
```

`prompt-check` is structural validation only and never replaces the semantic review above.

**Complete when:** every explicit value is represented once, blocking issues are resolved, no unsupported assumption enters the saved Prompt, semantic review passes, and `prompt-check` returns success with `semantic_review_required: true`.

### 2. Choose optional reasoning effort

Leave `--reasoning-effort` absent for ordinary generation. The absent default intentionally sends no `reasoning` field.

- Use `xhigh` for complex reference-image edits, strict multi-region layouts, dense exact-copy requirements, or coupled visual constraints where planning the image-tool call is materially useful.
- Use `max` only for unusually complex coupled requirements and only after the configured model and image tool have passed a controlled live compatibility check. Never make `max` the default.
- `quality: high` belongs to the image-generation tool and is independent from reasoning effort.
- Do not inspect API Key settings, infer an allowed ceiling, change `Originator` or `User-Agent`, or select a different route to obtain a higher reasoning level.
- The runtime reports `requested_reasoning_effort`; it must not claim the final upstream effort, because an authenticated gateway may cap it.
- If an explicit reasoning request receives HTTP 400 or 422, report the incompatibility and stop the pass. Do not silently remove, downgrade, or retry without the requested field.

**Complete when:** the invocation either omits reasoning deliberately or contains one source-backed explicit value from `high`, `xhigh`, or `max`.

### 3. Execute one authorized pass

Use a built-in image tool only when the current session exposes a callable image-generation tool. Do not infer availability from configuration flags, `tools/list`, cached Schemas, or provider claims.

Send the checked Prompt unchanged and preserve input-image order. If the built-in route succeeds, save the PNG and continue to verification.

Use the configured API only when the built-in tool is absent, unavailable, rejects its Schema, or fails through technical transport. Never fall back after a safety, content, policy, or permission refusal.

Read [runtime-contract.md](references/runtime-contract.md), select the runtime once, and run:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" preflight
<runtime> "<skill-dir>/scripts/imagegen.<ext>" generate --prompt-file "<prompt-file>" [--reasoning-effort high|xhigh|max] --size "<size>" --out-dir "<outputs>"
<runtime> "<skill-dir>/scripts/imagegen.<ext>" edit --prompt-file "<prompt-file>" --image "<image-1>" [--reasoning-effort high|xhigh|max] --size "<size>" --out-dir "<outputs>"
```

Launch exactly one `generate` or `edit` command per user-authorized pass with `timeout_ms: 660000` or greater. The runtime owns the sole technical retry. After command failure, stop the pass. Do not automatically rerun the command, switch runtimes, revise the Prompt, or attempt another fallback within the same pass.

If a follow-up arrives while a `generate` or `edit` command may still be running, treat it as a status inquiry, not a new pass. A missing PNG or missing final JSON is not evidence that the API returned no image. Reconcile the original command, terminal, and process state first. Declare failure only after the original process has ended with a final runtime error. If its state cannot be confirmed, report the result as unknown. Never launch a replacement command.

Use `--dry-run` only for local request-shape validation. A dry run or fixture is never a generated result.

**Complete when:** one authorized command has returned a validated candidate path or a final actionable error without an agent-level rerun.

### 4. Verify, report, and stop

Run:

```text
<runtime> "<skill-dir>/scripts/imagegen.<ext>" verify --file "<output.png>"
```

Confirm only that the file exists, has a valid PNG signature and dimensions, and is not merely a dry-run or fixture result. Do not perform routine visual inspection, enlarged-detail inspection, text-neighborhood inspection, or artifact-by-artifact review after generation unless the user explicitly asks for visual quality review.

Report:

- absolute output path, actual width and height, and execution route;
- whether the runtime performed its internal technical retry;
- the experimental-edit limitation when applicable;
- unresolved limitations.

Do not claim artifact-free output or lossless editing when no visual review was requested. Do not claim success when the file is missing or invalid.

Stop after the authorized pass. Generate again only after an explicit user request.

**Complete when:** the PNG is structurally valid, the minimal result summary is reported, and no unrequested pass is started.

## Maintenance validation

Run without a real image API request:

```text
node "<skill-dir>/scripts/imagegen.mjs" self-test
python "<skill-dir>/scripts/imagegen.py" self-test
```

The self-tests use inline deterministic data and do not require or create a `tests` directory. Run the `skill-creator` quick validator after structural changes when it is available.
