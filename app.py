from http.server import HTTPServer, SimpleHTTPRequestHandler
import sqlite3
import json
import urllib.parse
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        data = dict(urllib.parse.parse_qsl(post_data))

        if self.path == '/register':
            response = self.handle_register(data)
        elif self.path == '/login':
            response = self.handle_login(data)
        else:
            response = {'error': 'Invalid endpoint'}

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow CORS
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

    def handle_register(self, data):
        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (email, password)
                VALUES (?, ?)
            ''', (data['email'], data['password']))
            conn.commit()
            return {'success': True, 'message': 'Registration successful'}
        except sqlite3.IntegrityError:
            return {'error': 'Email already exists'}
        except Exception as e:
            return {'error': str(e)}
        finally:
            conn.close()

    def handle_login(self, data):
        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, email FROM users
                WHERE email = ? AND password = ?
            ''', (data['email'], data['password']))
            user = cursor.fetchone()
            if user:
                return {'success': True, 'message': 'Login successful'}
            return {'error': 'Invalid credentials'}
        except Exception as e:
            return {'error': str(e)}
        finally:
            conn.close()

def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()

    # If no port is specified, default to 5500
    port = 5500
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])  # Accept port from command-line argument
        except ValueError:
            print("Invalid port number. Falling back to default port 5500.")
    
    server = HTTPServer(('0.0.0.0', port), CORSRequestHandler)  # Listen on all network interfaces
    print(f'Server running on http://0.0.0.0:{port}/')
    server.serve_forever()
