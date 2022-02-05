from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads
from sys import argv
from SimpleC import runScript

BIND_HOST = 'localhost'
PORT = 8008


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('content-length', 0))
        body = self.rfile.read(content_length)
        
        self.write_response(body)

    def write_response(self, content):
        self.send_response(200)
        self.end_headers()
        
        codeJSON = content.decode('utf-8')
        code = loads(codeJSON)['code']
        
        print(runScript('js_test', code))
        
        # run the script and get the result
        
        print('Success!')


if len(argv) > 1:
    arg = argv[1].split(':')
    BIND_HOST = arg[0]
    PORT = int(arg[1])

print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()