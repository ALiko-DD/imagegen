import base64
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest


REPOSITORY = Path(__file__).resolve().parents[1]
PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL4WQAAAABJRU5ErkJggg=="
RUNTIMES = [("python", [sys.executable, str(REPOSITORY / "imagegen/scripts/imagegen.py")])]
if shutil.which("node"):
    RUNTIMES.append(("node", [shutil.which("node"), str(REPOSITORY / "imagegen/scripts/imagegen.mjs")]))


class ImagesAPIHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        self.server.requests.append((self.path, dict(self.headers), json.loads(body)))
        status, response = self.server.responses.pop(0)
        encoded = response.encode("utf-8") if isinstance(response, str) else json.dumps(response).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Retry-After", "0")
        if status == 302:
            self.send_header("Location", "/must-not-follow")
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format_string, *arguments):
        pass


class ImagesAPITests(unittest.TestCase):
    def setUp(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), ImagesAPIHandler)
        self.server.requests = []
        self.server.responses = []
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.workspace = Path(tempfile.mkdtemp(prefix="imagegen-api-test-"))
        self.fake_home = self.workspace / "home"
        (self.fake_home / ".codex").mkdir(parents=True)
        self.prompt = self.workspace / "prompt.txt"
        self.prompt.write_text("生成一张小狗警官的卡通图片。主体居中，蓝色制服，简洁背景。", encoding="utf-8")
        self.config = self.fake_home / ".codex/config.toml"
        self.invocations = 0

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def invoke(self, runtime, suffix="", credential="experimental_bearer_token", extra=(), command="generate"):
        name, prefix = runtime
        base_url = f"http://127.0.0.1:{self.server.server_port}{suffix}"
        self.config.write_text(
            f'model_provider = "test"\n[model_providers.test]\nbase_url = "{base_url}"\n{credential} = "test-only-key"\n',
            encoding="utf-8",
        )
        config_before = hashlib.sha256(self.config.read_bytes()).hexdigest()
        environment = dict(os.environ)
        environment.update(HOME=str(self.fake_home), USERPROFILE=str(self.fake_home), PYTHONDONTWRITEBYTECODE="1", NO_PROXY="127.0.0.1,localhost", no_proxy="127.0.0.1,localhost")
        self.invocations += 1
        output = self.workspace / f"{name}-{self.invocations}.png"
        arguments = [*prefix, command, "--prompt-file", str(self.prompt), "--size", "1536x1024", "--out", str(output), *extra]
        if command == "edit":
            arguments.extend(["--image", str(self.workspace / "absent-reference.png")])
        result = subprocess.run(arguments, cwd=self.workspace, env=environment, capture_output=True, text=True, encoding="utf-8", timeout=30)
        self.assertEqual(hashlib.sha256(self.config.read_bytes()).hexdigest(), config_before)
        self.assertTrue((self.fake_home / ".codex").is_dir())
        self.assertNotIn("test-only-key", result.stdout + result.stderr)
        self.assertNotIn(self.prompt.read_text(encoding="utf-8"), result.stdout + result.stderr)
        return result, json.loads(result.stdout), output

    def success_response(self, model="gpt-image-2-2k"):
        return {"data": [{"b64_json": PNG_BASE64, "width": 1, "height": 1}], "quality": "low", "size": "1254x1254", "model": model}

    def test_4k_routes_requests_and_summaries(self):
        for runtime in RUNTIMES:
            for marker in ("4k", "4K", "prefix4Ksuffix"):
                with self.subTest(runtime=runtime[0], marker=marker):
                    self.prompt.write_text(f"生成一张小狗警官的卡通图片，{marker}。", encoding="utf-8")
                    self.server.responses = [(200, self.success_response("gpt-image-2-4k"))]
                    result, report, output = self.invoke(runtime)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(report["model"], "gpt-image-2-4k")
                    self.assertEqual(self.server.requests[-1][2]["model"], "gpt-image-2-4k")
                    self.assertNotIn("quality", self.server.requests[-1][2])
                    self.assertEqual(self.server.requests[-1][2]["prompt"], self.prompt.read_text(encoding="utf-8"))
                    self.assertEqual(self.server.requests[-1][2]["size"], "1536x1024")
                    self.assertTrue(output.is_file())
                    request_count = len(self.server.requests)
                    result, report, output = self.invoke(runtime, extra=["--dry-run"])
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(report["model"], "gpt-image-2-4k")
                    self.assertEqual(report["request_summary"]["model"], "gpt-image-2-4k")
                    self.assertNotIn("quality", report["request_summary"])
                    self.assertEqual(len(self.server.requests), request_count)
                    self.assertFalse(output.exists())

    def test_generate_uses_config_and_png_dimensions(self):
        for runtime in RUNTIMES:
            for suffix, credential in (("", "experimental_bearer_token"), ("/v1/", "api_key"), ("/prefix/v1", "api_key")):
                with self.subTest(runtime=runtime[0], suffix=suffix, credential=credential):
                    self.server.responses = [(200, self.success_response())]
                    result, report, output = self.invoke(runtime, suffix, credential)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(output.read_bytes(), base64.b64decode(PNG_BASE64))
                    self.assertEqual((report["width"], report["height"]), (1, 1))
                    self.assertNotIn("requested_quality", report)
                    self.assertEqual(report["provider_metadata"]["quality"], "low")
                    self.assertEqual(len(report["warnings"]), 2)
                    request_path, headers, payload = self.server.requests[-1]
                    self.assertEqual(request_path, "/prefix/v1/images/generations" if suffix.startswith("/prefix") else "/v1/images/generations")
                    self.assertEqual(headers["Authorization"], "Bearer test-only-key")
                    self.assertEqual(headers["Accept"], "application/json")
                    self.assertEqual(payload, {"model": "gpt-image-2-2k", "prompt": self.prompt.read_text(encoding="utf-8"), "size": "1536x1024"})
                    self.assertNotIn("quality", payload)

    def test_retries_only_eligible_failures(self):
        for runtime in RUNTIMES:
            for status, response in ((429, {}), (503, {}), (200, "{")):
                with self.subTest(runtime=runtime[0], status=status):
                    self.server.requests = []
                    self.server.responses = [(status, response), (200, self.success_response())]
                    result, report, output = self.invoke(runtime)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(len(self.server.requests), 2)
                    self.assertEqual(report["attempts"], 2)
                    self.assertTrue(output.is_file())

    def test_size_constraints_before_requests(self):
        for runtime in RUNTIMES:
            for size in ("2048x1152", "3840x2160", "2160x3840", "2880x2880"):
                with self.subTest(runtime=runtime[0], valid_size=size):
                    self.server.requests = []
                    self.server.responses = [(200, self.success_response())]
                    result, report, output = self.invoke(runtime, extra=["--size", size])
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(self.server.requests[-1][2]["size"], size)
                    self.assertEqual(report["requested_size"], size)
                    self.assertTrue(output.exists())
            for size in ("941x1672", "4096x4096", "3840x3840", "512x512", "3072x768"):
                with self.subTest(runtime=runtime[0], invalid_size=size):
                    self.server.requests = []
                    result, report, output = self.invoke(runtime, extra=["--size", size])
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(report["code"], "E_RUNTIME")
                    self.assertFalse(report["network_request_performed"])
                    self.assertFalse(self.server.requests)
                    self.assertFalse(output.exists())

    def test_errors_do_not_retry_or_write_images(self):
        failures = [(401, {}, "E_AUTH"), (400, {}, "E_HTTP"), (302, {}, "E_HTTP"), (200, {"error": {"message": "refused"}}, "E_HTTP"), (200, {"data": []}, "E_IMAGE_DATA"), (200, {"data": [{"b64_json": "invalid!"}]}, "E_IMAGE_DATA"), (200, {"data": [{"b64_json": base64.b64encode(b"not a PNG").decode()}]}, "E_PNG")]
        for runtime in RUNTIMES:
            for status, response, code in failures:
                with self.subTest(runtime=runtime[0], status=status, code=code):
                    self.server.requests = []
                    self.server.responses = [(status, response)]
                    result, report, output = self.invoke(runtime)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(len(self.server.requests), 1)
                    self.assertEqual(report["code"], code)
                    self.assertTrue(report["network_request_performed"])
                    self.assertFalse(output.exists())

    def test_local_only_modes_send_no_requests(self):
        for runtime in RUNTIMES:
            for command, extra, code in (("generate", ["--dry-run"], None), ("edit", ["--dry-run"], "E_EDIT_UNSUPPORTED"), ("generate", ["--reasoning-effort", "high"], "E_RUNTIME")):
                with self.subTest(runtime=runtime[0], command=command, extra=extra):
                    self.server.requests = []
                    result, report, output = self.invoke(runtime, command=command, extra=extra)
                    self.assertFalse(self.server.requests)
                    self.assertFalse(output.exists())
                    self.assertFalse(report["network_request_performed"])
                    if code:
                        self.assertEqual(report["code"], code)
                    else:
                        self.assertEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
