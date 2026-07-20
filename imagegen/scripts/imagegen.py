#!/usr/bin/env python3
"""Dependency-free fallback runtime for the imagegen Skill."""

from __future__ import annotations

import argparse
import base64
import binascii
import codecs
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import secrets
import shutil
import struct
import subprocess
import sys
import time
from typing import Any, BinaryIO, Dict, List, Optional, Sequence, Tuple
import urllib.error
import urllib.request


MODEL = "gpt-5.6-terra"
ENDPOINT_PATH = "/backend-api/codex/responses"
MAX_PROMPT_CHARACTERS = 20_000
RECOMMENDED_PROMPT_CHARACTERS = {"min": 200, "max": 4_000}
MAX_INPUT_IMAGES = 16
MAX_INPUT_BYTES = 50 * 1024 * 1024
REQUEST_TIMEOUT_SECONDS = 600
SUPPORTED_SIZES = {
    "auto",
    "1024x1024",
    "1024x1536",
    "1536x1024",
    "941x1672",
    "1672x941",
}
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
SCRIPT_DIR = Path(__file__).resolve().parent
FIXTURE_DIR = SCRIPT_DIR / "tests" / "fixtures"


class SkillError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        response_headers: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.response_headers = response_headers


def fail(code: str, message: str, *, retryable: bool = False) -> None:
    raise SkillError(code, message, retryable=retryable)


def safe_text(value: Any, limit: int = 600) -> str:
    text = str(value or "")
    text = re.sub(
        r"Authorization\s*:\s*Bearer\s+\S+",
        "Authorization: Bearer <redacted>",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"(experimental_bearer_token|token|secret|password|api[_-]?key)"
        r"\s*[:=]\s*[\"']?[^\"'\s,}]+",
        r"\1=<redacted>",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"Bearer\s+\S+", "Bearer <redacted>", text, flags=re.IGNORECASE)
    return text if len(text) <= limit else text[:limit] + "…"


def emit_json(value: Dict[str, Any]) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2))


class SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        raise SkillError("E_RUNTIME", message)


def build_parser() -> argparse.ArgumentParser:
    parser = SafeArgumentParser(prog="imagegen.py")
    subparsers = parser.add_subparsers(dest="command", required=True)

    preflight = subparsers.add_parser("preflight")
    preflight.add_argument("--out-dir")

    prompt_check = subparsers.add_parser("prompt-check")
    prompt_check.add_argument("--prompt-file", required=True)
    prompt_check.add_argument("--mode", choices=["generate", "edit"], default="generate")

    for command in ("generate", "edit"):
        operation = subparsers.add_parser(command)
        operation.add_argument("--prompt-file", required=True)
        operation.add_argument("--size", choices=sorted(SUPPORTED_SIZES), default="auto")
        operation.add_argument("--out")
        operation.add_argument("--out-dir")
        operation.add_argument("--force", action="store_true")
        operation.add_argument("--dry-run", action="store_true")
        if command == "edit":
            operation.add_argument("--image", action="append", required=True)

    verify = subparsers.add_parser("verify")
    verify.add_argument("--file", required=True)

    subparsers.add_parser("self-test")
    return parser


def strip_toml_comment(line: str) -> str:
    quote: Optional[str] = None
    escaped = False
    for index, character in enumerate(line):
        if quote == '"':
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                quote = None
            continue
        if quote == "'":
            if character == "'":
                quote = None
            continue
        if character in {'"', "'"}:
            quote = character
            continue
        if character == "#":
            return line[:index]
    return line


def parse_toml_scalar(raw: str, line_number: int, key: str) -> str:
    value = raw.strip()
    if value.startswith('"""') or value.startswith("'''"):
        fail(
            "E_CONFIG_PARSE",
            f"Multiline TOML values are not supported for {key} at line {line_number}.",
        )
    if value.startswith('"'):
        try:
            parsed = json.loads(value)
        except (ValueError, TypeError):
            fail("E_CONFIG_PARSE", f"Invalid quoted value for {key} at line {line_number}.")
        if not isinstance(parsed, str):
            fail("E_CONFIG_PARSE", f"Invalid quoted value for {key} at line {line_number}.")
        return parsed
    if value.startswith("'"):
        if len(value) < 2 or not value.endswith("'"):
            fail("E_CONFIG_PARSE", f"Invalid quoted value for {key} at line {line_number}.")
        return value[1:-1]
    if re.fullmatch(r"[A-Za-z0-9_.:/+-]+", value):
        return value
    fail("E_CONFIG_PARSE", f"Unsupported value for {key} at line {line_number}.")
    return ""


