from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads
from sys import argv
from SimpleC import runScript
from subprocess import call, run, PIPE
from os import path

BIND_HOST = '192.168.178.58'
PORT = 8008
PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'


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
        if _type == 'SAVEPROJECT':
            output = PostRequest.SAVEPROJECT(body)
        elif _type == 'POST':
            output = PostRequest.POST(body)
        
        self.wfile.write(output)
        
class PostRequest:
    def SAVEPROJECT(content):
        # Process data
        try:
            # Extract data from JSON
            JSON = content.decode('utf-8')
            obj = loads(JSON)
            
            projectTag = obj['tag']
            code = obj['code']
            
            # Saving data
            projectPath = PROJECTS + "/" + projectTag
            
            file = open(projectPath, 'x')
            file.write(code)
            file.close()
            
            return f"Successfully saved {projectTag}!".encode('utf-8')
            print(f"Successfully saved {projectTag}!")
            
        except Exception as e:
            return f"[SAVEPROJECT] Something went wrong while saving {projectTag}!".encode('utf-8')
            print(f"[SAVEPROJECT] Something went wrong while saving {projectTag}!")
            print(e)
            
    def POST(body):
        # Process data
        JSON = body.decode('utf-8')
        code = loads(JSON)['code']
        
        try:
            result = runScript('js_test', code)
            
            if result:
                json = result
                return json.encode('utf-8')
            else:
                return "Successfully compiled the code!".encode('utf-8')
            print("Success!")
            
        except Exception as e:
            return "[POST] Something went wrong while processing the data!".encode('utf-8')
            print("[POST] Something went wrong while processing the data!")
            print(e)
        
        


if len(argv) > 1:
    arg = argv[1].split(':')
    BIND_HOST = arg[0]
    PORT = int(arg[1])

print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()
