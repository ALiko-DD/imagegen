#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { Blob } from "node:buffer";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const MODEL = "gpt-image-2-2k";
const MODEL_4K = "gpt-image-2-4k";
const ENDPOINT_PATH = "/v1/images/generations";
const EDIT_ENDPOINT_PATH = "/v1/images/edits";
const MAX_INPUT_IMAGES = 16;
const MAX_INPUT_BYTES = 50 * 1024 * 1024;
const MAX_PROMPT_CHARACTERS = 20_000;
const RECOMMENDED_PROMPT_CHARACTERS = Object.freeze({ min: 200, max: 4_000 });
const REQUEST_TIMEOUT_MS = 600_000;
const SENSITIVE_VALUES = new Set();
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SELF_TEST_CONFIG = [
  'model_provider = "vendor"',
  "",
  "[model_providers.vendor]",
  'base_url = "https://example.invalid/api"',
  'experimental_bearer_token = "fixture-token"',
].join("\n");
const SELF_TEST_CONFIG_MISSING_TOKEN = [
  'model_provider = "vendor"',
  "",
  "[model_providers.vendor]",
  'base_url = "https://example.invalid/api"',
].join("\n");
const SELF_TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL4WQAAAABJRU5ErkJggg==";

class SkillError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = "SkillError";
    this.code = code;
    this.retryable = Boolean(options.retryable);
    this.networkRequestPerformed = Boolean(options.networkRequestPerformed);
    this.details = options.details ?? null;
  }
}

function throwSkill(code, message, options) {
  throw new SkillError(code, message, options);
}

function safeText(value, limit = 600) {
  let sanitized = String(value ?? "");
  for (const secret of SENSITIVE_VALUES) {
    sanitized = sanitized.split(secret).join("<redacted>");
  }
  const text = sanitized
    .replace(/Authorization\s*:\s*Bearer\s+\S+/gi, "Authorization: Bearer <redacted>")
    .replace(/(experimental_bearer_token|token|secret|password|api[_-]?key)\s*[:=]\s*["']?[^"'\s,}]+/gi, "$1=<redacted>")
    .replace(/Bearer\s+\S+/gi, "Bearer <redacted>")
    .replace(/\bsk-[A-Za-z0-9_-]+/g, "<redacted>");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function emitJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function runtimeName() {
  return "node";
}

function validateSize(size) {
  if (size === "auto") {
    return size;
  }
  const match = /^([1-9][0-9]*)x([1-9][0-9]*)$/.exec(size);
  if (!match) {
    throwSkill("E_RUNTIME", "Size must be auto or WIDTHxHEIGHT in integer pixels.");
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width % 16 !== 0 || height % 16 !== 0) {
    throwSkill("E_RUNTIME", "Image width and height must both be multiples of 16.");
  }
  if (width > 3840 || height > 3840) {
    throwSkill("E_RUNTIME", "Neither image edge may exceed 3840 pixels; 4096 is unsupported.");
  }
  if (Math.max(width, height) > 3 * Math.min(width, height)) {
    throwSkill("E_RUNTIME", "Image aspect ratio must be between 1:3 and 3:1.");
  }
  const pixels = width * height;
  if (pixels < 655_360 || pixels > 8_294_400) {
    throwSkill("E_RUNTIME", "Image pixel count must be between 655360 and 8294400.");
  }
  return size;
}

function parseArgs(argv) {
  const command = argv[0];
  const allowedCommands = new Set([
    "preflight",
    "prompt-check",
    "generate",
    "edit",
    "verify",
    "self-test",
  ]);
  if (!allowedCommands.has(command)) {
    throwSkill(
      "E_RUNTIME",
      "Use one of: preflight, prompt-check, generate, edit, verify, self-test.",
    );
  }

  const options = {
    command,
    images: [],
    force: false,
    dryRun: false,
    size: null,
    mode: command === "edit" ? "edit" : "generate",
  };
  const valueOptions = new Map([
    ["--prompt-file", "promptFile"],
    ["--mode", "mode"],
    ["--size", "size"],
    ["--model", "model"],
    ["--out", "out"],
    ["--out-dir", "outDir"],
    ["--image", "images"],
    ["--file", "file"],
  ]);

  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--reasoning-effort") {
      throwSkill("E_RUNTIME", "--reasoning-effort is not supported by the Images API. Remove this option.");
    }
    if (token === "--force") {
      options.force = true;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    const key = valueOptions.get(token);
    if (!key) {
      throwSkill("E_RUNTIME", `Unknown argument: ${token}`);
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throwSkill("E_RUNTIME", `Missing value for ${token}.`);
    }
    index += 1;
    if (key === "images") {
      options.images.push(value);
    } else {
      options[key] = value;
    }
  }

  if (options.size !== null) {
    validateSize(options.size);
  }
  if (options.model !== undefined && ![MODEL, MODEL_4K].includes(options.model)) {
    throwSkill("E_RUNTIME", "--model must be gpt-image-2-2k or gpt-image-2-4k.");
  }


  if (!new Set(["generate", "edit"]).has(options.mode)) {
    throwSkill("E_RUNTIME", "--mode must be generate or edit.");
  }


  if (options.out && options.outDir) {
    throwSkill("E_WRITE", "Use --out or --out-dir, not both.");
  }
  if (command === "generate" && options.images.length) {
    throwSkill("E_EDIT_INPUT", "Use edit with --image for reference images; generate accepts text only.");
  }
  return options;
}

function stripTomlComment(line) {
  let quote = null;
  let escaped = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quote === '"') {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        quote = null;
      }
      continue;
    }
    if (quote === "'") {
      if (character === "'") {
        quote = null;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "#") {
      return line.slice(0, index);
    }
  }
  return line;
}

