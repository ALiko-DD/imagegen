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
> Installation and updating use the same replacement procedure. First verify that this repository contains `imagegen/SKILL.md`. Then remove any existing copies at `~/.codex/skills/.system/imagegen` and `~/.codex/skills/imagegen`. Finally, copy the repository's complete `imagegen` directory to `~/.codex/skills/.system/imagegen`. If neither old path exists, install it directly under `.system`.

> [!WARNING]
> A request to install or update ImageGen also authorizes automatic installation of a missing required runtime. Do not ask a separate “Install Python?” question. Before installation, check Node.js 18+ and Python 3.8+; continue when either one is usable. If neither is usable, automatically install Python 3.8 or newer with the platform's available package manager, preferring Python 3.12. Ask the user to intervene only when an administrator password, UAC prompt, network failure, missing package manager, or another external blocker requires direct action. Do not report ImageGen as installed or runnable until the post-install version check passes.

This prevents two same-named Skill copies from coexisting in `.system` and the user Skill directory, which can cause uncertain version selection, stale templates, or duplicate invocation. Do not merge the new files into an old directory; always replace the directory completely.

### Ask Codex to Install It

After downloading or cloning this repository, tell Codex:

```text
Install or update the imagegen skill from the current repository.

For both a first-time installation and an update:
1. Confirm that imagegen/SKILL.md exists at the repository root.
2. Check Node.js 18+ and Python 3.8+, recording the availability and version of each runtime.
3. If neither runtime is usable, do not ask whether to install Python. Automatically install Python 3.8+ with the platform's available package manager, preferring Python 3.12.
4. Pause only when I must handle an administrator password, UAC prompt, network failure, missing package manager, or another external blocker.
5. Refresh the environment and re-check Python after installation. Do not continue or report success if the version check fails.
6. Delete existing copies at ~/.codex/skills/.system/imagegen and
   ~/.codex/skills/imagegen, skipping paths that do not exist.
7. Copy the complete imagegen directory from the repository root to
   ~/.codex/skills/.system/imagegen.
8. Do not merge with old files.
9. Verify that SKILL.md, agents, prompts, references, and scripts are present. Report the installation path, Node.js status, Python status, selected runtime, and preflight result.
```

### Windows PowerShell

Run from the repository root:

```powershell
$source = (Resolve-Path ".\imagegen" -ErrorAction Stop).Path
if (-not (Test-Path -LiteralPath (Join-Path $source "SKILL.md"))) {
    throw "The source is not a valid imagegen Skill directory: $source"
}

function Test-NodeRuntime {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        return $false
    }

    & node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)"
    return $LASTEXITCODE -eq 0
}

function Get-PythonRuntime {
    $candidates = @(
        [pscustomobject]@{ Command = "py"; Prefix = @("-3") },
        [pscustomobject]@{ Command = "python"; Prefix = @() },
        [pscustomobject]@{ Command = "python3"; Prefix = @() }
    )

    foreach ($candidate in $candidates) {
        if (-not (Get-Command $candidate.Command -ErrorAction SilentlyContinue)) {
            continue
        }

        $prefix = [string[]]$candidate.Prefix
        & $candidate.Command @prefix -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 8) else 1)"
        if ($LASTEXITCODE -eq 0) {
            return $candidate
        }
    }

    return $null
}

$nodeAvailable = Test-NodeRuntime
$pythonRuntime = Get-PythonRuntime

if (-not $nodeAvailable -and -not $pythonRuntime) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "Neither Node.js 18+ nor Python 3.8+ is available, and winget was not found. Resolve the package-manager or administrator-permission blocker first."
    }

    & winget install --id Python.Python.3.12 --exact --scope user --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "Automatic Python installation failed. Resolve the network, UAC, administrator-permission, or package-manager error and retry."
    }

    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = @($machinePath, $userPath) -join ";"

    $python312 = Join-Path $env:LOCALAPPDATA "Programs\Python\Python312\python.exe"
    if (Test-Path -LiteralPath $python312) {
        $env:Path = "$(Split-Path -Parent $python312);$env:Path"
    }

    $pythonRuntime = Get-PythonRuntime
    if (-not $pythonRuntime) {
        throw "Python installation was attempted, but the Python 3.8+ version check failed. ImageGen installation cannot continue."
    }
}

$skillsRoot = Join-Path $HOME ".codex\skills"
$systemRoot = Join-Path $skillsRoot ".system"
$target = Join-Path $systemRoot "imagegen"
$userCopy = Join-Path $skillsRoot "imagegen"

if ($source -in @($target, $userCopy)) {
    throw "Run this command from a separate downloaded or cloned repository, not from the installed Skill directory."
}

New-Item -ItemType Directory -Force -Path $systemRoot | Out-Null

@($target, $userCopy) | ForEach-Object {
    if (Test-Path -LiteralPath $_) {
        Remove-Item -LiteralPath $_ -Recurse -Force
    }
}

Copy-Item -LiteralPath $source -Destination $target -Recurse -Force

if (-not (Test-Path -LiteralPath (Join-Path $target "SKILL.md"))) {
    throw "Installation verification failed: $target"
}

$nodeStatus = if ($nodeAvailable) {
    & node --version
} else {
    "unavailable or below 18"
}

$pythonStatus = if ($pythonRuntime) {
    $pythonPrefix = [string[]]$pythonRuntime.Prefix
    & $pythonRuntime.Command @pythonPrefix -c "import platform; print(platform.python_version())"
} else {
    "unavailable or below 3.8"
}

$selectedRuntime = if ($nodeAvailable) {
    "Node.js $nodeStatus"
} else {
    "Python $pythonStatus"
}

Write-Host "ImageGen installed at: $target"
Write-Host "Node.js: $nodeStatus"
Write-Host "Python: $pythonStatus"
Write-Host "Selected runtime: $selectedRuntime"
```

