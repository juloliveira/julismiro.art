import http.server
import socketserver
import webbrowser
import threading
import time
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n[SERVIDOR] Rodando localmente em http://localhost:{PORT}")
        print("Pressione Ctrl+C para encerrar o servidor.\n")
        httpd.serve_forever()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    time.sleep(0.5)
    
    url = f"http://localhost:{PORT}"
    print(f"[NAVEGADOR] Abrindo a pagina local: {url}")
    webbrowser.open(url)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SERVIDOR] Parado.")
