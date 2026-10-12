#!/usr/bin/env python3
"""Dependency-free fallback runtime for the imagegen Skill."""

from __future__ import annotations

import argparse
import base64
import binascii
from datetime import datetime
import hashlib
import http.client
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
from typing import Any, Dict, List, Optional, Tuple
import urllib.error
import urllib.request
import urllib.parse


MODEL = "gpt-image-2-2k"
MODEL_4K = "gpt-image-2-4k"
ENDPOINT_PATH = "/v1/images/generations"
MAX_PROMPT_CHARACTERS = 20_000
RECOMMENDED_PROMPT_CHARACTERS = {"min": 200, "max": 4_000}
REQUEST_TIMEOUT_SECONDS = 600
SENSITIVE_VALUES = set()
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
SELF_TEST_CONFIG = "\n".join(
    [
        'model_provider = "vendor"',
        "",
        "[model_providers.vendor]",
        'base_url = "https://example.invalid/api"',
        'experimental_bearer_token = "fixture-token"',
    ]
)
SELF_TEST_CONFIG_MISSING_TOKEN = "\n".join(
    [
        'model_provider = "vendor"',
        "",
        "[model_providers.vendor]",
        'base_url = "https://example.invalid/api"',
    ]
)
SELF_TEST_PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/"
    "ScL4WQAAAABJRU5ErkJggg=="
)


class SkillError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        response_headers: Optional[Any] = None,
        network_request_performed: bool = False,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.response_headers = response_headers
        self.network_request_performed = network_request_performed


def fail(code: str, message: str, *, retryable: bool = False) -> None:
    raise SkillError(code, message, retryable=retryable)


def safe_text(value: Any, limit: int = 600) -> str:
    text = str(value or "")
    for secret in SENSITIVE_VALUES:
        text = text.replace(secret, "<redacted>")
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
    text = re.sub(r"\bsk-[A-Za-z0-9_-]+", "<redacted>", text)
    return text if len(text) <= limit else text[:limit] + "…"


def emit_json(value: Dict[str, Any]) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2))


class SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        raise SkillError("E_RUNTIME", message)


