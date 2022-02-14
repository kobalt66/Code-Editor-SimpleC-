from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads
from sys import argv
from PostRequests import SAVESCRIPT, COMPILE
from GetRequests import RUN, LOADPROJECTS, GETCODE

BIND_HOST = '192.168.178.58'
PORT = 8008


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Setup
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header("Content-Type", "application/json")
            self.send_header("Mode", "no-cors")
            self.end_headers()
            
            output = RUN()
            print(output.decode('utf-8'))
            self.wfile.write(output)
            
        except Exception as e:
            self.wfile.write("[GET] Something went wrong while processing the data!".encode('utf-8'))
            print("Ups, something went wrong!")
            print(e)
        
    def do_POST(self):
        try:
            # Setup
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            content_length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(content_length)
            
            JSON = body.decode('utf-8')
            _type = loads(JSON)['type']
            
            output = ''
            if _type == 'SAVESCRIPT':
                output = SAVESCRIPT(body)
            elif _type == 'COMPILE':
                output = COMPILE(body)
            elif _type == 'LOADPROJECTS':
                output = LOADPROJECTS()
            elif _type == 'GETCODE':
                output = GETCODE(body)
            else:
                output = (_type + " is not supported!").encode('utf-8')
                
            print(output.decode('utf-8'))
            self.wfile.write(output)
            
        except Exception as e:
            self.wfile.write((f"[POST] Something went wrong!" + str(e)).encode('utf-8'))

if len(argv) > 1:
    arg = argv[1].split(':')
    BIND_HOST = arg[0]
    PORT = int(arg[1])

print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()
