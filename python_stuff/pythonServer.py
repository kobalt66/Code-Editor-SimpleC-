from http.server import HTTPServer, BaseHTTPRequestHandler
from json import loads, dumps
from sys import argv
from PostRequests import SAVESCRIPT, COMPILE, UPLOADLIB, SETCMDOPTIONS
from GetRequests import RUN, LOADPROJECTS, GETCODE, GETCMDOPTIONS

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
            
            outputJSON = RUN()
            finalJSON = dumps(outputJSON)
            print('\n\nError: ', outputJSON['error'])
            print('\nResult: ', outputJSON['result'])
            self.wfile.write(finalJSON.encode('utf-8'))
            
        except Exception as e:
            outputJSON = { 'result' : '', 'error' : "[GET] Something went wrong while processing the data: <br> " + str(e) }
            print('\n\nError: ', outputJSON['error'])
            print('\nResult: ', outputJSON['result'])
            
            finalJSON = dumps(outputJSON)
            self.wfile.write(finalJSON.encode('utf-8'))
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
            
            outputJSON = ''
            if _type == 'SAVESCRIPT':
                outputJSON = SAVESCRIPT(body)
            elif _type == 'COMPILE':
                outputJSON = COMPILE(body)
            elif _type == 'LOADPROJECTS':
                outputJSON = LOADPROJECTS()
            elif _type == 'GETCODE':
                outputJSON = GETCODE(body)
            elif _type == 'UPLOADLIB':
                outputJSON = UPLOADLIB(body)
            elif _type == 'SETCMDOPTIONS':
                outputJSON = SETCMDOPTIONS(body)
            elif _type == 'GETCMDOPTIONS':
                outputJSON = GETCMDOPTIONS()
            else:
                outputJSON = { 'result' : '', 'error' : _type + " is not supported!" }
            
            finalJSON = dumps(outputJSON)
            print('\n\nError: ', outputJSON['error'])
            print('\nResult: ', outputJSON['result'])
            self.wfile.write(finalJSON.encode('utf-8'))
            
        except Exception as e:
            outputJSON = { 'result' : '', 'error' : f"[POST] Something went wrong! <br> " + str(e) }
            print('\n\nError: ', outputJSON['error'])
            print('\nResult: ', outputJSON['result'])
            
            finalJSON = dumps(outputJSON)
            self.wfile.write(finalJSON.encode('utf-8'))
    

if len(argv) > 1:
    arg = argv[1].split(':')
    BIND_HOST = arg[0]
    PORT = int(arg[1])

print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()