def parse_config_text(text: str) -> Dict[str, str]:
    top_level: Dict[str, str] = {}
    sections: Dict[str, Dict[str, str]] = {}
    current_section = ""

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        line = strip_toml_comment(raw_line).strip()
        if not line:
            continue
        section_match = re.fullmatch(r"\[(.+)]", line)
        if section_match:
            current_section = section_match.group(1).strip()
            sections.setdefault(current_section, {})
            continue
        assignment = re.fullmatch(r"([A-Za-z0-9_.-]+)\s*=\s*(.+)", line)
        if not assignment:
            continue
        key = assignment.group(1)
        relevant = (
            (not current_section and key == "model_provider")
            or (
                current_section.startswith("model_providers.")
                and key in {"base_url", "experimental_bearer_token"}
            )
        )
        if not relevant:
            continue
        value = parse_toml_scalar(assignment.group(2), line_number, key)
        if current_section:
            sections[current_section][key] = value
        else:
            top_level[key] = value

    provider = top_level.get("model_provider")
    if not provider:
        fail("E_CONFIG_KEY", 'Missing top-level "model_provider" in config.toml.')
    section_name = f"model_providers.{provider}"
    provider_section = sections.get(section_name)
    if provider_section is None:
        fail("E_CONFIG_KEY", f"Missing [{section_name}] in config.toml.")
    base_url = provider_section.get("base_url")
    token = provider_section.get("experimental_bearer_token")
    if not base_url:
        fail("E_CONFIG_KEY", f"Missing base_url in [{section_name}].")
    if not token:
        fail("E_CONFIG_KEY", f"Missing experimental_bearer_token in [{section_name}].")
    if not re.match(r"^https?://", base_url, flags=re.IGNORECASE):
        fail("E_CONFIG_PARSE", f"base_url in [{section_name}] must use http or https.")
    return {
        "provider": provider,
        "base_url": base_url.rstrip("/"),
        "token": token,
    }


def read_config() -> Dict[str, str]:
    config_path = Path.home() / ".codex" / "config.toml"
    try:
        text = config_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail("E_CONFIG_MISSING", f"Config file not found: {config_path}")
    except (OSError, UnicodeError) as error:
        fail("E_CONFIG_PARSE", f"Could not read config file: {safe_text(error)}")
    return {
        "config_path": str(config_path),
        **parse_config_text(text),
    }


def find_unresolved_placeholder(text: str) -> Optional[str]:
    patterns = [
        r"\b(?:TBD|TODO|PLACEHOLDER|UNKNOWN)\b",
        r"(?:待补充|待确认|未提供|请填写|请替换|占位符)",
        r"\{\{[^}\n]+}}",
        r"\{argument\b",
        r"<[^>\n]{1,100}>",
        r"\[[^\]\n]*(?:待|填|未提供|placeholder|missing|exact text|insert|TBD|TODO)[^\]\n]*]",
    ]
    for pattern in patterns:
        if re.search(pattern, text, flags=re.IGNORECASE):
            return pattern
    return None


def find_encoding_corruption(text: str) -> Optional[str]:
    patterns = [
        r"\uFFFD",
        r"锟斤拷",
        r"鈥[?？]",
        r"(?:闁|鐨|鍏|鏂|浠|绀|鍥|锛|銆){4,}",
    ]
    for pattern in patterns:
        if re.search(pattern, text):
            return pattern
    return None


def detect_prompt_format(text: str) -> str:
    if text[0] in "[{":
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as error:
            fail("E_PROMPT_STRUCTURE", f"Prompt looks like JSON but is invalid: {safe_text(error)}")
        if not isinstance(parsed, (dict, list)):
            fail("E_PROMPT_STRUCTURE", "A JSON Prompt must be a top-level object or array.")
        return "json"
    if re.search(r"^#{1,6}\s+\S", text, flags=re.MULTILINE):
        return "markdown"
    return "prose"


