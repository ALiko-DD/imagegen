# ImageGen Skill

English | [简体中文](README.md)

An image-generation and experimental image-editing Skill for Codex. ImageGen is not a single fixed prompt. It provides an end-to-end workflow that diagnoses the request, preserves the user's constraints, selects exactly one of thirteen structural Prompt families, composes visual-noise controls and modifiers when needed, and finishes with Prompt validation, image execution, and PNG verification.

## Core Capabilities

- Preserve user-supplied text, names, facts, numbers, dates, prices, colors, counts, ratios, formats, and prohibitions without silently inventing replacements.
- Select a structure template from the final artifact's validation contract instead of forcing every request into one Markdown layout.
- Author Prompts natively as strict JSON, prose, or Markdown.
- Provide four composable visual-noise control groups for reducing grids, ripples, grime, blocks, plastic rendering, oversharpening, and edit contamination.
- Provide eleven visual modifier dimensions with applicability, conflict, and dependency rules.
- Support single-image generation, reference-image editing, and multi-image series planning.
- Prefer a genuinely callable image-generation tool in the current Codex session; when it is unavailable or fails technically, use the included Node.js or Python runtime with a configured Responses-compatible endpoint.
- Validate Prompt files, input images, output paths, SSE responses, and final PNG files locally.

## Installation and Updates

> [!IMPORTANT]
> Installation and updating use the same replacement procedure. First verify that this repository contains `imagegen/SKILL.md`. Then remove any existing copies at `~/.codex/skills/.system/imagegen` and `~/.codex/skills/imagegen`. Finally, copy the repository's complete `imagegen` directory to `~/.codex/skills/imagegen`. If neither old path exists, install it directly.

This prevents two same-named Skill copies from coexisting in `.system` and the user Skill directory, which can cause uncertain version selection, stale templates, or duplicate invocation. Do not merge the new files into an old directory; always replace the directory completely.

### Ask Codex to Install It

After downloading or cloning this repository, tell Codex:

```text
Install or update the imagegen skill from the current repository.

For both a first-time installation and an update:
1. Confirm that imagegen/SKILL.md exists at the repository root.
2. Delete existing copies at ~/.codex/skills/.system/imagegen and
   ~/.codex/skills/imagegen, skipping paths that do not exist.
3. Copy the complete imagegen directory from the repository root to
   ~/.codex/skills/imagegen.
4. Do not merge with old files.
5. Verify that SKILL.md, agents, prompts, references, and scripts are present.
```

### Windows PowerShell

Run from the repository root:

```powershell
$source = (Resolve-Path ".\imagegen" -ErrorAction Stop).Path
$skillsRoot = Join-Path $HOME ".codex\skills"
$systemCopy = Join-Path $skillsRoot ".system\imagegen"
$target = Join-Path $skillsRoot "imagegen"

if (-not (Test-Path -LiteralPath (Join-Path $source "SKILL.md"))) {
    throw "The source is not a valid imagegen Skill directory: $source"
}

if ($source -in @($systemCopy, $target)) {
    throw "Run this command from a separate downloaded or cloned repository, not from the installed Skill directory."
}

New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null

@($systemCopy, $target) | ForEach-Object {
    if (Test-Path -LiteralPath $_) {
        Remove-Item -LiteralPath $_ -Recurse -Force
    }
}

Copy-Item -LiteralPath $source -Destination $target -Recurse -Force

if (-not (Test-Path -LiteralPath (Join-Path $target "SKILL.md"))) {
    throw "Installation verification failed: $target"
}

Write-Host "ImageGen installed at: $target"
```

### macOS / Linux

Run from the repository root:

```bash
set -eu

source_dir="$(cd "./imagegen" && pwd)"
skills_root="$HOME/.codex/skills"
system_copy="$skills_root/.system/imagegen"
target="$skills_root/imagegen"

test -f "$source_dir/SKILL.md"

if [ "$source_dir" = "$system_copy" ] || [ "$source_dir" = "$target" ]; then
  printf '%s\n' 'Run this command from a separate downloaded or cloned repository, not from the installed Skill directory.' >&2
  exit 1
fi

mkdir -p "$skills_root"
rm -rf -- "$system_copy" "$target"
cp -R "$source_dir" "$target"
test -f "$target/SKILL.md"

printf 'ImageGen installed at: %s\n' "$target"
```

