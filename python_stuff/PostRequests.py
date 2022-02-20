from json import loads, dumps
from os import path, mkdir
from SimpleC import runScript, run

CMDOPTIONS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/cmdoptions.txt'
PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'
LIBRARIES = "/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Libraries"

def SAVESCRIPT(content):
    # Process data
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

    return { 'result' : f"Successfully saved {projectTag}/{scriptTag}!", 'error' : '' }
            
def COMPILE(content):
    # Process data
    JSON = content.decode('utf-8')
    projectTag = loads(JSON)['tag']
    
    result, error = run(projectTag)
    return { 'result' : result, 'error' : error }
    
def UPLOADLIB(content):
    # Process data
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    
    lib = obj['lib']
    code = obj['code']
    
    # Safe library
    libPath = LIBRARIES + "/" + lib
    
    if not path.exists(libPath):
        file = open(libPath, 'x')
        file.write(code)
        file.close()
    else:
        file = open(libPath, 'w')
        file.write(code)
        file.close()
    
    return { 'result' : f"Successfully uploaded {lib}!", 'error' : '' }

def SETCMDOPTIONS(content):
    # Process data
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    options = obj['options']
    
    # Safe cmd options
    if not path.exists(CMDOPTIONS):
        file = open(CMDOPTIONS, 'x')
        file.write(dumps(options))
        file.close()
    else:
        file = open(CMDOPTIONS, 'w')
        file.write(dumps(options))
        file.close()
    
    return { 'result' : "Command options safed...", 'error' : '' } 