def validate_prompt_text(text: str, mode: str = "generate") -> Dict[str, Any]:
    if text.startswith("\ufeff"):
        fail("E_PROMPT_ENCODING", "Prompt must be UTF-8 without BOM.")
    trimmed = text.strip()
    characters = len(trimmed)
    if characters == 0:
        fail("E_PROMPT_LENGTH", "Prompt is empty.")
    if characters > MAX_PROMPT_CHARACTERS:
        fail(
            "E_PROMPT_LENGTH",
            f"Prompt has {characters} Unicode characters; maximum supported length is "
            f"{MAX_PROMPT_CHARACTERS}.",
        )
    if find_encoding_corruption(trimmed):
        fail("E_PROMPT_ENCODING", "Prompt appears to contain corrupted or mojibake text.")
    if find_unresolved_placeholder(trimmed):
        fail(
            "E_PROMPT_STRUCTURE",
            "Prompt contains an unresolved placeholder or missing-value marker. "
            "Ask for the smallest required field instead of generating.",
        )
    prompt_format = detect_prompt_format(trimmed)
    if characters < RECOMMENDED_PROMPT_CHARACTERS["min"]:
        length_advisory = "short"
    elif characters > RECOMMENDED_PROMPT_CHARACTERS["max"]:
        length_advisory = "long"
    else:
        length_advisory = "within_recommended_range"
    return {
        "text": text,
        "characters": characters,
        "mode": mode,
        "format": prompt_format,
        "length_advisory": length_advisory,
        "semantic_review_required": True,
    }


def read_prompt(prompt_file: str, mode: str) -> Dict[str, Any]:
    prompt_path = Path(prompt_file).resolve()
    try:
        raw = prompt_path.read_bytes()
    except OSError as error:
        fail("E_PROMPT_ENCODING", f"Could not read Prompt file: {safe_text(error)}")
    if raw.startswith(b"\xef\xbb\xbf"):
        fail("E_PROMPT_ENCODING", "Prompt must be UTF-8 without BOM.")
    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        fail("E_PROMPT_ENCODING", "Prompt contains invalid UTF-8 bytes.")
    return {
        "prompt_file": str(prompt_path),
        **validate_prompt_text(text, mode),
    }


def detect_mime(data: bytes, file_path: str) -> str:
    if data.startswith(PNG_SIGNATURE):
        return "image/png"
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    fail("E_EDIT_INPUT", f"Unsupported image format: {file_path}. Use PNG, JPEG, or WebP.")
    return ""


def load_input_images(image_paths: Sequence[str]) -> List[Dict[str, Any]]:
    if not image_paths:
        fail("E_EDIT_INPUT", "The edit command requires at least one --image.")
    if len(image_paths) > MAX_INPUT_IMAGES:
        fail("E_EDIT_INPUT", f"At most {MAX_INPUT_IMAGES} input images are supported.")
    images: List[Dict[str, Any]] = []
    for raw_path in image_paths:
        image_path = Path(raw_path).resolve()
        if not image_path.is_file():
            fail("E_EDIT_INPUT", f"Input image not found: {image_path}")
        try:
            size = image_path.stat().st_size
        except OSError as error:
            fail("E_EDIT_INPUT", f"Could not inspect input image: {safe_text(error)}")
        if size > MAX_INPUT_BYTES:
            fail("E_EDIT_INPUT", f"Input image exceeds 50 MiB: {image_path}")
        try:
            data = image_path.read_bytes()
        except OSError as error:
            fail("E_EDIT_INPUT", f"Could not read input image: {safe_text(error)}")
        mime = detect_mime(data, str(image_path))
        images.append(
            {
                "path": str(image_path),
                "mime": mime,
                "bytes": data,
                "data_url": f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}",
            }
        )
    return images


def build_payload(
    prompt_text: str,
    mode: str,
    size: str,
    images: Sequence[Dict[str, Any]],
) -> Dict[str, Any]:
    tool: Dict[str, Any] = {
        "type": "image_generation",
        "quality": "high",
    }
    if size != "auto":
        tool["size"] = size
    content: List[Dict[str, Any]] = []
    if mode == "edit":
        content.extend(
            {
                "type": "input_image",
                "image_url": image["data_url"],
            }
            for image in images
        )
    content.append(
        {
            "type": "input_text",
            "text": prompt_text,
        }
    )
    return {
        "model": MODEL,
        "store": False,
        "stream": True,
        "tools": [tool],
        "tool_choice": {
            "type": "image_generation",
        },
        "input": [
            {
                "role": "user",
                "content": content,
            }
        ],
    }


