# Runtime Contract

## Runtime selection

Use `scripts/imagegen.mjs` with Node.js 18 or newer. Use `scripts/imagegen.py` with Python 3.8 or newer only when Node.js is unavailable or too old. Select once during preflight; do not install dependencies or switch runtimes after a generation command fails.

Node.js generation and editing use built-in APIs without external packages. Python generation uses the standard library; Python editing additionally requires `requests` for HTTP-library-generated multipart encoding. Check with `python -c "import requests"`; if missing, install it with the selected interpreter's `python -m pip install requests` before editing. Preflight reports availability. A missing dependency fails locally with `E_RUNTIME` and sends no request.

Pass non-ASCII Prompt content only through a strict UTF-8 Prompt file. Never pass it through command arguments, environment variables, shell here-strings, stdin, or generated shell source.

## Commands

```text
preflight
prompt-check --prompt-file <path> [--mode generate|edit]
generate --prompt-file <path> [--size <size>] [--out <png> | --out-dir <dir>] [--force] [--dry-run]
edit --prompt-file <path> --image <path> [--image <path> ...] [--size <size>] [--out <png> | --out-dir <dir>] [--force] [--dry-run]
verify --file <png>
self-test
```

`dry-run` validates the Prompt, inputs, configuration, output destination, and request shape without a network request. It never prints the full Prompt or bearer token and never counts as generated output.

`prompt-check` accepts JSON, prose, or Markdown. It validates strict UTF-8, common corruption markers, non-empty content, the 20,000-character safety cap, JSON syntax when applicable, and unresolved placeholders. Its success summary includes `semantic_review_required: true`; semantic review remains the agent's responsibility.

## Generation settings

If the decoded Prompt contains `4k` anywhere (case-insensitive), use `model: gpt-image-2-4k`; otherwise use `model: gpt-image-2-2k`. Preserve the Prompt text and size unchanged when selecting the model. Omit `quality` entirely for both models so the provider uses its default. Dry-run and final summaries report the selected model. The Images API has no documented reasoning field. An old `--reasoning-effort` option fails locally; do not silently ignore it.

## Size mapping

Preserve the requested orientation and use the nearest supported mapping only when the intent is clear:

| Requested intent | API size |
| --- | --- |
| Unspecified or unclear | `auto` |
| Square | `1024x1024` |
| Portrait 2:3 | `1024x1536` |
| Landscape 3:2 | `1536x1024` |
| 2K square | `2048x2048` |
| 2K portrait 9:16 | `1152x2048` |
| 2K landscape 16:9 | `2048x1152` |
| 4K portrait 9:16 | `2160x3840` |
| 4K landscape 16:9 | `3840x2160` |
| Square at the maximum 4K pixel budget | `2880x2880` |

