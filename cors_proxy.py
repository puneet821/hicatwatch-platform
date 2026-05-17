import http.server
import socketserver
import urllib.request
from urllib.error import HTTPError, URLError

PORT = 8001

class ProxyHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        http.server.BaseHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_GET(self):
        # Extract the target URL by removing the leading slash
        target_url = self.path[1:]
        
        # Handle cases where the browser might compress consecutive slashes (e.g., http:/example.com)
        if target_url.startswith("http:/") and not target_url.startswith("http://"):
            target_url = target_url.replace("http:/", "http://", 1)
        if target_url.startswith("https:/") and not target_url.startswith("https://"):
            target_url = target_url.replace("https:/", "https://", 1)

        if not target_url.startswith('http'):
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Invalid URL. Must start with http:// or https://")
            return

        print(f"Proxying: {target_url}")

        req = urllib.request.Request(target_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': target_url
        })

        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.getcode())
                
                # Forward necessary headers
                content_type = response.headers.get('Content-Type')
                if content_type:
                    self.send_header('Content-Type', content_type)
                
                self.end_headers()
                
                # Stream the video chunks back to the player
                while True:
                    chunk = response.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    
        except HTTPError as e:
            self.send_response(e.code)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))
        except URLError as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    with ThreadingHTTPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"CORS Proxy Server running at http://localhost:{PORT}")
        print("Leave this window open. It will bypass CORS for your streams!")
        httpd.serve_forever()