function parseTomlScalar(raw, lineNumber, key) {
  const value = raw.trim();
  if (value.startsWith('"""') || value.startsWith("'''")) {
    throwSkill(
      "E_CONFIG_PARSE",
      `Multiline TOML values are not supported for ${key} at line ${lineNumber}.`,
    );
  }
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "string") {
        throw new Error("not a string");
      }
      return parsed;
    } catch {
      throwSkill("E_CONFIG_PARSE", `Invalid quoted value for ${key} at line ${lineNumber}.`);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throwSkill("E_CONFIG_PARSE", `Invalid quoted value for ${key} at line ${lineNumber}.`);
    }
    return value.slice(1, -1);
  }
  if (/^[A-Za-z0-9_.:/+-]+$/.test(value)) {
    return value;
  }
  throwSkill("E_CONFIG_PARSE", `Unsupported value for ${key} at line ${lineNumber}.`);
}

function parseConfigText(text) {
  const topLevel = {};
  const sections = new Map();
  let currentSection = "";
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = stripTomlComment(lines[index]).trim();
    if (!line) {
      continue;
    }
    const sectionMatch = line.match(/^\[(.+)]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!sections.has(currentSection)) {
        sections.set(currentSection, {});
      }
      continue;
    }
    const assignment = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    if (!assignment) {
      continue;
    }
    const key = assignment[1];
    const relevant =
      (!currentSection && key === "model_provider") ||
      (currentSection.startsWith("model_providers.") &&
        new Set(["base_url", "experimental_bearer_token", "api_key"]).has(key));
    if (!relevant) {
      continue;
    }
    const parsedValue = parseTomlScalar(assignment[2], lineNumber, key);
    if (currentSection) {
      sections.get(currentSection)[key] = parsedValue;
    } else {
      topLevel[key] = parsedValue;
    }
  }

  const provider = topLevel.model_provider;
  if (!provider) {
    throwSkill("E_CONFIG_KEY", 'Missing top-level "model_provider" in config.toml.');
  }
  const providerSectionName = `model_providers.${provider}`;
  const providerSection = sections.get(providerSectionName);
  if (!providerSection) {
    throwSkill("E_CONFIG_KEY", `Missing [${providerSectionName}] in config.toml.`);
  }
  const baseUrl = providerSection.base_url;
  const token = providerSection.experimental_bearer_token || providerSection.api_key;
  const tokenKey = providerSection.experimental_bearer_token ? "experimental_bearer_token" : "api_key";
  if (!baseUrl) {
    throwSkill("E_CONFIG_KEY", `Missing base_url in [${providerSectionName}].`);
  }
  if (!token) {
    throwSkill("E_CONFIG_KEY", `Missing experimental_bearer_token or api_key in [${providerSectionName}].`);
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throwSkill("E_CONFIG_PARSE", `base_url in [${providerSectionName}] is not a valid URL.`);
  }
  if (!new Set(["http:", "https:"]).has(parsedUrl.protocol)) {
    throwSkill("E_CONFIG_PARSE", "base_url must use http or https.");
  }
  if (!parsedUrl.hostname || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throwSkill("E_CONFIG_PARSE", "base_url must have a host and no credentials, query, or fragment.");
  }
  return {
    provider,
    tokenKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    token,
  };
}

async function readConfig() {
  const configPath = path.join(os.homedir(), ".codex", "config.toml");
  let text;
  try {
    text = await fsp.readFile(configPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throwSkill("E_CONFIG_MISSING", `Config file not found: ${configPath}`);
    }
    throwSkill("E_CONFIG_PARSE", `Could not read config file: ${safeText(error.message)}`);
  }
  const config = parseConfigText(text);
  SENSITIVE_VALUES.add(config.token);
  return { configPath, ...config };
}

function countUnicodeCharacters(text) {
  return [...text].length;
}

function findUnresolvedPlaceholder(text) {
  const patterns = [
    /\b(?:TBD|TODO|PLACEHOLDER|UNKNOWN)\b/i,
    /(?:待补充|待确认|未提供|请填写|请替换|占位符)/,
    /\{\{[^}\n]+}}/,
    /\{argument\b/i,
    /<[^>\n]{1,100}>/,
    /\[[^\]\n]*(?:待|填|未提供|placeholder|missing|exact text|insert|TBD|TODO)[^\]\n]*]/i,
  ];
  return patterns.find((pattern) => pattern.test(text)) ?? null;
}

function findEncodingCorruption(text) {
  const patterns = [/\uFFFD/, /锟斤拷/, /鈥[?？]/, /(?:闁|鐨|鍏|鏂|浠|绀|鍥|锛|銆){4,}/];
  return patterns.find((pattern) => pattern.test(text)) ?? null;
}

