from json import loads
from SimpleC import runScript
from os import *

PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'

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
            
def POST(content):
    # Process data
    JSON = content.decode('utf-8')
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