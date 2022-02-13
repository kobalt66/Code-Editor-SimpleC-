from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads
from sys import argv
from subprocess import call, run, PIPE
from PostRequests import SAVESCRIPT, COMPILE

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
            
            # Process data
            result = run(['mcs', 'output.cs'], stdout=PIPE, stderr=PIPE)
            if not result.stderr == b'':
                json = result.stderr.decode('utf-8')
                self.wfile.write(json.encode('utf-8'))
                print("Success!")
                return
                
            result = run(['mono', 'output.exe'], stdout=PIPE, stderr=PIPE)
            json = result.stderr.decode('utf-8') + "<br><br>" + result.stdout.decode('utf-8')
            self.wfile.write(json.encode('utf-8'))
            print("Success!")
            
        except Exception as e:
            self.wfile.write("[GET] Something went wrong while processing the data!".encode('utf-8'))
            print("Ups, something went wrong!")
            print(e)
        
    def do_POST(self):
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
        
        print(output.decode('utf-8'))
        self.wfile.write(output)
        
        


if len(argv) > 1:
    arg = argv[1].split(':')
    BIND_HOST = arg[0]
    PORT = int(arg[1])

print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()
