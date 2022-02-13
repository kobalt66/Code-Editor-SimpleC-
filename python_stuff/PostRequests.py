from json import loads
from os import path, mkdir
from SimpleC import runScript, run

PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'

def SAVESCRIPT(content):
    # Process data
    try:
        # Extract data from JSON
        JSON = content.decode('utf-8')
        obj = loads(JSON)
        
        projectTag = obj['tag']
        script = obj['script']
        scriptTag = script['tag']
        code = script['code']
        
        # Saving data
        projectPath = PROJECTS + "/" + projectTag
        scriptPath = projectPath + "/" + scriptTag
        
        if not path.isdir(projectPath):
            mkdir(projectPath)
            file = open(scriptPath, 'x')
            file.write(code)
            file.close()
        elif not path.exists(scriptPath):
            file = open(scriptPath, 'x')
            file.write(code)
            file.close()
        else:
            file = open(scriptPath, 'w')
            file.write(code)
            file.close()
 
        return f"Successfully saved {projectTag}/{scriptTag}!".encode('utf-8')
    except Exception as e:
        return (f"[SAVEPROJECT] Something went wrong while saving {projectTag}/{scriptTag}! " + str(e)).encode('utf-8')
            
def COMPILE(content):
    # Process data
    JSON = content.decode('utf-8')
    projectTag = loads(JSON)['tag']
    
    try:
        result = run(projectTag)
        
        if result:
            json = result
            return json.encode('utf-8')
        else:
            return "Successfully compiled the code!".encode('utf-8')
        
    except Exception as e:
        return ("[POST] Something went wrong while processing the data!" + str(e)).encode('utf-8')