def validate_size(size: str) -> str:
    if size == "auto":
        return size
    match = re.fullmatch(r"([1-9][0-9]*)x([1-9][0-9]*)", size)
    if not match:
        fail("E_RUNTIME", "Size must be auto or WIDTHxHEIGHT in integer pixels.")
    width, height = int(match.group(1)), int(match.group(2))
    if width % 16 or height % 16:
        fail("E_RUNTIME", "Image width and height must both be multiples of 16.")
    if width > 3840 or height > 3840:
        fail("E_RUNTIME", "Neither image edge may exceed 3840 pixels; 4096 is unsupported.")
    if max(width, height) > 3 * min(width, height):
        fail("E_RUNTIME", "Image aspect ratio must be between 1:3 and 3:1.")
    pixels = width * height
    if pixels < 655_360 or pixels > 8_294_400:
        fail("E_RUNTIME", "Image pixel count must be between 655360 and 8294400.")
    return size


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


        operation.add_argument("--size", type=validate_size, default="auto")
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
                and key in {"base_url", "experimental_bearer_token", "api_key"}
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
    token = provider_section.get("experimental_bearer_token") or provider_section.get("api_key")
    token_key = "experimental_bearer_token" if provider_section.get("experimental_bearer_token") else "api_key"
    if not base_url:
        fail("E_CONFIG_KEY", f"Missing base_url in [{section_name}].")
    if not token:
        fail("E_CONFIG_KEY", f"Missing experimental_bearer_token or api_key in [{section_name}].")
    if not re.match(r"^https?://", base_url, flags=re.IGNORECASE):
        fail("E_CONFIG_PARSE", f"base_url in [{section_name}] must use http or https.")
    try:
        parsed_url = urllib.parse.urlsplit(base_url)
    except ValueError:
        fail("E_CONFIG_PARSE", "base_url is not a valid URL.")
    if not parsed_url.hostname or parsed_url.username or parsed_url.password or parsed_url.query or parsed_url.fragment:
        fail("E_CONFIG_PARSE", "base_url must have a host and no credentials, query, or fragment.")
    return {
        "provider": provider,
        "token_key": token_key,
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
    config = parse_config_text(text)
    SENSITIVE_VALUES.add(config["token"])
    return {"config_path": str(config_path), **config}


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
    SENSITIVE_VALUES.add(text)
    return {
        "prompt_file": str(prompt_path),
        **validate_prompt_text(text, mode),
    }


def build_endpoint(base_url: str) -> str:
    trimmed = base_url.rstrip("/")
    if trimmed.lower().endswith("/v1"):
        return trimmed + "/images/generations"
    return trimmed + ENDPOINT_PATH


def build_payload(prompt_text: str, mode: str, size: str) -> Dict[str, Any]:
    if mode != "generate":
        fail("E_EDIT_UNSUPPORTED", "The configured Images API only documents generation. Use a callable built-in image editor or provide an edit API contract.")
    payload = {"model": MODEL_4K if "4k" in prompt_text.lower() else MODEL, "prompt": prompt_text}
    if size != "auto":
        payload["size"] = size
    return payload


def request_summary(payload: Dict[str, Any], mode: str) -> Dict[str, Any]:
    return {
        "model": payload["model"],
        "size": payload.get("size"),
        "endpoint_path": ENDPOINT_PATH,
        "mode": mode,
        "response_format": "json",
        "prompt_sha256": hashlib.sha256(payload["prompt"].encode("utf-8")).hexdigest(),
    }


def parse_image_response(text: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = json.loads(text)
    except (ValueError, UnicodeError):
        fail("E_RESPONSE_JSON", "Provider returned invalid or truncated JSON.", retryable=True)
    if not isinstance(response, dict):
        fail("E_RESPONSE_JSON", "Provider response must be a JSON object.")
    if response.get("error"):
        fail("E_HTTP", "Provider returned an error in the JSON response.")
    images = response.get("data")
    if not isinstance(images, list) or len(images) != 1 or not isinstance(images[0], dict) or not isinstance(images[0].get("b64_json"), str) or not images[0]["b64_json"]:
        fail("E_IMAGE_DATA", "Expected exactly one image in data[0].b64_json.")
    dimensions = verify_png_bytes(decode_base64_strict(images[0]["b64_json"]))
    metadata = {key: safe_text(response[key], 100) for key in ("model", "quality", "size", "background", "output_format") if isinstance(response.get(key), str)}
    warnings = []
    if metadata.get("model") and metadata["model"] != payload["model"]:
        warnings.append(f'Provider reported model={metadata["model"]}; requested {payload["model"]}.')
    actual_size = f'{dimensions["width"]}x{dimensions["height"]}'
    if payload.get("size") and payload["size"] != actual_size:
        warnings.append(f'Actual PNG size is {actual_size}; requested {payload["size"]}.')
    if metadata.get("size") and metadata["size"] != actual_size:
        warnings.append("Provider size metadata disagrees with PNG dimensions; PNG dimensions are used.")
    for key in ("width", "height", "bytes"):
        if key in images[0] and images[0][key] != dimensions[key]:
            warnings.append(f"Provider image {key} metadata disagrees with PNG bytes.")
    return {"image_base64": images[0]["b64_json"], "source": "data[0].b64_json", "metadata": metadata, "warnings": warnings}

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


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        return None

def request_once(config: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
    endpoint = build_endpoint(config["base_url"])
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {config['token']}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Connection": "keep-alive",
        },
    )
    try:
        opener = urllib.request.build_opener(NoRedirectHandler())
        with opener.open(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            result = response.read().decode("utf-8")
            return parse_image_response(result, payload)
    except urllib.error.HTTPError as error:


        if error.code in (401, 403):
            raise SkillError(
                "E_AUTH",
                f"Provider authentication failed with HTTP {error.code}.",
                network_request_performed=True,
            )
        if error.code == 429:
            raise SkillError(
                "E_RATE_LIMIT",
                f"Provider rate limit returned HTTP 429.",
                retryable=True,
                response_headers=error.headers,
                network_request_performed=True,
            )
        if error.code == 408 or error.code >= 500:
            raise SkillError(
                "E_HTTP",
                f"Provider returned HTTP {error.code}.",
                retryable=True,
                response_headers=error.headers,
                network_request_performed=True,
            )


        raise SkillError(
            "E_HTTP",
            f"Provider returned HTTP {error.code}.",
            network_request_performed=True,
        )
    except SkillError as error:
        error.network_request_performed = True
        raise
    except UnicodeError:
        raise SkillError("E_RESPONSE_JSON", "Provider response is not UTF-8 JSON.", network_request_performed=True)
    except http.client.IncompleteRead:
        raise SkillError("E_RESPONSE_JSON", "Provider returned a truncated JSON body.", retryable=True, network_request_performed=True)
    except (urllib.error.URLError, TimeoutError, OSError) as error:
        message, retryable = classify_request_failure(error)
        raise SkillError(
            "E_HTTP",
            message,
            retryable=retryable,
            network_request_performed=True,
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
            "api_key_present": True,
            "credential_field": config["token_key"],
        },
        "dependencies": {
            "external_packages": [],
            "standard_library_http": True,
            "strict_utf8_decoder": True,
        },
        "model": MODEL,
        "model_selection": {"default": MODEL, "contains_4k": MODEL_4K, "case_sensitive": False},
        "endpoint_path": ENDPOINT_PATH,
        "supported_api_modes": ["generate"],

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
    if mode == "edit":
        fail("E_EDIT_UNSUPPORTED", "The configured Images API only documents generation. Use a callable built-in image editor or provide an edit API contract.")
    prompt = read_prompt(args.prompt_file, mode)
    config = read_config()
    payload = build_payload(prompt["text"], mode, args.size)

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
            "model": payload["model"],
            "requested_size": payload.get("size"),
            "prompt_file": prompt["prompt_file"],
            "prompt_characters": prompt["characters"],
            "output_path": str(output_path),
            "request_summary": summary,

            "network_request_performed": False,
            "warnings": [],

        }

    response = request_image(config, payload)
    image_data = decode_base64_strict(response["image_base64"])
    verify_png_bytes(image_data)
    written = write_png(output_path, image_data, args.force)
    return {
        "status": "ok",
        "command": mode,
        "runtime": "python",
        "model": payload["model"],
        "requested_size": payload.get("size"),
        "provider_metadata": response["metadata"],
        "output_path": str(output_path),
        "width": written["width"],
        "height": written["height"],
        "prompt_characters": prompt["characters"],
        "result_source": response["source"],

        "attempts": response["attempts"],
        "network_request_performed": True,
        "warnings": response["warnings"],

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


def assert_test(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def run_self_test() -> Dict[str, Any]:
    tests: List[str] = []

    config = parse_config_text(SELF_TEST_CONFIG)
    assert_test(config["provider"] == "vendor", "provider mismatch")
    assert_test(config["base_url"] == "https://example.invalid/api", "base URL mismatch")
    assert_test(config["token"] == "fixture-token", "token mismatch")
    tests.append("config-valid")

    code = None
    try:
        parse_config_text(SELF_TEST_CONFIG_MISSING_TOKEN)
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

    png_base64 = SELF_TEST_PNG_BASE64
    png_result = verify_png_bytes(decode_base64_strict(png_base64))
    assert_test(png_result["width"] == 1 and png_result["height"] == 1, "PNG mismatch")
    tests.append("png-validation")

    for base in ("https://example.invalid", "https://example.invalid/", "https://example.invalid/v1", "https://example.invalid/v1/"):
        assert_test(build_endpoint(base) == "https://example.invalid/v1/images/generations", "endpoint mismatch")
    assert_test(build_endpoint("https://example.invalid/api/v1") == "https://example.invalid/api/v1/images/generations", "prefix lost")
    tests.append("endpoint-normalization")

    config = parse_config_text(SELF_TEST_CONFIG.replace("experimental_bearer_token", "api_key"))
    assert_test(config["token"] == "fixture-token" and config["token_key"] == "api_key", "api_key mismatch")
    tests.append("config-api-key")

    payload = build_payload(sample_prompt, "generate", "1536x1024")
    assert_test(payload == {"model": "gpt-image-2-2k", "prompt": sample_prompt, "size": "1536x1024"}, "request mismatch")
    assert_test("quality" not in payload, "quality must be omitted")
    assert_test("size" not in build_payload(sample_prompt, "generate", "auto"), "auto must omit size")
    tests.append("request-shape")

    for prompt in ("生成一张 4k 图片", "生成一张 4K 图片", "prefix4Ksuffix"):
        routed = build_payload(prompt, "generate", "auto")
        assert_test(routed["model"] == "gpt-image-2-4k", "4k model routing mismatch")
        assert_test(routed["prompt"] == prompt, "routing must preserve the Prompt")
        assert_test(request_summary(routed, "generate")["model"] == routed["model"], "model summary mismatch")
    assert_test(build_payload("生成一张 2K 图片", "generate", "auto")["model"] == "gpt-image-2-2k", "default model routing mismatch")
    tests.append("model-routing-4k")

    parser = build_parser()
    for size in ("auto", "1024x1024", "1536x1024", "1152x2048", "944x1680", "2048x2048", "3840x2160", "2160x3840", "2880x2880"):
        parsed = parser.parse_args(["generate", "--prompt-file", "prompt.txt", "--size", size])
        assert_test(parsed.size == size, "valid size rejected")
    for size in ("941x1672", "4096x4096", "3840x3840", "512x512", "3072x768", "0x1024", "1024", "1024X1024"):
        code = None
        try:
            parser.parse_args(["generate", "--prompt-file", "prompt.txt", "--size", size])
        except SkillError as error:
            code = error.code
        assert_test(code == "E_RUNTIME", f"invalid size accepted: {size}")
    tests.append("image-size-constraints")

    response = parse_image_response(json.dumps({"data": [{"b64_json": png_base64, "width": 1, "height": 1}], "size": "999x999", "quality": "low"}), payload)
    assert_test(response["source"] == "data[0].b64_json", "result source mismatch")
    assert_test(len(response["warnings"]) == 2, "size mismatches must be reported without a quality warning")
    tests.append("json-image-response")

    for text, expected_code in (("{", "E_RESPONSE_JSON"), ("null", "E_RESPONSE_JSON"), ('{"error":{"message":"refused"}}', "E_HTTP"), ('{"data":[]}', "E_IMAGE_DATA"), ('{"data":[{"b64_json":"invalid!"}]}', "E_IMAGE_DATA")):
        actual_code = None
        try:
            parse_image_response(text, payload)
        except SkillError as error:
            actual_code = error.code
        assert_test(actual_code == expected_code, f"expected {expected_code}, received {actual_code}")
    tests.append("json-response-errors")

    unsupported_code = None
    try:
        build_payload(sample_prompt, "edit", "auto")
    except SkillError as error:
        unsupported_code = error.code
    assert_test(unsupported_code == "E_EDIT_UNSUPPORTED", "edit must fail locally")
    unsupported_code = None
    try:
        build_parser().parse_args(["generate", "--prompt-file", "prompt.txt", "--reasoning-effort", "high"])
    except SkillError as error:
        unsupported_code = error.code
    assert_test(unsupported_code == "E_RUNTIME", "reasoning must fail locally")
    tests.append("unsupported-api-options")



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
                "network_request_performed": error.network_request_performed,
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