def request_summary(payload: Dict[str, Any], mode: str) -> Dict[str, Any]:
    content = payload["input"][0]["content"]
    prompt_text = next(item["text"] for item in content if item["type"] == "input_text")
    return {
        "model": payload["model"],
        "store": payload["store"],
        "stream": payload["stream"],
        "tool": payload["tools"][0],
        "tool_choice": payload["tool_choice"],
        "endpoint_path": ENDPOINT_PATH,
        "mode": mode,
        "input_types": [item["type"] for item in content],
        "input_image_count": sum(item["type"] == "input_image" for item in content),
        "prompt_sha256": hashlib.sha256(prompt_text.encode("utf-8")).hexdigest(),
    }


def scan_event_value(value: Any, state: Dict[str, Any]) -> None:
    if isinstance(value, list):
        for item in value:
            scan_event_value(item, state)
        return
    if not isinstance(value, dict):
        return
    item = value.get("item")
    if isinstance(item, dict) and isinstance(item.get("result"), str):
        state["final_image"] = item["result"]
    if isinstance(value.get("partial_image_b64"), str):
        state["partial_image"] = value["partial_image_b64"]
    for nested in value.values():
        scan_event_value(nested, state)


def process_sse_block(block: str, state: Dict[str, Any]) -> None:
    data_lines = []
    for raw_line in block.split("\n"):
        line = raw_line[:-1] if raw_line.endswith("\r") else raw_line
        if not line or line.startswith(":"):
            continue
        if line.startswith("data:"):
            data_lines.append(line[5:].lstrip())
    if not data_lines:
        return
    data = "\n".join(data_lines).strip()
    if not data:
        return
    if data == "[DONE]":
        state["done"] = True
        return
    try:
        event = json.loads(data)
    except json.JSONDecodeError:
        fail("E_SSE", "SSE contained invalid JSON.", retryable=True)
    event_type = str(event.get("type", ""))
    if event.get("error") or re.search(r"(?:^|\.)(?:error|failed)$", event_type):
        error = event.get("error")
        if isinstance(error, dict):
            message = error.get("message")
        else:
            message = None
        message = message or event.get("message") or "Provider returned an SSE error."
        fail("E_HTTP", safe_text(message))
    scan_event_value(event, state)


def finish_sse_state(state: Dict[str, Any]) -> Dict[str, Any]:
    image_base64 = state.get("final_image") or state.get("partial_image")
    if not image_base64:
        fail("E_IMAGE_DATA", "SSE completed without image data.", retryable=True)
    return {
        "image_base64": image_base64,
        "source": "item.result" if state.get("final_image") else "partial_image_b64",
        "done": bool(state.get("done")),
    }


def parse_sse_text(text: str) -> Dict[str, Any]:
    state = {
        "final_image": None,
        "partial_image": None,
        "done": False,
    }
    normalized = text.replace("\r\n", "\n")
    for block in normalized.split("\n\n"):
        if block.strip():
            process_sse_block(block, state)
    return finish_sse_state(state)


def parse_sse_reader(reader: BinaryIO) -> Dict[str, Any]:
    state = {
        "final_image": None,
        "partial_image": None,
        "done": False,
    }
    decoder = codecs.getincrementaldecoder("utf-8")(errors="strict")
    buffer = ""
    try:
        while True:
            chunk = reader.read(8192)
            if not chunk:
                break
            buffer += decoder.decode(chunk, final=False)
            buffer = buffer.replace("\r\n", "\n")
            while "\n\n" in buffer:
                block, buffer = buffer.split("\n\n", 1)
                process_sse_block(block, state)
        buffer += decoder.decode(b"", final=True)
    except UnicodeDecodeError:
        fail("E_SSE", "Could not decode SSE as UTF-8.", retryable=True)
    if buffer.strip():
        process_sse_block(buffer, state)
    return finish_sse_state(state)


def decode_base64_strict(value: str) -> bytes:
    if not isinstance(value, str):
        fail("E_IMAGE_DATA", "Image data is not a Base64 string.")
    compact = re.sub(r"\s+", "", value)
    if not compact or not re.fullmatch(r"[A-Za-z0-9+/]*={0,2}", compact) or len(compact) % 4 == 1:
        fail("E_IMAGE_DATA", "Image data is not valid Base64.")
    try:
        data = base64.b64decode(compact, validate=True)
    except (ValueError, binascii.Error):
        fail("E_IMAGE_DATA", "Image data could not be decoded.")
    if not data:
        fail("E_IMAGE_DATA", "Decoded image data is empty.")
    canonical_input = compact.rstrip("=")
    canonical_output = base64.b64encode(data).decode("ascii").rstrip("=")
    if canonical_input != canonical_output:
        fail("E_IMAGE_DATA", "Image data failed strict Base64 validation.")
    return data