function detectPromptFormat(text) {
  const first = text[0];
  if (first === "{" || first === "[") {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throwSkill("E_PROMPT_STRUCTURE", `Prompt looks like JSON but is invalid: ${safeText(error.message)}`);
    }
    if (parsed === null || typeof parsed !== "object") {
      throwSkill("E_PROMPT_STRUCTURE", "A JSON Prompt must be a top-level object or array.");
    }
    return "json";
  }
  if (/^#{1,6}\s+\S/m.test(text)) {
    return "markdown";
  }
  return "prose";
}

function validatePromptText(text, mode = "generate") {
  if (text.charCodeAt(0) === 0xfeff) {
    throwSkill("E_PROMPT_ENCODING", "Prompt must be UTF-8 without BOM.");
  }
  const trimmed = text.trim();
  const characters = countUnicodeCharacters(trimmed);
  if (characters === 0 || characters > MAX_PROMPT_CHARACTERS) {
    throwSkill(
      "E_PROMPT_LENGTH",
      characters === 0
        ? "Prompt is empty."
        : `Prompt has ${characters} Unicode characters; maximum supported length is ${MAX_PROMPT_CHARACTERS}.`,
    );
  }
  if (findEncodingCorruption(trimmed)) {
    throwSkill("E_PROMPT_ENCODING", "Prompt appears to contain corrupted or mojibake text.");
  }
  if (findUnresolvedPlaceholder(trimmed)) {
    throwSkill(
      "E_PROMPT_STRUCTURE",
      "Prompt contains an unresolved placeholder or missing-value marker. Ask for the smallest required field instead of generating.",
    );
  }
  const format = detectPromptFormat(trimmed);
  const lengthAdvisory =
    characters < RECOMMENDED_PROMPT_CHARACTERS.min
      ? "short"
      : characters > RECOMMENDED_PROMPT_CHARACTERS.max
        ? "long"
        : "within_recommended_range";
  return {
    text,
    characters,
    mode,
    format,
    lengthAdvisory,
    semanticReviewRequired: true,
  };
}

async function readPrompt(promptFile, mode) {
  if (!promptFile) {
    throwSkill("E_PROMPT_STRUCTURE", "Missing --prompt-file.");
  }
  let bytes;
  try {
    bytes = await fsp.readFile(promptFile);
  } catch (error) {
    throwSkill("E_PROMPT_ENCODING", `Could not read Prompt file: ${safeText(error.message)}`);
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    throwSkill("E_PROMPT_ENCODING", "Prompt must be UTF-8 without BOM.");
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throwSkill("E_PROMPT_ENCODING", "Prompt contains invalid UTF-8 bytes.");
  }
  SENSITIVE_VALUES.add(text);
  return {
    promptFile: path.resolve(promptFile),
    ...validatePromptText(text, mode),
  };
}

function endpointPath(mode) {
  return mode === "edit" ? EDIT_ENDPOINT_PATH : ENDPOINT_PATH;
}

function buildEndpoint(baseUrl, mode = "generate") {
  const trimmed = baseUrl.replace(/\/+$/, "");
  const suffix = endpointPath(mode);
  return /\/v1$/i.test(trimmed)
    ? `${trimmed}${suffix.slice(3)}`
    : `${trimmed}${suffix}`;
}

function buildPayload(promptText, mode, size, model = null) {
  return {
    model: model ?? (/4k/i.test(promptText) ? MODEL_4K : MODEL),
    prompt: promptText,
    ...(size !== "auto" ? { size } : {}),
  };
}

async function resolveSettings(options, promptText, images) {
  let record = null;
  let sourceRecord = null;
  if (options.command === "edit" && !(options.model && options.size !== null)) {
    const candidate = `${images[0].path}.imagegen.json`;
    let text;
    try {
      text = await fsp.readFile(candidate, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throwSkill("E_EDIT_SETTINGS", "Could not read the base image job record. Specify both --model and --size to override inheritance.");
      }
    }
    if (text !== undefined) {
      try {
        record = JSON.parse(text);
        const dimensions = verifyPngBytes(images[0].bytes);
        if (record?.version !== 1 || ![MODEL, MODEL_4K].includes(record.model)
          || record.image_sha256 !== crypto.createHash("sha256").update(images[0].bytes).digest("hex")
          || record.width !== dimensions.width || record.height !== dimensions.height
          || (record.requested_size !== null && typeof record.requested_size !== "string")) {
          throw new Error("Invalid record");
        }
        if (record.requested_size === "auto") {
          throw new Error("Invalid requested size");
        }
        if (record.requested_size !== null) {
          validateSize(record.requested_size);
        }
        sourceRecord = candidate;
      } catch {
        throwSkill("E_EDIT_SETTINGS", "Base image job record is invalid or does not match the image. Specify both --model and --size to override inheritance.");
      }
    }
  }
  const prompt4k = /4k/i.test(promptText);
  const model = options.model ?? (prompt4k ? MODEL_4K : record?.model ?? MODEL);
  const modelSource = options.model ? "explicit" : prompt4k ? "prompt_4k" : record ? "base_record" : "default";
  let size = options.size ?? (record ? record.requested_size ?? `${record.width}x${record.height}` : "auto");
  try {
    size = validateSize(size);
  } catch (error) {
    if (options.size === null && record) {
      throwSkill("E_EDIT_SETTINGS", "Inherited image dimensions are unsupported. Specify --size explicitly; dimensions will not be silently reduced.");
    }
    throw error;
  }
  return {
    model, size,
    selection: { model_source: modelSource, size_source: options.size !== null ? "explicit" : record ? "base_record" : "default", source_record: sourceRecord },
    warnings: options.command === "edit" && modelSource === "default"
      ? ["No base image model record was found. Defaulting to 2K; use --model to preserve a model known from earlier context. Image dimensions do not identify the original model."] : [],
  };
}