After installation, start a new Codex task. If the Skill does not appear in the available list, restart Codex.

## Quick Start

Explicit invocation:

```text
Use $imagegen to create a square skincare product hero image.
The bottle label must read exactly "LUMINA", with a clean light-gray background.
Do not add a price, certification badge, or marketing copy that I did not provide.
```

Reference-image editing:

```text
Use $imagegen to edit the attached product image.
Remove only the strong reflection on the left side of the cap.
Preserve the bottle text, color, proportions, background, and shadow.
Do not redesign the packaging.
```

Multi-image series:

```text
Use $imagegen to plan and generate three independent 9:16 outdoor advertisements.
Keep the product, brand colors, and headline identical across all three images,
but use morning, midday, and night scenes respectively.
```

`agents/openai.yaml` permits implicit invocation, but explicitly writing `$imagegen` is recommended when use of this Skill must be unambiguous.

## Workflow

1. **Diagnose the request:** classify it as single-image generation, reference-image editing, or a multi-output request; complex requests enter a two-pass independent diagnosis process.
2. **Extract the request contract:** record the use, audience, subject, exact text, facts, counts, layout, style, dimensions, prohibitions, and edit boundaries.
3. **Select a structure family:** choose one of thirteen mutually exclusive families; an edit-plus-series request is separated into two stages.
4. **Choose the native format:** use JSON, prose, or Markdown according to verifiability instead of forcing one universal format.
5. **Compose visual controls:** select visual-noise controls first, then load only modifier dimensions that materially affect the result.
6. **Review semantics and structure:** verify facts, counts, exact text, layout, preservation boundaries, conflicts, placeholders, and JSON syntax.
7. **Execute one authorized pass:** prefer the built-in route; the fallback runtime owns one command and at most one eligible technical retry.
8. **Verify and report:** validate the PNG signature and dimensions, inspect visible contamination or collateral edits, report real limitations, and stop.

See [`imagegen/SKILL.md`](imagegen/SKILL.md) for the complete operating rules.

## Thirteen Structure Families

| Family | Use case |
| --- | --- |
| [`single-frame-scene`](imagegen/prompts/single-frame-scene.md) | One photographic frame, illustration, anime scene, environment, or product hero image |
| [`commercial-copy-layout`](imagegen/prompts/commercial-copy-layout.md) | Posters, thumbnails, social cards, advertisements, and campaign visuals dominated by copy hierarchy |
| [`nonsequential-collection-grid`](imagegen/prompts/nonsequential-collection-grid.md) | Sticker sheets, catalogs, independent concepts, and multi-slot collections without narrative order |
| [`sequential-comic-storyboard`](imagegen/prompts/sequential-comic-storyboard.md) | Comics and storyboards requiring reading order, causality, dialogue, and character continuity |
| [`character-asset-reference`](imagegen/prompts/character-asset-reference.md) | Character turnarounds, expressions, poses, costumes, and reusable asset reference boards |
| [`infographic-chart-explainer`](imagegen/prompts/infographic-chart-explainer.md) | Infographics, charts, timelines, processes, comparisons, and educational explainers |
| [`technical-annotated-diagram`](imagegen/prompts/technical-annotated-diagram.md) | Exploded views, assembly drawings, cutaways, parts, and leader-line callouts; currently provisional |
| [`map-spatial-guide`](imagegen/prompts/map-spatial-guide.md) | Maps, routes, campus guides, zones, landmarks, topology, and legends; currently provisional |
| [`print-document-form`](imagegen/prompts/print-document-form.md) | Forms, bills, certificates, worksheets, and fixed paper-field structures |
| [`ui-page-mockup`](imagegen/prompts/ui-page-mockup.md) | Apps, websites, landing pages, product pages, livestream interfaces, and dashboards |
| [`brand-design-system`](imagegen/prompts/brand-design-system.md) | Brand identity boards, visual systems, packaging families, merchandise, and application rules |
| [`reference-image-edit`](imagegen/prompts/reference-image-edit.md) | Moving, removing, replacing, adding, compositing, preserving identity, or transferring style |
| [`multi-image-series`](imagegen/prompts/multi-image-series.md) | Multiple independent files, pages, or slides sharing common invariants; currently provisional |