def verify_png_bytes(data: bytes) -> Dict[str, int]:
    if len(data) < 33 or not data.startswith(PNG_SIGNATURE):
        fail("E_PNG", "Decoded bytes do not have a valid PNG signature.")
    ihdr_length = struct.unpack(">I", data[8:12])[0]
    chunk_type = data[12:16]
    if ihdr_length != 13 or chunk_type != b"IHDR":
        fail("E_PNG", "PNG does not begin with a valid IHDR chunk.")
    width, height = struct.unpack(">II", data[16:24])
    if width < 1 or height < 1:
        fail("E_PNG", "PNG dimensions must be positive.")
    return {
        "width": width,
        "height": height,
        "bytes": len(data),
    }


def verify_png_file(file_path: Path) -> Dict[str, int]:
    try:
        data = file_path.read_bytes()
    except OSError as error:
        fail("E_PNG", f"Could not read PNG file: {safe_text(error)}")
    return verify_png_bytes(data)


def default_output_name() -> str:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"imagegen-{timestamp}-{secrets.token_hex(3)}.png"


def resolve_output_path(args: argparse.Namespace) -> Path:
    if args.out and args.out_dir:
        fail("E_WRITE", "Use --out or --out-dir, not both.")
    if args.out:
        output_path = Path(args.out).resolve()
        if output_path.suffix.lower() != ".png":
            fail("E_WRITE", "--out must use a .png extension.")
        return output_path
    output_dir = Path(args.out_dir).resolve() if args.out_dir else Path.cwd() / "outputs"
    return output_dir / default_output_name()