async function writeJobRecord(outputPath, payload, imageBytes, dimensions, force) {
  const recordPath = `${outputPath}.imagegen.json`;
  const record = {
    version: 1, model: payload.model, requested_size: payload.size ?? null,
    width: dimensions.width, height: dimensions.height,
    image_sha256: crypto.createHash("sha256").update(imageBytes).digest("hex"),
  };
  try {
    await fsp.writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, { flag: force ? "w" : "wx" });
  } catch (error) {
    throwSkill("E_WRITE", `PNG saved, but its job record could not be written: ${safeText(error.message)}`, { networkRequestPerformed: true });
  }
  return recordPath;
}

function detectImageMime(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  throwSkill("E_EDIT_INPUT", "Reference images must contain PNG, JPEG, or WebP data.");
}

async function loadInputImages(imagePaths) {
  if (!imagePaths.length || imagePaths.length > MAX_INPUT_IMAGES) {
    throwSkill("E_EDIT_INPUT", "The edit command requires 1–16 --image files.");
  }
  const images = [];
  for (const imagePath of imagePaths) {
    const resolved = path.resolve(imagePath);
    let bytes;
    try {
      const stat = await fsp.stat(resolved);
      if (!stat.isFile() || stat.size > MAX_INPUT_BYTES) {
        throwSkill("E_EDIT_INPUT", "Each reference image must be a file no larger than 50 MiB.");
      }
      bytes = await fsp.readFile(resolved);
    } catch (error) {
      if (error instanceof SkillError) {
        throw error;
      }
      throwSkill("E_EDIT_INPUT", `Could not read reference image: ${safeText(error.message)}`);
    }
    if (bytes.length > MAX_INPUT_BYTES) {
      throwSkill("E_EDIT_INPUT", "Each reference image must be no larger than 50 MiB.");
    }
    images.push({ path: resolved, filename: path.basename(resolved), mime: detectImageMime(bytes), bytes });
  }
  return images;
}

function buildMultipart(payload, images) {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    form.append(key, value);
  }
  for (const image of images) {
    form.append("image[]", new Blob([image.bytes], { type: image.mime }), image.filename);
  }
  return form;
}

function editWarnings(payload, mode) {
  return mode === "edit" && payload.model !== MODEL
    ? ["The user verified editing with gpt-image-2-2k only; 4K editing has not been live-verified."]
    : [];
}

function requestSummary(payload, mode, images = []) {
  return {
    model: payload.model,
    size: payload.size ?? null,
    endpoint_path: endpointPath(mode),
    request_format: mode === "edit" ? "multipart/form-data" : "application/json",
    input_image_count: images.length,
    input_images: images.map((image) => ({ path: image.path, mime: image.mime, bytes: image.bytes.length })),
    mode,
    response_format: "json",
    prompt_sha256: crypto.createHash("sha256").update(payload.prompt, "utf8").digest("hex"),
  };
}

function parseImageResponse(text, payload) {
  let response;
  try {
    response = JSON.parse(text);
  } catch {
    throwSkill("E_RESPONSE_JSON", "Provider returned invalid or truncated JSON.", { retryable: true });
  }
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throwSkill("E_RESPONSE_JSON", "Provider response must be a JSON object.");
  }
  if (response.error) {
    throwSkill("E_HTTP", "Provider returned an error in the JSON response.");
  }
  const images = response.data;
  if (!Array.isArray(images) || images.length !== 1 || typeof images[0]?.b64_json !== "string" || !images[0].b64_json) {
    throwSkill("E_IMAGE_DATA", "Expected exactly one image in data[0].b64_json.");
  }
  const bytes = decodeBase64Strict(images[0].b64_json);
  const dimensions = verifyPngBytes(bytes);
  const metadata = {};
  for (const key of ["model", "quality", "size", "background", "output_format"]) {
    if (typeof response[key] === "string") {
      metadata[key] = safeText(response[key], 100);
    }
  }
  const warnings = [];
  if (metadata.model && metadata.model !== payload.model) {
    warnings.push(`Provider reported model=${metadata.model}; requested ${payload.model}.`);
  }
  const actualSize = `${dimensions.width}x${dimensions.height}`;
  if (payload.size && payload.size !== actualSize) {
    warnings.push(`Actual PNG size is ${actualSize}; requested ${payload.size}.`);
  }
  if (metadata.size && metadata.size !== actualSize) {
    warnings.push("Provider size metadata disagrees with PNG dimensions; PNG dimensions are used.");
  }
  for (const key of ["width", "height", "bytes"]) {
    if (images[0][key] !== undefined && images[0][key] !== dimensions[key]) {
      warnings.push(`Provider image ${key} metadata disagrees with PNG bytes.`);
    }
  }
  return { imageBase64: images[0].b64_json, source: "data[0].b64_json", metadata, warnings };
}