Each template defines routing boundaries, required inputs, a default native format, a valid skeleton, field guidance, writing rules, source examples, and a preflight checklist. Source examples demonstrate structure only and must not be copied directly into a user Prompt.

## Prompt Control System

### Visual-Noise Controls

Entry point: [`imagegen/prompts/visual-noise-control/INDEX.md`](imagegen/prompts/visual-noise-control/INDEX.md)

| Control | Function |
| --- | --- |
| [`image-integrity`](imagegen/prompts/visual-noise-control/image-integrity.md) | Default prevention of unintended grids, ripples, blocks, speckles, grime, and overprocessed detail |
| [`photographic-rendering`](imagegen/prompts/visual-noise-control/photographic-rendering.md) | Plausible optics, lighting, materials, depth, skin detail, and color response |
| [`clean-rendering`](imagegen/prompts/visual-noise-control/clean-rendering.md) | Clean backgrounds, smooth fields, intentional crisp edges, and controlled negative space |
| [`edit-integrity`](imagegen/prompts/visual-noise-control/edit-integrity.md) | Constrained edit scope, preservation of untouched regions, and cleanup of edit artifacts |

These controls can be composed and can be scoped to roles or regions already defined in the Prompt. Explicitly requested film grain, paper fiber, weathering, halftone, textile texture, or similar intentional features are not removed by an indiscriminate global cleanup rule.

### Visual Modifiers

Entry point: [`imagegen/prompts/modifiers/INDEX.md`](imagegen/prompts/modifiers/INDEX.md)

The eleven modifier dimensions are:

- Medium and style
- Camera and framing
- Lighting and shadow
- Color and tone
- Material and texture
- Composition tendency
- Typography and graphic treatment
- Era, region, and cultural language
- Atmosphere and visual effects
- Quality and technical control
- Negative constraints

Modifiers refine visual treatment only. They cannot replace the subject, facts, exact text, layout, edit operations, or output requirements. Every entry records its applicability, intensity, conflicts, dependencies, polarity, and source.

## Runtime Requirements

- Prefer Node.js 18 or newer: `imagegen/scripts/imagegen.mjs`
- Use Python 3.8 or newer when Node.js is unavailable or too old: `imagegen/scripts/imagegen.py`
- Neither runtime requires third-party packages.
- Prompt files must be strict UTF-8 without a BOM. Pass non-ASCII content only through `--prompt-file`.
- The default output directory is `outputs/` under the current working directory.

### Commands

The following examples use Node.js. For Python, replace the command prefix with `python imagegen/scripts/imagegen.py`.

```bash
# Check the environment and configuration
node imagegen/scripts/imagegen.mjs preflight

# Validate a Prompt without a network request
node imagegen/scripts/imagegen.mjs prompt-check \
  --prompt-file ./prompt.json \
  --mode generate

# Validate the full request shape without a network request
node imagegen/scripts/imagegen.mjs generate \
  --prompt-file ./prompt.json \
  --size 1024x1024 \
  --out-dir ./outputs \
  --dry-run

# Generate an image
node imagegen/scripts/imagegen.mjs generate \
  --prompt-file ./prompt.json \
  --size 1024x1024 \
  --out-dir ./outputs

# Edit images; input order follows the order of --image arguments
node imagegen/scripts/imagegen.mjs edit \
  --prompt-file ./edit-prompt.md \
  --image ./input-1.png \
  --image ./input-2.webp \
  --size auto \
  --out-dir ./outputs

# Verify an existing PNG
node imagegen/scripts/imagegen.mjs verify \
  --file ./outputs/result.png
```

