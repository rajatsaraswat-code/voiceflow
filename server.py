#!/usr/bin/env python3
"""
ElevenLabs Voice Studio - Local Server & API Proxy
Serves the web application and proxies requests to ElevenLabs API to eliminate CORS issues.
Uses only Python 3 standard library (no pip packages needed).
"""

import os
import sys
import json
import urllib.request
import urllib.error
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Reconfigure stdout for utf-8 on Windows if needed
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PORT = 8000
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Check for environment variable or .env file
DEFAULT_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
if not DEFAULT_API_KEY and os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("ELEVENLABS_API_KEY="):
                    DEFAULT_API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
    except Exception as e:
        print(f"Notice: Could not parse .env: {e}")

# Ensure proper MIME types on Windows
SimpleHTTPRequestHandler.extensions_map.update({
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg"
})

class ElevenLabsProxyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, xi-api-key, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/voices":
            self.proxy_get(f"{ELEVENLABS_BASE_URL}/voices")
            return
        elif path == "/api/models":
            self.proxy_get(f"{ELEVENLABS_BASE_URL}/models")
            return

        # Serve static files
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path == "/api/tts":
            voice_id = query.get("voice_id", ["21m00Tcm4TlvDq8ikWAM"])[0]
            target_url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
            self.proxy_post_tts(target_url)
            return

        self.send_error(404, "Endpoint not found")

    def proxy_get(self, target_url):
        api_key = self.headers.get("xi-api-key") or DEFAULT_API_KEY
        req = urllib.request.Request(target_url)
        if api_key:
            req.add_header("xi-api-key", api_key)

        try:
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err_data = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err_data)
        except Exception as e:
            self.send_error(500, f"Proxy error: {str(e)}")

    def proxy_post_tts(self, target_url):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        api_key = self.headers.get("xi-api-key") or DEFAULT_API_KEY
        if not api_key:
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err_resp = json.dumps({"detail": {"message": "No ElevenLabs API key provided. Please configure your API key in the UI."}}).encode("utf-8")
            self.wfile.write(err_resp)
            return

        req = urllib.request.Request(target_url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("xi-api-key", api_key)

        try:
            with urllib.request.urlopen(req) as resp:
                audio_bytes = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(audio_bytes)))
                self.end_headers()
                self.wfile.write(audio_bytes)
        except urllib.error.HTTPError as e:
            err_data = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err_data)
        except Exception as e:
            self.send_error(500, f"TTS Proxy error: {str(e)}")

def run_server(port=PORT):
    # Ensure working directory is this script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ("", port)
    try:
        httpd = HTTPServer(server_address, ElevenLabsProxyHandler)
        print("=" * 60)
        print("ElevenLabs Voice Studio Server is LIVE!")
        print(f"Access URL: http://localhost:{port}")
        print("=" * 60)
        print("Press Ctrl+C to stop the server.")
        httpd.serve_forever()
    except OSError as e:
        if port < 8010:
            print(f"Port {port} busy, trying {port + 1}...")
            run_server(port + 1)
        else:
            print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
