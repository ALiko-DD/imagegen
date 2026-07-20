# Runtime Contract

## Runtime selection

Use `scripts/imagegen.mjs` with Node.js 18 or newer. Use `scripts/imagegen.py` with Python 3.8 or newer only when Node.js is unavailable or too old. Select once during preflight; do not install dependencies or switch runtimes after a generation command fails.

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

## Size mapping

Preserve the requested orientation and use the nearest supported mapping only when the intent is clear:

| Requested intent | API size |
| --- | --- |
| Unspecified or unclear | `auto` |
| Square | `1024x1024` |
| Portrait 2:3 | `1024x1536` |
| Landscape 3:2 | `1536x1024` |
| Portrait 9:16 | `941x1672` |
| Landscape 16:9 | `1672x941` |

Do not invent a crop to force a mapping. Keep `auto` when no supported ratio maps clearly.

## Execution timeout

Each Node and Python HTTP attempt may remain open for 600 seconds. Launch `generate` and `edit` with an outer command-runner timeout of at least `660000` milliseconds. When the shell exposes `timeout_ms`, set `timeout_ms: 660000` instead of accepting a default `120000` millisecond limit.

The outer limit leaves one minute for image validation, writing, re-reading, and the final JSON summary. `preflight`, `prompt-check`, and `verify` do not require it.

## Configuration

Read only `~/.codex/config.toml`:

1. Read top-level `model_provider`.
2. Read `[model_providers.<model_provider>]`.
3. Require `base_url`.
4. Require `experimental_bearer_token`.

Do not fall back to another provider, workspace configuration, environment variable, or cached plugin file.

## Request

POST to:

```text
{base_url}/backend-api/codex/responses
```

Required headers:

```text
Authorization: Bearer <experimental_bearer_token>
Content-Type: application/json
Accept: text/event-stream
Originator: codex_cli_rs
```

Body invariants:

- `model`: `gpt-5.6-terra`
- `store`: `false`
- `stream`: `true`
- one `image_generation` tool with `quality: high`
- `tool_choice` forced to `image_generation`
- exact decoded Prompt file text in `input_text`

Set `tools[0].size` only when size is not `auto`.

## Editing

The configured API edit route is experimental:

- accept 1–16 PNG, JPEG, or WebP files;
- reject files larger than 50 MiB;
- preserve command-line order;
- convert each image to a data URL in an `input_image` item;
- place `input_text` after all images;
- return `experimental: true` and a warning.

Do not claim third-party edit compatibility without a real provider test.

## SSE

- Decode UTF-8 incrementally.
- Join multi-line `data:` fields.
- Ignore comments and empty events.
- Accept `[DONE]`.
- Prefer `item.result`.
- Use the last `partial_image_b64` only when no final result exists.
- Treat malformed JSON and missing image data as technical stream errors.

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

For one user-authorized pass, the agent launches one command and the runtime owns the sole technical retry. A configured API command therefore performs at most two HTTP requests: the initial request and one internal retry.

Allow the internal retry only after:

- an early network failure;
- HTTP 408;
- HTTP 429;
- HTTP 5xx;
- malformed or truncated SSE without usable image data.

Do not retry after the local 600-second API request timeout. Do not retry configuration, Prompt, input-file, 401/403, normal 4xx, safety, content, decoded-image, PNG, or file-write errors. Cap `Retry-After` waits at 10 seconds.

After the command exits, return control to the agent. The runtime never launches a second command, changes the Prompt, or switches implementation.

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
E_SSE
E_IMAGE_DATA
E_PNG
E_WRITE
```