`prompt-check` performs structural validation only. A successful result includes `semantic_review_required: true` because human or agent semantic review is still required. A `--dry-run` is never a generated result.

### Supported Sizes

| Intended orientation or ratio | Parameter |
| --- | --- |
| Unspecified or no reliable mapping | `auto` |
| 1:1 | `1024x1024` |
| Portrait 2:3 | `1024x1536` |
| Landscape 3:2 | `1536x1024` |
| Portrait 9:16 | `941x1672` |
| Landscape 16:9 | `1672x941` |

Do not invent a crop merely to force a size mapping. Use `auto` when no supported ratio maps clearly.

## Fallback API Configuration

This configuration is required only when using the included Node.js or Python fallback runtime. The scripts read only the active `model_provider` entry from `~/.codex/config.toml`:

```toml
model_provider = "your_provider"

[model_providers.your_provider]
base_url = "https://your-compatible-provider.example"
experimental_bearer_token = "replace-with-your-token"
```

The runtime sends requests to:

```text
{base_url}/backend-api/codex/responses
```

The fallback service must support this Skill's streaming Responses request and `image_generation` tool contract, including the model and request shape declared in the scripts. Do not assume that an arbitrary OpenAI API key, ordinary REST endpoint, or third-party provider is directly compatible. Run `preflight` and `--dry-run` before making a real request.

> [!CAUTION]
> Never commit a real `experimental_bearer_token` or expose it in issues, logs, screenshots, or Prompts. The runtime attempts to redact tokens, authorization headers, complete configuration, and the complete Prompt, but repository maintainers must still inspect their commits.

## Editing Limitations

- The fallback API image-editing route is experimental.
- One edit accepts 1–16 PNG, JPEG, or WebP files, with a maximum of 50 MiB per file.
- Input-image order is preserved, and the Prompt text follows all input images.
- Do not claim third-party editing compatibility without testing the actual provider.
- Do not promise lossless editing, artifact-free output, or absolute preservation of every pixel; inspect the result and report limitations honestly.

## Project Structure

```text
.
├── README.md
├── README_EN.md
└── imagegen/
    ├── SKILL.md
    ├── agents/
    │   └── openai.yaml
    ├── prompts/
    │   ├── *.md
    │   ├── modifiers/
    │   └── visual-noise-control/
    ├── references/
    │   ├── prompt-system.md
    │   ├── request-diagnosis.md
    │   └── runtime-contract.md
    └── scripts/
        ├── imagegen.mjs
        └── imagegen.py
```

## Design Principles

- User-supplied content has precedence over templates, controls, modifiers, and defaults.
- Do not invent brands, products, people, labels, copy, routes, components, UI content, or private intent.
- Use one structure family per Prompt unless an edit-plus-series request is explicitly split into two stages.
- Keep JSON as strict JSON; use prose and Markdown only where each format is appropriate.
- Scope visual controls to actual roles and avoid vague quality-booster stacks such as `8K`, `masterpiece`, or `HDR`.
- Never use SVG, HTML, Canvas, Pillow, or procedural drawing as a substitute for an image-generation result.
- Never use fallback routing to bypass safety, content, policy, or permission refusals.
- Execute only one generation or edit command per user-authorized pass; after failure, do not automatically switch runtimes, rewrite the Prompt, or launch another pass.

## Local Validation

Before a real generation request, validate the same complete Prompt with both runtimes:

```bash
node imagegen/scripts/imagegen.mjs prompt-check \
  --prompt-file ./your-prompt.md \
  --mode generate

python imagegen/scripts/imagegen.py prompt-check \
  --prompt-file ./your-prompt.md \
  --mode generate
```

`prompt-check` performs no real image API request. After modifying `SKILL.md`, the directory structure, or metadata, also use the Codex `skill-creator` quick validator to check the frontmatter, Skill name, and directory conventions.
