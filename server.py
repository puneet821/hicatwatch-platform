import http.server
import socketserver
import os
import sys

PORT = 5000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS for resources
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        # Custom Content-Security-Policy to allow HLS streams and blob sources
        self.send_header('Content-Security-Policy', "default-src 'self' https: *; img-src 'self' data: https: *; style-src 'self' 'unsafe-inline' https: *; script-src 'self' 'unsafe-inline' https: *; font-src 'self' data: https: *; connect-src 'self' blob: data: https: *; media-src 'self' blob: data: https: *; object-src 'none'; frame-src 'self' https: *;")
        super().end_headers()

# Change to the directory of this script to ensure proper root resolution
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = MyHTTPRequestHandler

# Attempt to spin up server, incrementing port if already taken
while True:
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print("\n=======================================================")
            print("  HiCatwatch Premium Local Server is online!")
            print("  URL: http://localhost:{}".format(PORT))
            print("=======================================================\n")
            sys.stdout.flush()
            httpd.serve_forever()
    except OSError:
        PORT += 1
