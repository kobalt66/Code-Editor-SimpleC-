from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads
from sys import argv
from SimpleC import runScript
from subprocess import call, run, PIPE

BIND_HOST = '192.168.178.58'
PORT = 8008


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self): 
        try:  
            # Setup 
            self.send_response(200) 
            self.send_header('Access-Control-Allow-Origin', '*') 
            self.send_header("Content-Type", "application/json") 
            self.end_headers() 
            
            # Process data 
            call(['mcs', 'output.cs']) 
            result = run(['mono', 'output.exe'], stdout=PIPE) 
            print('Sending data: ', result.stdout.decode('utf-8')) 
            print("Success!") 
            
            json = "{\"result\" : \"" + str(result.stdout.decode('utf-8')) + "\"}" 
            self.wfile.write(json.encode('utf-8')) 
        
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
        
        # Process data
        self.send_response(200)
        self.end_headers() 
        
        try: 
            codeJSON = body.decode('utf-8') 
            code = loads(codeJSON)['code'] 
            result = runScript('js_test', code)
        
            print(result) 
            print("Success!") 
        
            json = "{\"result\" : \"" + result + "\"}" 
            self.wfile.write(json.encode('utf-8')) 
        
        except Exception as e: 
            self.wfile.write("[POST] Something went wrong while processing the data!".encode('utf-8'))
            print("Ups, something went wrong!") 
            print(e) 
            
            
if len(argv) > 1: 
    arg = argv[1].split(':') 
    BIND_HOST = arg[0] 
    PORT = int(arg[1])
    
print(f'Listening on http://{BIND_HOST}:{PORT}\n') 

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler) 
httpd.serve_forever()