function decodeBase64Strict(value) {
  if (typeof value !== "string") {
    throwSkill("E_IMAGE_DATA", "Image data is not a Base64 string.");
  }
  const compact = value.replace(/\s+/g, "");
  if (!compact || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact) || compact.length % 4 === 1) {
    throwSkill("E_IMAGE_DATA", "Image data is not valid Base64.");
  }
  let bytes;
  try {
    bytes = Buffer.from(compact, "base64");
  } catch {
    throwSkill("E_IMAGE_DATA", "Image data could not be decoded.");
  }
  if (!bytes.length) {
    throwSkill("E_IMAGE_DATA", "Decoded image data is empty.");
  }
  const canonicalInput = compact.replace(/=+$/, "");
  const canonicalOutput = bytes.toString("base64").replace(/=+$/, "");
  if (canonicalInput !== canonicalOutput) {
    throwSkill("E_IMAGE_DATA", "Image data failed strict Base64 validation.");
  }
  return bytes;
}

function verifyPngBytes(bytes) {
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throwSkill("E_PNG", "Decoded bytes do not have a valid PNG signature.");
  }
  const ihdrLength = bytes.readUInt32BE(8);
  const chunkType = bytes.toString("ascii", 12, 16);
  if (ihdrLength !== 13 || chunkType !== "IHDR") {
    throwSkill("E_PNG", "PNG does not begin with a valid IHDR chunk.");
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 1 || height < 1) {
    throwSkill("E_PNG", "PNG dimensions must be positive.");
  }
  return {
    width,
    height,
    bytes: bytes.length,
  };
}

async function verifyPngFile(filePath) {
  let bytes;
  try {
    bytes = await fsp.readFile(filePath);
  } catch (error) {
    throwSkill("E_PNG", `Could not read PNG file: ${safeText(error.message)}`);
  }
  return verifyPngBytes(bytes);
}

function defaultOutputName() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  return `imagegen-${timestamp}-${crypto.randomBytes(3).toString("hex")}.png`;
}

function resolveOutputPath(options) {
  if (options.out) {
    const outputPath = path.resolve(options.out);
    if (path.extname(outputPath).toLowerCase() !== ".png") {
      throwSkill("E_WRITE", "--out must use a .png extension.");
    }
    return outputPath;
  }
  const outputDir = path.resolve(options.outDir ?? path.join(process.cwd(), "outputs"));
  return path.join(outputDir, defaultOutputName());
}

async function ensureWritableDirectory(directory) {
  try {
    await fsp.mkdir(directory, { recursive: true });
    const probe = path.join(directory, `.imagegen-write-${process.pid}-${crypto.randomBytes(3).toString("hex")}`);
    await fsp.writeFile(probe, Buffer.alloc(0), { flag: "wx" });
    await fsp.unlink(probe);
  } catch (error) {
    throwSkill("E_WRITE", `Output directory is not writable: ${safeText(error.message)}`);
  }
}

async function writePng(outputPath, bytes, force) {
  const directory = path.dirname(outputPath);
  await ensureWritableDirectory(directory);
  if (!force && fs.existsSync(outputPath)) {
    throwSkill("E_WRITE", `Output file already exists: ${outputPath}`);
  }
  const temporary = path.join(
    directory,
    `.${path.basename(outputPath)}.${process.pid}.${crypto.randomBytes(3).toString("hex")}.tmp`,
  );
  try {
    await fsp.writeFile(temporary, bytes, { flag: "wx" });
    if (force && fs.existsSync(outputPath)) {
      await fsp.unlink(outputPath);
    }
    await fsp.rename(temporary, outputPath);
  } catch (error) {
    try {
      await fsp.unlink(temporary);
    } catch {
      // Ignore cleanup failures after reporting the original write failure.
    }
    throwSkill("E_WRITE", `Could not write PNG: ${safeText(error.message)}`);
  }
  return verifyPngFile(outputPath);
}

function commandExists(command) {
  const probe = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(probe, [command], { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.split(/\r?\n/).find(Boolean) ?? null;
}

function commandVersion(command) {
  const location = commandExists(command);
  if (!location) {
    return null;
  }
  let args = ["--version"];
  if (command === "powershell" || command === "pwsh") {
    args = ["-NoLogo", "-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"];
  } else if (command === "cmd") {
    args = ["/d", "/c", "ver"];
  }
  const result = spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
    timeout: 5000,
  });
  const value = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().split(/\r?\n/)[0];
  return {
    command,
    location,
    version: value || "available",
  };
}

function detectEnvironment() {
  const shellNames =
    process.platform === "win32" ? ["powershell", "pwsh", "cmd", "bash"] : ["sh", "bash", "zsh"];
  const pythonNames = process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];
  return {
    os: process.platform,
    architecture: process.arch,
    active_shell: process.env.ComSpec ?? process.env.SHELL ?? null,
    shells: shellNames.map((name) => commandVersion(name)).filter(Boolean),
    node: {
      executable: process.execPath,
      version: process.version,
      supported: Number(process.versions.node.split(".")[0]) >= 18,
    },
    python: pythonNames.map((name) => commandVersion(name)).filter(Boolean),
  };
}

