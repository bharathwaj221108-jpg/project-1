import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print("  SMART BUS ROUTE MANAGEMENT SYSTEM - DIGITAL ROUTE BOARD")
        print("=" * 65)
        print(f"  > Web App Server running at: {url}")
        print(f"  > Project Directory: {DIRECTORY}")
        print("  > Timezone: Asia/Kolkata (IST)")
        print("  > Press Ctrl+C to stop the server.")
        print("=" * 65)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == '__main__':
    run()