def ensure_writable_directory(directory: Path) -> None:
    probe = directory / f".imagegen-write-{os.getpid()}-{secrets.token_hex(3)}"
    try:
        directory.mkdir(parents=True, exist_ok=True)
        descriptor = os.open(str(probe), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(descriptor)
        probe.unlink()
    except OSError as error:
        try:
            if probe.exists():
                probe.unlink()
        except OSError:
            pass
        fail("E_WRITE", f"Output directory is not writable: {safe_text(error)}")


def write_png(output_path: Path, data: bytes, force: bool) -> Dict[str, int]:
    ensure_writable_directory(output_path.parent)
    if output_path.exists() and not force:
        fail("E_WRITE", f"Output file already exists: {output_path}")
    temporary = output_path.parent / (
        f".{output_path.name}.{os.getpid()}.{secrets.token_hex(3)}.tmp"
    )
    try:
        with open(temporary, "xb") as stream:
            stream.write(data)
        if force and output_path.exists():
            output_path.unlink()
        os.replace(str(temporary), str(output_path))
    except OSError as error:
        try:
            if temporary.exists():
                temporary.unlink()
        except OSError:
            pass
        fail("E_WRITE", f"Could not write PNG: {safe_text(error)}")
    return verify_png_file(output_path)


def command_version(command: str) -> Optional[Dict[str, str]]:
    location = shutil.which(command)
    if not location:
        return None
    arguments = [command, "--version"]
    if command in {"powershell", "pwsh"}:
        arguments = [
            command,
            "-NoLogo",
            "-NoProfile",
            "-Command",
            "$PSVersionTable.PSVersion.ToString()",
        ]
    elif command == "cmd":
        arguments = [command, "/d", "/c", "ver"]
    try:
        result = subprocess.run(
            arguments,
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        output = (result.stdout + result.stderr).strip().splitlines()
    except (OSError, subprocess.SubprocessError):
        output = []
    return {
        "command": command,
        "location": location,
        "version": output[0] if output else "available",
    }


def detect_environment() -> Dict[str, Any]:
    shell_names = ["powershell", "pwsh", "cmd", "bash"] if os.name == "nt" else ["sh", "bash", "zsh"]
    python_names = ["python", "py", "python3"] if os.name == "nt" else ["python3", "python"]
    return {
        "os": sys.platform,
        "architecture": platform.machine(),
        "active_shell": os.environ.get("ComSpec") or os.environ.get("SHELL"),
        "shells": [value for value in (command_version(name) for name in shell_names) if value],
        "node": command_version("node"),
        "python": {
            "executable": sys.executable,
            "version": platform.python_version(),
            "supported": sys.version_info >= (3, 8),
            "candidates": [
                value for value in (command_version(name) for name in python_names) if value
            ],
        },
    }


def retry_delay_seconds(headers: Any, attempt: int) -> float:
    if headers is not None:
        retry_after = headers.get("Retry-After")
        if retry_after:
            try:
                return min(10.0, max(0.0, float(retry_after)))
            except ValueError:
                pass
    return min(10.0, float(2**attempt))


def classify_request_failure(error: BaseException) -> Tuple[str, bool]:
    reason = error.reason if isinstance(error, urllib.error.URLError) else error
    timed_out = isinstance(reason, TimeoutError)
    if timed_out:
        return f"Image request timed out after {REQUEST_TIMEOUT_SECONDS} seconds.", False
    return f"Image request failed: {safe_text(error)}", True


def request_once(config: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
    endpoint = config["base_url"] + ENDPOINT_PATH
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {config['token']}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "Originator": "codex_cli_rs",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            return parse_sse_reader(response)
    except urllib.error.HTTPError as error:
        try:
            body = safe_text(error.read().decode("utf-8", errors="replace"))
        except OSError:
            body = ""
        if error.code in (401, 403):
            raise SkillError(
                "E_AUTH",
                f"Provider authentication failed with HTTP {error.code}. {body}",
            )
        if error.code == 429:
            raise SkillError(
                "E_RATE_LIMIT",
                f"Provider rate limit returned HTTP 429. {body}",
                retryable=True,
                response_headers=error.headers,
            )
        if error.code == 408 or error.code >= 500:
            raise SkillError(
                "E_HTTP",
                f"Provider returned HTTP {error.code}. {body}",
                retryable=True,
                response_headers=error.headers,
            )
        raise SkillError("E_HTTP", f"Provider returned HTTP {error.code}. {body}")
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        message, retryable = classify_request_failure(error)
        raise SkillError(
            "E_HTTP",
            message,
            retryable=retryable,
        )


def request_image(config: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
    last_error: Optional[SkillError] = None
    for attempt in range(2):
        try:
            return {
                **request_once(config, payload),
                "attempts": attempt + 1,
            }
        except SkillError as error:
            last_error = error
            if not error.retryable or attempt == 1:
                break
            time.sleep(retry_delay_seconds(error.response_headers, attempt))
    if last_error is None:
        fail("E_HTTP", "Image request failed without a diagnostic.")
    raise last_error


def run_preflight(args: argparse.Namespace) -> Dict[str, Any]:
    if sys.version_info < (3, 8):
        fail("E_RUNTIME", f"Python 3.8 or newer is required; found {platform.python_version()}.")
    config = read_config()
    output_directory = Path(args.out_dir).resolve() if args.out_dir else Path.cwd() / "outputs"
    ensure_writable_directory(output_directory)
    return {
        "status": "ok",
        "command": "preflight",
        "runtime": "python",
        "environment": detect_environment(),
        "config": {
            "path": config["config_path"],
            "provider": config["provider"],
            "base_url_present": True,
            "experimental_bearer_token_present": True,
        },
        "dependencies": {
            "external_packages": [],
            "standard_library_http": True,
            "strict_utf8_decoder": True,
        },
        "model": MODEL,
        "output_directory": str(output_directory),
        "network_request_performed": False,
        "warnings": [],
    }


def run_prompt_check(args: argparse.Namespace) -> Dict[str, Any]:
    prompt = read_prompt(args.prompt_file, args.mode)
    return {
        "status": "ok",
        "command": "prompt-check",
        "runtime": "python",
        "mode": args.mode,
        "prompt_file": prompt["prompt_file"],
        "prompt_characters": prompt["characters"],
        "prompt_format": prompt["format"],
        "length_advisory": prompt["length_advisory"],
        "recommended_character_range": RECOMMENDED_PROMPT_CHARACTERS,
        "validation_scope": [
            "utf8",
            "mojibake_scan",
            "nonempty",
            "maximum_length",
            "format",
            "json_syntax",
            "placeholder_scan",
        ],
        "semantic_review_required": True,
        "network_request_performed": False,
        "warnings": [
            "Structural checks passed; confirm semantic completeness, exact user values, "
            "and unresolved decisions before generation."
        ],
    }


def run_generate_or_edit(args: argparse.Namespace) -> Dict[str, Any]:
    mode = args.command
    prompt = read_prompt(args.prompt_file, mode)
    config = read_config()
    images = load_input_images(args.image) if mode == "edit" else []
    payload = build_payload(prompt["text"], mode, args.size, images)
    summary = request_summary(payload, mode)
    output_path = resolve_output_path(args)
    ensure_writable_directory(output_path.parent)
    if output_path.exists() and not args.force:
        fail("E_WRITE", f"Output file already exists: {output_path}")

    if args.dry_run:
        return {
            "status": "ok",
            "command": mode,
            "runtime": "python",
            "model": MODEL,
            "prompt_file": prompt["prompt_file"],
            "prompt_characters": prompt["characters"],
            "output_path": str(output_path),
            "request_summary": summary,
            "experimental": mode == "edit",
            "network_request_performed": False,
            "warnings": (
                ["Direct API editing is experimental and has not been live-tested."]
                if mode == "edit"
                else []
            ),
        }

    response = request_image(config, payload)
    image_data = decode_base64_strict(response["image_base64"])
    verify_png_bytes(image_data)
    written = write_png(output_path, image_data, args.force)
    return {
        "status": "ok",
        "command": mode,
        "runtime": "python",
        "model": MODEL,
        "output_path": str(output_path),
        "width": written["width"],
        "height": written["height"],
        "prompt_characters": prompt["characters"],
        "result_source": response["source"],
        "experimental": mode == "edit",
        "attempts": response["attempts"],
        "network_request_performed": True,
        "warnings": (
            ["Direct API editing is experimental and has not been live-tested."]
            if mode == "edit"
            else []
        ),
    }


def run_verify(args: argparse.Namespace) -> Dict[str, Any]:
    file_path = Path(args.file).resolve()
    result = verify_png_file(file_path)
    return {
        "status": "ok",
        "command": "verify",
        "runtime": "python",
        "file": str(file_path),
        **result,
        "network_request_performed": False,
        "warnings": [],
    }


def read_fixture(name: str) -> str:
    return (FIXTURE_DIR / name).read_text(encoding="utf-8")


def assert_test(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run_self_test() -> Dict[str, Any]:
    tests: List[str] = []

    config = parse_config_text(read_fixture("config-valid.toml"))
    assert_test(config["provider"] == "vendor", "provider mismatch")
    assert_test(config["base_url"] == "https://example.invalid/api", "base URL mismatch")
    assert_test(config["token"] == "fixture-token", "token mismatch")
    tests.append("config-valid")

    code = None
    try:
        parse_config_text(read_fixture("config-missing-token.toml"))
    except SkillError as error:
        code = error.code
    assert_test(code == "E_CONFIG_KEY", "missing token should be E_CONFIG_KEY")
    tests.append("config-missing-token")

    sample_prompt = "\n".join(
        [
            "# Goal",
            "生成一张结构清晰的测试视觉。",
            "# Required elements",
            "- 保持中文、数字 123 和符号完整。",
            "# Output format / size",
            "1024x1024 PNG。",
            "# Negative constraints",
            "- 不添加未指定内容。",
        ]
    )
    prompt_result = validate_prompt_text(sample_prompt, "generate")
    assert_test(prompt_result["format"] == "markdown", "Markdown format detection mismatch")
    assert_test(
        validate_prompt_text(
            '{"type":"测试图","subject":"中文主体","layout":{"count":1}}'
        )["format"]
        == "json",
        "JSON format detection mismatch",
    )
    assert_test(
        validate_prompt_text("创建一张中文自然语言测试图，主体居中，背景简洁。")["format"]
        == "prose",
        "prose format detection mismatch",
    )
    tests.append("prompt-contract")

    code = None
    try:
        validate_prompt_text('{"type":"损坏 JSON",}')
    except SkillError as error:
        code = error.code
    assert_test(code == "E_PROMPT_STRUCTURE", "invalid JSON should be E_PROMPT_STRUCTURE")
    tests.append("prompt-invalid-json-rejection")

    code = None
    try:
        validate_prompt_text(sample_prompt + "\n- 待补充精确标题", "generate")
    except SkillError as error:
        code = error.code
    assert_test(code == "E_PROMPT_STRUCTURE", "placeholder should be E_PROMPT_STRUCTURE")
    tests.append("prompt-placeholder-rejection")

    png_base64 = read_fixture("png-1x1.b64").strip()
    png_result = verify_png_bytes(decode_base64_strict(png_base64))
    assert_test(png_result["width"] == 1 and png_result["height"] == 1, "PNG mismatch")
    tests.append("png-validation")

    final_sse = read_fixture("sse-final.txt").replace("__PNG_BASE64__", png_base64)
    final_result = parse_sse_text(final_sse)
    assert_test(final_result["source"] == "item.result", "final result should win")
    tests.append("sse-final-priority")

    partial_sse = read_fixture("sse-partial.txt").replace("__PNG_BASE64__", png_base64)
    partial_result = parse_sse_text(partial_sse)
    assert_test(partial_result["source"] == "partial_image_b64", "partial mismatch")
    tests.append("sse-partial-fallback")

    code = None
    try:
        parse_sse_text(read_fixture("sse-malformed.txt"))
    except SkillError as error:
        code = error.code
    assert_test(code == "E_SSE", "malformed SSE should be E_SSE")
    tests.append("sse-malformed")

    image = {"data_url": f"data:image/png;base64,{png_base64}"}
    generate = build_payload(sample_prompt, "generate", "1024x1024", [])
    edit = build_payload(sample_prompt, "edit", "auto", [image, image])
    assert_test(generate["model"] == MODEL, "model mismatch")
    assert_test(generate["tools"][0]["size"] == "1024x1024", "size mismatch")
    assert_test(
        sum(item["type"] == "input_image" for item in edit["input"][0]["content"]) == 2,
        "edit image order mismatch",
    )
    assert_test(edit["input"][0]["content"][-1]["type"] == "input_text", "text order mismatch")
    tests.append("request-shape")

    assert_test(REQUEST_TIMEOUT_SECONDS == 600, "request timeout must be 600 seconds")
    timeout_message, timeout_retryable = classify_request_failure(TimeoutError("timed out"))
    wrapped_message, wrapped_retryable = classify_request_failure(
        urllib.error.URLError(TimeoutError("timed out"))
    )
    network_message, network_retryable = classify_request_failure(
        urllib.error.URLError(OSError("connection reset"))
    )
    assert_test(not timeout_retryable, "full request timeout must not retry")
    assert_test(not wrapped_retryable, "wrapped full request timeout must not retry")
    assert_test("600 seconds" in timeout_message, "timeout diagnostic must state 600 seconds")
    assert_test("600 seconds" in wrapped_message, "wrapped timeout diagnostic must state 600 seconds")
    assert_test(network_retryable, "early network failure must remain retryable")
    assert_test("connection reset" in network_message, "network diagnostic mismatch")
    tests.append("request-timeout-contract")

    return {
        "status": "ok",
        "command": "self-test",
        "runtime": "python",
        "tests": tests,
        "test_count": len(tests),
        "network_request_performed": False,
        "warnings": [],
    }


def run(args: argparse.Namespace) -> Dict[str, Any]:
    if args.command == "preflight":
        return run_preflight(args)
    if args.command == "prompt-check":
        return run_prompt_check(args)
    if args.command in {"generate", "edit"}:
        return run_generate_or_edit(args)
    if args.command == "verify":
        return run_verify(args)
    return run_self_test()


def main() -> int:
    try:
        args = build_parser().parse_args()
        emit_json(run(args))
        return 0
    except SkillError as error:
        print(f"{error.code}: {safe_text(error)}", file=sys.stderr)
        emit_json(
            {
                "status": "error",
                "command": sys.argv[1] if len(sys.argv) > 1 else None,
                "runtime": "python",
                "code": error.code,
                "message": safe_text(error),
                "network_request_performed": False,
            }
        )
        return 1
    except Exception as error:
        message = f"Unexpected runtime error: {safe_text(error)}"
        print(f"E_RUNTIME: {message}", file=sys.stderr)
        emit_json(
            {
                "status": "error",
                "command": sys.argv[1] if len(sys.argv) > 1 else None,
                "runtime": "python",
                "code": "E_RUNTIME",
                "message": message,
                "network_request_performed": False,
            }
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
