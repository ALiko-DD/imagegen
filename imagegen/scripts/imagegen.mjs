#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const MODEL = "gpt-5.6-terra";
const ENDPOINT_PATH = "/backend-api/codex/responses";
const MAX_PROMPT_CHARACTERS = 20_000;
const RECOMMENDED_PROMPT_CHARACTERS = Object.freeze({ min: 200, max: 4_000 });
const MAX_INPUT_IMAGES = 16;
const MAX_INPUT_BYTES = 50 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 600_000;
const SUPPORTED_REASONING_EFFORTS = new Set(["high", "xhigh", "max"]);
const SUPPORTED_SIZES = new Set([
  "auto",
  "1024x1024",
  "1024x1536",
  "1536x1024",
  "941x1672",
  "1672x941",
]);
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
  const text = String(value ?? "")
    .replace(/Authorization\s*:\s*Bearer\s+\S+/gi, "Authorization: Bearer <redacted>")
    .replace(/(experimental_bearer_token|token|secret|password|api[_-]?key)\s*[:=]\s*["']?[^"'\s,}]+/gi, "$1=<redacted>")
    .replace(/Bearer\s+\S+/gi, "Bearer <redacted>");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function emitJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function runtimeName() {
  return "node";
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
    size: "auto",
    reasoningEffort: undefined,
    mode: command === "edit" ? "edit" : "generate",
  };
  const valueOptions = new Map([
    ["--prompt-file", "promptFile"],
    ["--reasoning-effort", "reasoningEffort"],
    ["--mode", "mode"],
    ["--size", "size"],
    ["--out", "out"],
    ["--out-dir", "outDir"],
    ["--image", "images"],
    ["--file", "file"],
  ]);

  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
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

  if (!SUPPORTED_SIZES.has(options.size)) {
    throwSkill(
      "E_RUNTIME",
      `Unsupported size "${options.size}". Use ${[...SUPPORTED_SIZES].join(", ")}.`,
    );
  }
  if (
    options.reasoningEffort !== undefined
    && !SUPPORTED_REASONING_EFFORTS.has(options.reasoningEffort)
  ) {
    throwSkill(
      "E_RUNTIME",
      `Unsupported --reasoning-effort "${options.reasoningEffort}". Use ${[...SUPPORTED_REASONING_EFFORTS].join(", ")}.`,
    );
  }
  if (!new Set(["generate", "edit"]).has(options.mode)) {
    throwSkill("E_RUNTIME", "--mode must be generate or edit.");
  }
  if (
    options.reasoningEffort !== undefined
    && !new Set(["generate", "edit"]).has(options.command)
  ) {
    throwSkill("E_RUNTIME", "--reasoning-effort is only supported for generate and edit.");
  }
  if (options.out && options.outDir) {
    throwSkill("E_WRITE", "Use --out or --out-dir, not both.");
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
        new Set(["base_url", "experimental_bearer_token"]).has(key));
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
  const token = providerSection.experimental_bearer_token;
  if (!baseUrl) {
    throwSkill("E_CONFIG_KEY", `Missing base_url in [${providerSectionName}].`);
  }
  if (!token) {
    throwSkill("E_CONFIG_KEY", `Missing experimental_bearer_token in [${providerSectionName}].`);
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
  return {
    provider,
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
  return {
    configPath,
    ...parseConfigText(text),
  };
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
  return {
    promptFile: path.resolve(promptFile),
    ...validatePromptText(text, mode),
  };
}

function detectMime(bytes, filePath) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  throwSkill("E_EDIT_INPUT", `Unsupported image format: ${filePath}. Use PNG, JPEG, or WebP.`);
}

async function loadInputImages(imagePaths) {
  if (!imagePaths.length) {
    throwSkill("E_EDIT_INPUT", "The edit command requires at least one --image.");
  }
  if (imagePaths.length > MAX_INPUT_IMAGES) {
    throwSkill("E_EDIT_INPUT", `At most ${MAX_INPUT_IMAGES} input images are supported.`);
  }
  const images = [];
  for (const rawPath of imagePaths) {
    const resolved = path.resolve(rawPath);
    let stat;
    try {
      stat = await fsp.stat(resolved);
    } catch {
      throwSkill("E_EDIT_INPUT", `Input image not found: ${resolved}`);
    }
    if (!stat.isFile()) {
      throwSkill("E_EDIT_INPUT", `Input image is not a file: ${resolved}`);
    }
    if (stat.size > MAX_INPUT_BYTES) {
      throwSkill("E_EDIT_INPUT", `Input image exceeds 50 MiB: ${resolved}`);
    }
    const bytes = await fsp.readFile(resolved);
    const mime = detectMime(bytes, resolved);
    images.push({
      path: resolved,
      mime,
      bytes,
      dataUrl: `data:${mime};base64,${bytes.toString("base64")}`,
    });
  }
  return images;
}

function buildPayload(promptText, mode, size, images = [], reasoningEffort) {
  const tool = {
    type: "image_generation",
    quality: "high",
  };
  if (size !== "auto") {
    tool.size = size;
  }
  const content = [];
  if (mode === "edit") {
    for (const image of images) {
      content.push({
        type: "input_image",
        image_url: image.dataUrl,
      });
    }
  }
  content.push({
    type: "input_text",
    text: promptText,
  });
  return {
    model: MODEL,
    store: false,
    stream: true,
    tools: [tool],
    tool_choice: {
      type: "image_generation",
    },
    input: [
      {
        role: "user",
        content,
      },
    ],
    ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
  };
}

function requestSummary(payload, mode) {
  const content = payload.input[0].content;
  return {
    model: payload.model,
    store: payload.store,
    stream: payload.stream,
    tool: payload.tools[0],
    tool_choice: payload.tool_choice,
    requested_reasoning_effort: payload.reasoning?.effort ?? null,
    endpoint_path: ENDPOINT_PATH,
    mode,
    input_types: content.map((item) => item.type),
    input_image_count: content.filter((item) => item.type === "input_image").length,
    prompt_sha256: crypto
      .createHash("sha256")
      .update(content.find((item) => item.type === "input_text").text, "utf8")
      .digest("hex"),
  };
}

function scanEventValue(value, state) {
  if (Array.isArray(value)) {
    for (const item of value) {
      scanEventValue(item, state);
    }
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  if (value.item && typeof value.item === "object" && typeof value.item.result === "string") {
    state.finalImage = value.item.result;
  }
  if (typeof value.partial_image_b64 === "string") {
    state.partialImage = value.partial_image_b64;
  }
  for (const nested of Object.values(value)) {
    scanEventValue(nested, state);
  }
}

function processSseBlock(block, state) {
  const dataLines = [];
  for (const rawLine of block.split("\n")) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    if (!line || line.startsWith(":")) {
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (!dataLines.length) {
    return;
  }
  const data = dataLines.join("\n").trim();
  if (!data) {
    return;
  }
  if (data === "[DONE]") {
    state.done = true;
    return;
  }
  let event;
  try {
    event = JSON.parse(data);
  } catch {
    throwSkill("E_SSE", "SSE contained invalid JSON.", { retryable: true });
  }
  const type = String(event.type ?? "");
  if (event.error || /(?:^|\.)(?:error|failed)$/.test(type)) {
    const message =
      event.error?.message ?? event.message ?? event.response?.error?.message ?? "Provider returned an SSE error.";
    throwSkill("E_HTTP", safeText(message));
  }
  scanEventValue(event, state);
}

function parseSseText(text) {
  const state = {
    finalImage: null,
    partialImage: null,
    done: false,
  };
  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = normalized.split("\n\n");
  for (const block of blocks) {
    if (block.trim()) {
      processSseBlock(block, state);
    }
  }
  const imageBase64 = state.finalImage ?? state.partialImage;
  if (!imageBase64) {
    throwSkill("E_IMAGE_DATA", "SSE completed without image data.", { retryable: true });
  }
  return {
    imageBase64,
    source: state.finalImage ? "item.result" : "partial_image_b64",
    done: state.done,
  };
}

async function parseSseStream(body) {
  if (!body) {
    throwSkill("E_SSE", "Response did not include an SSE body.", { retryable: true });
  }
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const state = {
    finalImage: null,
    partialImage: null,
    done: false,
  };
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        processSseBlock(block, state);
        boundary = buffer.indexOf("\n\n");
      }
    }
    buffer += decoder.decode();
  } catch (error) {
    if (error instanceof SkillError) {
      throw error;
    }
    throwSkill("E_SSE", `Could not decode SSE: ${safeText(error.message)}`, { retryable: true });
  }
  if (buffer.trim()) {
    processSseBlock(buffer, state);
  }
  const imageBase64 = state.finalImage ?? state.partialImage;
  if (!imageBase64) {
    throwSkill("E_IMAGE_DATA", "SSE completed without image data.", { retryable: true });
  }
  return {
    imageBase64,
    source: state.finalImage ? "item.result" : "partial_image_b64",
    done: state.done,
  };
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

function getReasoningRejectionMessage(status, body, payload) {
  const requestedReasoningEffort =
    typeof payload.reasoning?.effort === "string"
      ? payload.reasoning.effort
      : null;
  if (
    !requestedReasoningEffort
    || (status !== 400 && status !== 422)
  ) {
    return null;
  }
  return `Provider rejected a request that included reasoning.effort=\"${requestedReasoningEffort}\". The Skill did not remove or downgrade it; the upstream model/tool combination may not support it. HTTP ${status}. ${body}`;
}

async function requestOnce(config, payload) {
  const endpoint = `${config.baseUrl}${ENDPOINT_PATH}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Originator: "codex_cli_rs",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    const failure = classifyRequestFailure(error);
    throwSkill("E_HTTP", failure.message, {
      retryable: failure.retryable,
      networkRequestPerformed: true,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = safeText(await response.text());
    if (response.status === 401 || response.status === 403) {
      throwSkill("E_AUTH", `Provider authentication failed with HTTP ${response.status}. ${body}`, {
        networkRequestPerformed: true,
      });
    }
    if (response.status === 429) {
      throw new SkillError("E_RATE_LIMIT", `Provider rate limit returned HTTP 429. ${body}`, {
        retryable: true,
        networkRequestPerformed: true,
        details: { response },
      });
    }
    if (response.status === 408 || response.status >= 500) {
      throw new SkillError("E_HTTP", `Provider returned HTTP ${response.status}. ${body}`, {
        retryable: true,
        networkRequestPerformed: true,
        details: { response },
      });
    }
    const reasoningRejection = getReasoningRejectionMessage(
      response.status,
      body,
      payload,
    );
    if (reasoningRejection) {
      throwSkill("E_HTTP", reasoningRejection, { networkRequestPerformed: true });
    }
    throwSkill("E_HTTP", `Provider returned HTTP ${response.status}. ${body}`, {
      networkRequestPerformed: true,
    });
  }
  return parseSseStream(response.body);
}

async function requestImage(config, payload) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return {
        ...(await requestOnce(config, payload)),
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
      experimental_bearer_token_present: true,
    },
    dependencies: {
      external_packages: [],
      built_in_fetch: typeof fetch === "function",
      text_decoder: typeof TextDecoder === "function",
    },
    model: MODEL,
    reasoning_effort: {
      supported_values: [...SUPPORTED_REASONING_EFFORTS],
      default: null,
      default_behavior: "No reasoning field is sent unless --reasoning-effort is explicit.",
    },
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
  const payload = buildPayload(
    prompt.text,
    mode,
    options.size,
    images,
    options.reasoningEffort,
  );
  const summary = requestSummary(payload, mode);
  const outputPath = resolveOutputPath(options);
  await ensureWritableDirectory(path.dirname(outputPath));
  if (!options.force && fs.existsSync(outputPath)) {
    throwSkill("E_WRITE", `Output file already exists: ${outputPath}`);
  }

  if (options.dryRun) {
    return {
      status: "ok",
      command: mode,
      runtime: runtimeName(),
      model: MODEL,
      requested_reasoning_effort: options.reasoningEffort ?? null,
      prompt_file: prompt.promptFile,
      prompt_characters: prompt.characters,
      output_path: outputPath,
      request_summary: summary,
      experimental: mode === "edit",
      network_request_performed: false,
      warnings: mode === "edit" ? ["Direct API editing is experimental and has not been live-tested."] : [],
    };
  }

  const response = await requestImage(config, payload);
  const imageBytes = decodeBase64Strict(response.imageBase64);
  const dimensions = verifyPngBytes(imageBytes);
  const written = await writePng(outputPath, imageBytes, options.force);
  return {
    status: "ok",
    command: mode,
    runtime: runtimeName(),
    model: MODEL,
    requested_reasoning_effort: options.reasoningEffort ?? null,
    output_path: outputPath,
    width: written.width,
    height: written.height,
    prompt_characters: prompt.characters,
    result_source: response.source,
    experimental: mode === "edit",
    attempts: response.attempts,
    network_request_performed: true,
    warnings: mode === "edit" ? ["Direct API editing is experimental and has not been live-tested."] : [],
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

  await record("sse-final-priority", async () => {
    const text = [
      `data: {"type":"response.image_generation_call.partial_image","partial_image_b64":"${pngBase64}"}`,
      "",
      `data: {"type":"response.output_item.done","item":{"id":"ig_1","type":"image_generation_call","result":"${pngBase64}"}}`,
      "",
      "data: [DONE]",
    ].join("\n");
    const result = parseSseText(text);
    assertTest(result.source === "item.result", "final result should win");
  });

  await record("sse-partial-fallback", async () => {
    const text = [
      `data: {"type":"response.image_generation_call.partial_image","partial_image_b64":"${pngBase64}"}`,
      "",
      "data: [DONE]",
    ].join("\n");
    const result = parseSseText(text);
    assertTest(result.source === "partial_image_b64", "partial fallback mismatch");
  });

  await record("sse-malformed", async () => {
    let code = null;
    try {
      parseSseText("data: {invalid-json}\n");
    } catch (error) {
      code = error.code;
    }
    assertTest(code === "E_SSE", "malformed SSE should be E_SSE");
  });

  await record("reasoning-effort-arguments", async () => {
    const valid = parseArgs([
      "generate",
      "--prompt-file",
      "prompt.txt",
      "--reasoning-effort",
      "xhigh",
      "--dry-run",
    ]);
    assertTest(valid.reasoningEffort === "xhigh", "xhigh argument mismatch");

    let invalidCode = null;
    try {
      parseArgs([
        "generate",
        "--prompt-file",
        "prompt.txt",
        "--reasoning-effort",
        "turbo",
      ]);
    } catch (error) {
      invalidCode = error.code;
    }
    assertTest(invalidCode === "E_RUNTIME", "invalid reasoning effort should fail locally");

    let unsupportedCommandCode = null;
    try {
      parseArgs(["preflight", "--reasoning-effort", "high"]);
    } catch (error) {
      unsupportedCommandCode = error.code;
    }
    assertTest(
      unsupportedCommandCode === "E_RUNTIME",
      "reasoning effort must be limited to generate and edit",
    );
  });

  await record("reasoning-rejection-diagnostic", async () => {
    const message = getReasoningRejectionMessage(400, "unsupported", {
      reasoning: { effort: "max" },
    });
    assertTest(
      message?.includes('reasoning.effort="max"'),
      "reasoning rejection must name the requested effort",
    );
    assertTest(
      getReasoningRejectionMessage(503, "unavailable", {
        reasoning: { effort: "max" },
      }) === null,
      "transient failures must not be mislabeled as reasoning incompatibility",
    );
    assertTest(
      getReasoningRejectionMessage(400, "bad request", {}) === null,
      "requests without reasoning must not receive a reasoning diagnostic",
    );
  });

  await record("request-shape", async () => {
    const image = {
      dataUrl: `data:image/png;base64,${pngBase64}`,
    };
    const defaultGenerate = buildPayload(
      samplePrompt,
      "generate",
      "1024x1024",
      [],
    );
    const xhighGenerate = buildPayload(
      samplePrompt,
      "generate",
      "1024x1024",
      [],
      "xhigh",
    );
    const maxEdit = buildPayload(
      samplePrompt,
      "edit",
      "auto",
      [image, image],
      "max",
    );
    assertTest(defaultGenerate.model === MODEL, "model mismatch");
    assertTest(defaultGenerate.reasoning === undefined, "default must omit reasoning");
    assertTest(defaultGenerate.tools[0].quality === "high", "image quality mismatch");
    assertTest(defaultGenerate.tools[0].size === "1024x1024", "size mismatch");
    assertTest(
      xhighGenerate.reasoning?.effort === "xhigh",
      "xhigh reasoning payload mismatch",
    );
    assertTest(
      requestSummary(xhighGenerate, "generate").requested_reasoning_effort === "xhigh",
      "xhigh reasoning summary mismatch",
    );
    assertTest(maxEdit.reasoning?.effort === "max", "max reasoning payload mismatch");
    assertTest(
      maxEdit.input[0].content.filter((item) => item.type === "input_image").length === 2,
      "edit image order mismatch",
    );
    assertTest(maxEdit.input[0].content.at(-1).type === "input_text", "input_text should be last");
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