function retryDelayMs(response, attempt) {
  const retryAfter = response?.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
      return Math.min(10_000, Math.max(0, seconds * 1000));
    }
  }
  return Math.min(10_000, 1000 * 2 ** attempt);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function classifyRequestFailure(error) {
  const timedOut = error?.name === "AbortError";
  return {
    message: timedOut
      ? `Image request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`
      : `Image request failed: ${safeText(error.message)}`,
    retryable: !timedOut,
  };
}

async function requestOnce(config, payload, mode, images) {
  const headers = {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/json",
    Connection: "keep-alive",
  };
  const body = mode === "edit" ? buildMultipart(payload, images) : JSON.stringify(payload);
  if (mode !== "edit") {
    headers["Content-Type"] = "application/json";
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(buildEndpoint(config.baseUrl, mode), {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
      redirect: "manual",
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throwSkill("E_AUTH", `Provider authentication failed with HTTP ${response.status}.`, {
          networkRequestPerformed: true,
        });
      }
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      throwSkill(response.status === 429 ? "E_RATE_LIMIT" : "E_HTTP", `Provider returned HTTP ${response.status}.`, {
        retryable,
        networkRequestPerformed: true,
        details: { response },
      });
    }
    return parseImageResponse(await response.text(), payload);
  } catch (error) {
    if (error instanceof SkillError) {
      error.networkRequestPerformed = true;
      throw error;
    }
    const failure = classifyRequestFailure(error);
    throwSkill("E_HTTP", failure.message, {
      retryable: failure.retryable,
      networkRequestPerformed: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestImage(config, payload, mode, images) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return {
        ...(await requestOnce(config, payload, mode, images)),
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;
      if (!(error instanceof SkillError) || !error.retryable || attempt === 1) {
        break;
      }
      await wait(retryDelayMs(error.details?.response, attempt));
    }
  }
  throw lastError;
}

async function runPreflight(options) {
  const environment = detectEnvironment();
  if (!environment.node.supported) {
    throwSkill("E_RUNTIME", `Node.js 18 or newer is required; found ${process.version}.`);
  }
  const config = await readConfig();
  const outputDirectory = path.resolve(options.outDir ?? path.join(process.cwd(), "outputs"));
  await ensureWritableDirectory(outputDirectory);
  return {
    status: "ok",
    command: "preflight",
    runtime: runtimeName(),
    environment,
    config: {
      path: config.configPath,
      provider: config.provider,
      base_url_present: true,
      api_key_present: true,
      credential_field: config.tokenKey,
    },
    dependencies: {
      external_packages: [],
      built_in_fetch: typeof fetch === "function",
      multipart_form_data: typeof FormData === "function",
      text_decoder: typeof TextDecoder === "function",
    },
    model: MODEL,
    model_selection: { default: MODEL, contains_4k: MODEL_4K, case_sensitive: false, explicit_option: "--model", edit_inherits_base_record: true },
    endpoint_path: ENDPOINT_PATH,
    edit_endpoint_path: EDIT_ENDPOINT_PATH,
    supported_api_modes: ["generate", "edit"],

    output_directory: outputDirectory,
    network_request_performed: false,
    warnings: [],
  };
}

async function runPromptCheck(options) {
  const prompt = await readPrompt(options.promptFile, options.mode);
  return {
    status: "ok",
    command: "prompt-check",
    runtime: runtimeName(),
    mode: options.mode,
    prompt_file: prompt.promptFile,
    prompt_characters: prompt.characters,
    prompt_format: prompt.format,
    length_advisory: prompt.lengthAdvisory,
    recommended_character_range: RECOMMENDED_PROMPT_CHARACTERS,
    validation_scope: ["utf8", "mojibake_scan", "nonempty", "maximum_length", "format", "json_syntax", "placeholder_scan"],
    semantic_review_required: true,
    network_request_performed: false,
    warnings: [
      "Structural checks passed; confirm semantic completeness, exact user values, and unresolved decisions before generation.",
    ],
  };
}

async function runGenerateOrEdit(options) {
  const mode = options.command;
  const prompt = await readPrompt(options.promptFile, mode);
  const config = await readConfig();
  const images = mode === "edit" ? await loadInputImages(options.images) : [];
  const settings = await resolveSettings(options, prompt.text, images);
  const payload = buildPayload(prompt.text, mode, settings.size, settings.model);

  const summary = requestSummary(payload, mode, images);
  const outputPath = resolveOutputPath(options);
  await ensureWritableDirectory(path.dirname(outputPath));
  if (!options.force && (fs.existsSync(outputPath) || fs.existsSync(`${outputPath}.imagegen.json`))) {
    throwSkill("E_WRITE", `Output PNG or job record already exists: ${outputPath}`);
  }

  if (options.dryRun) {
    return {
      status: "ok",
      command: mode,
      runtime: runtimeName(),
      model: payload.model,
      requested_size: payload.size ?? null,
      settings_selection: settings.selection,
      prompt_file: prompt.promptFile,
      prompt_characters: prompt.characters,
      output_path: outputPath,
      request_summary: summary,

      network_request_performed: false,
      warnings: [...settings.warnings, ...editWarnings(payload, mode)],
    };
  }

  const response = await requestImage(config, payload, mode, images);
  const imageBytes = decodeBase64Strict(response.imageBase64);
  verifyPngBytes(imageBytes);
  const written = await writePng(outputPath, imageBytes, options.force);
  const jobRecord = await writeJobRecord(outputPath, payload, imageBytes, written, options.force);
  return {
    status: "ok",
    command: mode,
    runtime: runtimeName(),
    model: payload.model,
    requested_size: payload.size ?? null,
    settings_selection: settings.selection,
    job_record: jobRecord,
    provider_metadata: response.metadata,
    output_path: outputPath,
    width: written.width,
    height: written.height,
    prompt_characters: prompt.characters,
    result_source: response.source,
    input_image_count: images.length,
    endpoint_path: endpointPath(mode),

    attempts: response.attempts,
    network_request_performed: true,
    warnings: [...response.warnings, ...settings.warnings, ...editWarnings(payload, mode)],
  };
}

async function runVerify(options) {
  if (!options.file) {
    throwSkill("E_PNG", "The verify command requires --file.");
  }
  const resolved = path.resolve(options.file);
  const result = await verifyPngFile(resolved);
  return {
    status: "ok",
    command: "verify",
    runtime: runtimeName(),
    file: resolved,
    ...result,
    network_request_performed: false,
    warnings: [],
  };
}

function assertTest(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runSelfTest() {
  const tests = [];
  const record = async (name, operation) => {
    await operation();
    tests.push(name);
  };

  await record("config-valid", async () => {
    const config = parseConfigText(SELF_TEST_CONFIG);
    assertTest(config.provider === "vendor", "provider mismatch");
    assertTest(config.baseUrl === "https://example.invalid/api", "base URL mismatch");
    assertTest(config.token === "fixture-token", "token mismatch");
  });

  await record("config-missing-token", async () => {
    let code = null;
    try {
      parseConfigText(SELF_TEST_CONFIG_MISSING_TOKEN);
    } catch (error) {
      code = error.code;
    }
    assertTest(code === "E_CONFIG_KEY", "missing token should be E_CONFIG_KEY");
  });

  const samplePrompt = [
    "# Goal",
    "生成一张结构清晰的测试视觉。",
    "# Required elements",
    "- 保持中文、数字 123 和符号完整。",
    "# Output format / size",
    "1024x1024 PNG。",
    "# Negative constraints",
    "- 不添加未指定内容。",
  ].join("\n");

  await record("prompt-contract", async () => {
    const result = validatePromptText(samplePrompt, "generate");
    assertTest(result.format === "markdown", "Markdown format detection mismatch");
    assertTest(
      validatePromptText('{"type":"测试图","subject":"中文主体","layout":{"count":1}}').format === "json",
      "JSON format detection mismatch",
    );
    assertTest(
      validatePromptText("创建一张中文自然语言测试图，主体居中，背景简洁。").format === "prose",
      "prose format detection mismatch",
    );
  });

  await record("prompt-invalid-json-rejection", async () => {
    let code = null;
    try {
      validatePromptText('{"type":"损坏 JSON",}');
    } catch (error) {
      code = error.code;
    }
    assertTest(code === "E_PROMPT_STRUCTURE", "invalid JSON should be E_PROMPT_STRUCTURE");
  });

  await record("prompt-placeholder-rejection", async () => {
    let code = null;
    try {
      validatePromptText(`${samplePrompt}\n- 待补充精确标题`, "generate");
    } catch (error) {
      code = error.code;
    }
    assertTest(code === "E_PROMPT_STRUCTURE", "placeholder should be E_PROMPT_STRUCTURE");
  });

  const pngBase64 = SELF_TEST_PNG_BASE64;
  await record("png-validation", async () => {
    const result = verifyPngBytes(decodeBase64Strict(pngBase64));
    assertTest(result.width === 1 && result.height === 1, "PNG dimensions mismatch");
  });

  await record("endpoint-normalization", async () => {
    for (const base of ["https://example.invalid", "https://example.invalid/", "https://example.invalid/v1", "https://example.invalid/v1/"]) {
      assertTest(buildEndpoint(base) === "https://example.invalid/v1/images/generations", "endpoint mismatch");
    }
    assertTest(buildEndpoint("https://example.invalid/api/v1") === "https://example.invalid/api/v1/images/generations", "prefix lost");
  });

  await record("config-api-key", async () => {
    const config = parseConfigText(SELF_TEST_CONFIG.replace("experimental_bearer_token", "api_key"));
    assertTest(config.token === "fixture-token" && config.tokenKey === "api_key", "api_key mismatch");
  });

  const payload = buildPayload(samplePrompt, "generate", "1536x1024");
  await record("request-shape", async () => {
    assertTest(JSON.stringify(payload) === JSON.stringify({model: "gpt-image-2-2k", prompt: samplePrompt, size: "1536x1024"}), "request mismatch");
    assertTest(!("quality" in payload), "quality must be omitted");
    assertTest(!("size" in buildPayload(samplePrompt, "generate", "auto")), "auto must omit size");
  });

  await record("model-routing-4k", async () => {
    for (const prompt of ["生成一张 4k 图片", "生成一张 4K 图片", "prefix4Ksuffix"]) {
      const routed = buildPayload(prompt, "generate", "auto");
      assertTest(routed.model === "gpt-image-2-4k", "4k model routing mismatch");
      assertTest(routed.prompt === prompt, "routing must preserve the Prompt");
      assertTest(requestSummary(routed, "generate").model === routed.model, "model summary mismatch");
    }
    assertTest(buildPayload("生成一张 2K 图片", "generate", "auto").model === "gpt-image-2-2k", "default model routing mismatch");
  });

  await record("image-size-constraints", async () => {
    for (const size of ["auto", "1024x1024", "1536x1024", "1152x2048", "944x1680", "2048x2048", "3840x2160", "2160x3840", "2880x2880"]) {
      assertTest(parseArgs(["generate", "--size", size]).size === size, "valid size rejected");
    }
    for (const size of ["941x1672", "4096x4096", "3840x3840", "512x512", "3072x768", "0x1024", "1024", "1024X1024"]) {
      let code = null;
      try { parseArgs(["generate", "--size", size]); } catch (error) { code = error.code; }
      assertTest(code === "E_RUNTIME", `invalid size accepted: ${size}`);
    }
  });

  await record("json-image-response", async () => {
    const response = parseImageResponse(JSON.stringify({data: [{b64_json: pngBase64, width: 1, height: 1}], size: "999x999", quality: "low"}), payload);
    assertTest(response.source === "data[0].b64_json", "result source mismatch");
    assertTest(response.warnings.length === 2, "size mismatches must be reported without a quality warning");
  });

  await record("json-response-errors", async () => {
    for (const [text, code] of [["{", "E_RESPONSE_JSON"], ["null", "E_RESPONSE_JSON"], ['{"error":{"message":"refused"}}', "E_HTTP"], ['{"data":[]}', "E_IMAGE_DATA"], ['{"data":[{"b64_json":"invalid!"}]}', "E_IMAGE_DATA"]]) {
      let actual = null;
      try { parseImageResponse(text, payload); } catch (error) { actual = error.code; }
      assertTest(actual === code, `expected ${code}, received ${actual}`);
    }
  });

  await record("unsupported-api-options", async () => {
    let code = null;
    try { parseArgs(["generate", "--reasoning-effort", "high"]); } catch (error) { code = error.code; }
    assertTest(code === "E_RUNTIME", "reasoning must fail locally");
  });

  await record("edit-multipart-contract", async () => {
    for (const base of ["https://example.invalid", "https://example.invalid/v1/"]) {
      assertTest(buildEndpoint(base, "edit") === "https://example.invalid/v1/images/edits", "edit endpoint mismatch");
    }
    const editPayload = buildPayload("First image is the base; second image is the logo.", "edit", "auto");
    const bytes = decodeBase64Strict(pngBase64);
    const images = [{ filename: "original.png", mime: detectImageMime(bytes), bytes }, { filename: "logo.png", mime: "image/png", bytes }];
    const form = buildMultipart(editPayload, images);
    assertTest(form.getAll("image[]").map((file) => file.name).join(",") === "original.png,logo.png", "image order mismatch");
    assertTest(form.get("prompt") === editPayload.prompt && !form.has("quality"), "multipart fields mismatch");
    assertTest(requestSummary(editPayload, "edit", images).endpoint_path === EDIT_ENDPOINT_PATH, "summary route mismatch");
  });



  await record("request-timeout-contract", async () => {
    assertTest(REQUEST_TIMEOUT_MS === 600_000, "request timeout must be 600 seconds");
    const timeoutError = new Error("aborted");
    timeoutError.name = "AbortError";
    const timeoutFailure = classifyRequestFailure(timeoutError);
    const networkFailure = classifyRequestFailure(new Error("connection reset"));
    assertTest(timeoutFailure.retryable === false, "full request timeout must not retry");
    assertTest(
      timeoutFailure.message.includes("600 seconds"),
      "timeout diagnostic must state the 600-second limit",
    );
    assertTest(networkFailure.retryable === true, "early network failure must remain retryable");
  });

  return {
    status: "ok",
    command: "self-test",
    runtime: runtimeName(),
    tests,
    test_count: tests.length,
    network_request_performed: false,
    warnings: [],
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === "preflight") {
    return runPreflight(options);
  }
  if (options.command === "prompt-check") {
    return runPromptCheck(options);
  }
  if (options.command === "generate" || options.command === "edit") {
    return runGenerateOrEdit(options);
  }
  if (options.command === "verify") {
    return runVerify(options);
  }
  return runSelfTest();
}

try {
  emitJson(await main());
} catch (error) {
  const skillError =
    error instanceof SkillError
      ? error
      : new SkillError("E_RUNTIME", `Unexpected runtime error: ${safeText(error?.message ?? error)}`);
  process.stderr.write(`${skillError.code}: ${safeText(skillError.message)}\n`);
  emitJson({
    status: "error",
    command: process.argv[2] ?? null,
    runtime: runtimeName(),
    code: skillError.code,
    message: safeText(skillError.message),
    network_request_performed: skillError.networkRequestPerformed,
  });
  process.exitCode = 1;
}