### macOS / Linux

Run from the repository root:

```bash
set -eu

source_dir="$(cd "./imagegen" && pwd)"
test -f "$source_dir/SKILL.md"

node_is_usable() {
  command -v node >/dev/null 2>&1 &&
    node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)'
}

find_python() {
  for candidate in python3 python; do
    if command -v "$candidate" >/dev/null 2>&1 &&
      "$candidate" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 8) else 1)'
    then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

run_as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    printf '%s\n' 'Administrator privileges are required, but sudo is unavailable. Resolve the permission blocker first.' >&2
    return 1
  fi
}

node_available=false
if node_is_usable; then
  node_available=true
fi

python_bin="$(find_python || true)"

if [ "$node_available" != true ] && [ -z "$python_bin" ]; then
  case "$(uname -s)" in
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        brew install python
      else
        printf '%s\n' 'Neither Node.js 18+ nor Python 3.8+ is available, and Homebrew was not found. Resolve the package-manager blocker first.' >&2
        exit 1
      fi
      ;;
    Linux)
      if command -v apt-get >/dev/null 2>&1; then
        run_as_root apt-get update
        run_as_root apt-get install -y python3
      elif command -v dnf >/dev/null 2>&1; then
        run_as_root dnf install -y python3
      elif command -v yum >/dev/null 2>&1; then
        run_as_root yum install -y python3
      elif command -v pacman >/dev/null 2>&1; then
        run_as_root pacman -Sy --noconfirm python
      elif command -v zypper >/dev/null 2>&1; then
        run_as_root zypper --non-interactive install python3
      elif command -v apk >/dev/null 2>&1; then
        run_as_root apk add --no-cache python3
      else
        printf '%s\n' 'Neither Node.js 18+ nor Python 3.8+ is available, and no supported package manager was found.' >&2
        exit 1
      fi
      ;;
    *)
      printf '%s\n' 'Python cannot be installed automatically on this operating system. Resolve the runtime blocker first.' >&2
      exit 1
      ;;
  esac

  hash -r
  python_bin="$(find_python || true)"
  if [ -z "$python_bin" ]; then
    printf '%s\n' 'Python installation was attempted, but the Python 3.8+ version check failed. ImageGen installation cannot continue.' >&2
    exit 1
  fi
fi

skills_root="$HOME/.codex/skills"
system_root="$skills_root/.system"
target="$system_root/imagegen"
user_copy="$skills_root/imagegen"

if [ "$source_dir" = "$target" ] || [ "$source_dir" = "$user_copy" ]; then
  printf '%s\n' 'Run this command from a separate downloaded or cloned repository, not from the installed Skill directory.' >&2
  exit 1
fi

mkdir -p "$system_root"
rm -rf -- "$target" "$user_copy"
cp -R "$source_dir" "$target"
test -f "$target/SKILL.md"

if [ "$node_available" = true ]; then
  node_status="$(node --version)"
  selected_runtime="Node.js $node_status"
else
  node_status="unavailable or below 18"
  selected_runtime="Python $("$python_bin" -c 'import platform; print(platform.python_version())')"
fi

if [ -n "$python_bin" ]; then
  python_status="$("$python_bin" -c 'import platform; print(platform.python_version())')"
else
  python_status="unavailable or below 3.8"
fi

printf 'ImageGen installed at: %s\n' "$target"
printf 'Node.js: %s\n' "$node_status"
printf 'Python: %s\n' "$python_status"
printf 'Selected runtime: %s\n' "$selected_runtime"
```

Installation must not fail merely because Node.js is missing; Python 3.8+ is a complete fallback runtime. If both Node.js and Python are missing, automatically install and re-check Python before copying the Skill. Whether Codex or a manual command performs the installation, the final report must list the installation path, Node.js status, Python status, selected runtime, and configuration or `preflight` result. If configuration is incomplete, report that honestly instead of describing the Skill as fully runnable. After installation, start a new Codex task. If the Skill does not appear in the available list, restart Codex.

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

1. **Diagnose the request:** the main agent classifies it as single-image generation, reference-image editing, or a multi-output request, then owns diagnosis, extraction, family selection, Prompt writing, and review in one pre-generation pass without delegating to subagents.
2. **Extract the request contract:** record the use, audience, subject, exact text, facts, counts, layout, style, dimensions, prohibitions, and edit boundaries.
3. **Select a structure family:** choose one of thirteen mutually exclusive families; an edit-plus-series request is separated into two stages.
4. **Choose the native format:** use JSON, prose, or Markdown according to verifiability instead of forcing one universal format.
5. **Compose visual controls:** select visual-noise controls first, then load only modifier dimensions that materially affect the result.
6. **Review semantics and structure:** verify facts, counts, exact text, layout, preservation boundaries, conflicts, placeholders, and JSON syntax.
7. **Execute the authorized pass:** run one command for a single image; after every Prompt is checked, schedule each independent multi-output job separately, with at most one eligible technical retry per job.
8. **Verify and report:** confirm that the file exists and has a valid PNG signature and dimensions; perform visual inspection only when the user explicitly requests quality review, report real limitations, and stop.

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
- At least one of Node.js 18+ or Python 3.8+ must be usable; this is a hard installation requirement.
- If neither runtime is usable, the install or update request authorizes the installer to install Python 3.8+ automatically, preferring Python 3.12, without asking a separate confirmation question.
- Refresh the environment and re-check the version after automatic installation. Ask the user to intervene only for external permission, administrator-password, UAC, network, or package-manager blockers.
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

`generate` and `edit` optionally accept `--reasoning-effort high|xhigh|max`. Omit this option for ordinary generation and add it only when the task genuinely needs greater reasoning effort.

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