Accept custom `WIDTHxHEIGHT` sizes that satisfy the [official GPT Image constraints](https://developers.openai.com/api/docs/guides/image-generation): both edges divisible by 16, neither edge above 3840 pixels, aspect ratio between 1:3 and 3:1, and total pixels between 655,360 and 8,294,400 inclusive. Reject invalid sizes locally without rounding or sending a request. In particular, `941x1672`, `1672x941`, and `4096x4096` are invalid. Resolutions above `2560x1440` are experimental. The configured provider's 2K/4K aliases may impose additional limits; these mappings are not a live compatibility guarantee.

If a user explicitly requests 4K and a clear ratio, choose the corresponding 4K mapping unless exact dimensions were provided. Do not invent a crop to force a mapping. `auto` omits `size` rather than sending the literal value; choosing the 4K model alone does not force a particular size.

## Execution timeout

Each Node and Python HTTP attempt may remain open for 600 seconds. Launch `generate` and `edit` with an outer command-runner timeout of at least `660000` milliseconds. When the shell exposes `timeout_ms`, set `timeout_ms: 660000` instead of accepting a default `120000` millisecond limit.

The outer limit leaves one minute for image validation, writing, re-reading, and the final JSON summary. `preflight`, `prompt-check`, and `verify` do not require it.

For two or more independent outputs, apply that minimum to every job process, not only to the overall collector. Give an overall collector for `N <= 5` at least `660000 + (N - 1) * 10000` milliseconds so the last regularly staggered job receives its full outer allowance. Above five jobs, capacity waits make the final launch time runtime-dependent: keep the collector alive until all handles settle and ensure at least 660 seconds remain after the final actual launch rather than promising a fixed completion formula.

## Multi-output scheduling

Keep the single-output path unchanged. For two or more independent outputs, the main agent must finish and structurally check every Prompt before any image request starts. Build a ledger in requested order with a stable unique job ID, one Prompt file, mode, ordered reference-image paths when editing, size, one unique explicit `.png` output path, process handle, state, and result. Reject duplicate IDs or outputs, existing output files, and any unresolved dependency before launch; do not use `--force`.

Use only a managed execution facility that can retain process handles and collect each command's final stdout, stderr, and exit state. Start the first job immediately. Start each later job at least 10,000 milliseconds after the previous actual start without waiting for that job to finish, while limiting active image jobs to five. If five are active, wait for a slot and still enforce the global 10,000-millisecond start interval. Immediately before launching, require ledger state `not_started` and an absent output, then record `running` plus the process handle before considering another launch.

Each configured job is exactly one `generate` or `edit` invocation and retains the complete single-image JSON-response, PNG, timeout, output, and retry contract. A job failure settles only that item; it does not cancel or rerun siblings. After all handles settle, return one ordered, sanitized summary covering every job. If reliable managed overlap and collection are unavailable, run the independent jobs serially and report the degradation; never use untracked detached commands or claim concurrency.

Never schedule dependencies together. In particular, complete and verify a reference-image baseline edit before launching any independent series outputs that consume it.

## Configuration

Read only `~/.codex/config.toml`:

1. Read top-level `model_provider`.
2. Read `[model_providers.<model_provider>]`.
3. Require `base_url`.
4. Read `experimental_bearer_token`, or use `api_key` from the same section when the former is absent or empty.

Do not fall back to another provider, workspace configuration, environment variable, or cached plugin file. Never modify this configuration file or remove `.codex`.

## Request

POST text-only generation to the configured base URL plus `/v1/images/generations`, and reference-image editing to `/v1/images/edits`. If the base URL already ends with `/v1` (optionally followed by a slash), append only `/images/generations` or `/images/edits`. Preserve other configured path prefixes. Reject embedded credentials, query strings, and fragments. Do not hardcode the hostname.

Generation headers:

```text
Authorization: Bearer <configured credential>
Content-Type: application/json
Accept: application/json
Connection: keep-alive
```

Body:

```json
{
  "model": "gpt-image-2-2k",
  "prompt": "Exact decoded Prompt file text",
  "size": "1536x1024"
}
```

Omit `size` when the CLI selects `auto`. Always omit `quality`; do not replace it with `high`, `auto`, or `null`. Do not send Responses API fields such as `input`, `tools`, `store`, `stream`, or `reasoning`. Redirects are rejected so credentials are not sent to a different endpoint.

## Editing

Use multipart/form-data for `/v1/images/edits`:

- Include `model`, the exact saved `prompt`, and optional explicit `size`; always omit `quality`.
- Read each repeated CLI `--image` file and upload its real binary contents under a repeated `image[]` field, with filename and detected MIME type. Preserve input order; do not send paths, URLs, or Base64 text as the file contents.
- Let the HTTP library generate Content-Type and its boundary. Node uses FormData/Blob with fetch; Python uses `requests.Request(..., data=fields, files=[("image[]", ...), ...]).prepare()` and sends the library's encoded body and generated header with the existing urllib transport. Do not manually construct multipart delimiters.
- Require 1–16 PNG, JPEG, or WebP files, each no larger than 50 MiB. These are local runtime guardrails, not a claim about the provider's maximum. Missing, unreadable, non-file, oversized, or unrecognized inputs fail locally with `E_EDIT_INPUT`.
- Explain roles in the Prompt, such as “image 1 is the original/base; image 2 is the logo.” Never reorder references or silently fall back to generation on editing failure.
- Dry-run validates and loads the ordered files, configuration, dependency, and destination but sends no network request.
- The user supplied a successful live test of `gpt-image-2-2k` with repeated PNG uploads and a decoded 2048×2048 PNG. Preserve existing Prompt-based 4K selection, but report 4K edits as unverified. Other models, masks, and streaming editing have not been live-verified; no mask or streaming option is implemented.

## JSON response

Require a JSON object with exactly one image in `data[0].b64_json`, then decode and validate it as PNG. A JSON error object or missing image data stops the job.

Use actual PNG dimensions as authoritative. The provider may return inconsistent top-level `size`, as in the supplied example. Report requested settings separately from provider metadata and flag size discrepancies. Preserve returned `quality` as provider metadata when present, without comparing it to a requested quality or inventing a default value. Do not emit `revised_prompt`, raw response bodies, Base64, or the full Prompt in diagnostics.

## PNG output

- Strictly decode Base64.
- Require the PNG eight-byte signature.
- Require a 13-byte `IHDR` first chunk.
- Read positive width and height from `IHDR`.
- Write through a temporary sibling file.
- Refuse overwrite unless `--force` is explicit.
- Re-read and verify the final file after writing.

The default output directory is `outputs/` under the current working directory.

## Retry ownership

For one user-authorized single-output pass, the agent launches one command. A multi-output pass may authorize multiple independent jobs, but each job still launches exactly one command. In both cases the runtime owns the sole technical retry, so each configured API job performs at most two HTTP requests: the initial request and one internal retry.

Allow the internal retry only after:

- an early network failure;
- HTTP 408;
- HTTP 429;
- HTTP 5xx;
- malformed or truncated JSON without usable image data.

Do not retry after the local 600-second API request timeout. Do not retry configuration, Prompt, input-file, 401/403, normal 4xx, safety, content, decoded-image, PNG, or file-write errors. Cap `Retry-After` waits at 10 seconds.

After each command exits, record that job's result and do not relaunch it. The runtime never launches a second command, changes the Prompt, or switches implementation. Wait for all sibling jobs before producing the unified multi-output summary.

## Errors

Return one JSON object on stdout for success or failure and concise diagnostics on stderr. Never include the token, Authorization header, raw configuration, or full Prompt.

Stable error codes:

```text
E_RUNTIME
E_CONFIG_MISSING
E_CONFIG_PARSE
E_CONFIG_KEY
E_PROMPT_ENCODING
E_PROMPT_LENGTH
E_PROMPT_STRUCTURE
E_EDIT_INPUT
E_AUTH
E_RATE_LIMIT
E_HTTP
E_RESPONSE_JSON
E_IMAGE_DATA
E_PNG
E_WRITE
```
