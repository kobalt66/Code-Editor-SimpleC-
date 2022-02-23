from json import loads, dumps
from os import path, mkdir, rmdir, listdir, remove
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

def SUBMITFILE(content):
    # Process data
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    _path = obj['path']
    
    # Getting the file path
    components = _path.split('/')
    filePath = ''
    fileType = ''
    if len(components) == 1:
        filePath = PROJECTS + '/' + components[0]
        fileType = 'project'
    elif len(components) == 2:
        if not '.sc' in components[1]:
            return { 'result' : "", 'error' : "Please use the right script format ('.sc')" }     
        
        filePath = PROJECTS + '/' + components[0] + '/' + components[1]
        fileType = 'script'
    else:
        return { 'result' : "", 'error' : 'You are not allowed to have dictionaries inside a dictionary!' } 
        
    # Create the file
    if not path.exists(filePath) and fileType == 'script':
        file = open(filePath, 'x')
        file.write('// Write your code here...')
        file.close()
    elif not path.exists(filePath) and fileType == 'project':
        mkdir(filePath)
    else:
        return { 'result' : "", 'error' : f'The file ( {filePath} ) allready exists!' }
    return { 'result' : f"Successfully created the file! ( {filePath} )", 'error' : '' } 

def DELETEFILE(content):
    # Process data
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    _path = obj['path']
    
    # Delete the file
    components = _path.split('/')
    filePath = ''
    fileType = ''
    if len(components) == 1:
        filePath = PROJECTS + '/' + components[0]
        fileType = 'project'
    elif len(components) == 2:
        if not '.sc' in components[1]:
            return { 'result' : "", 'error' : "Please use the right script format ('.sc')" }     
        
        filePath = PROJECTS + '/' + components[0] + '/' + components[1]
        fileType = 'script'
    
    filePath = filePath.replace(' ', '')
    if fileType == 'script':
        remove(filePath)
    elif fileType == 'project':
        try:
            rmdir(filePath)
        except:
            files = listdir(filePath)
            for f in files:
                remove(filePath + '/' + f)
            rmdir(filePath)
        
    return { 'result' : f"Successfully removed the file! ( {filePath} )", 'error' : '' }

def DELETELIB(content):
    # Process data
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    lib = obj['lib']
    
    # Delete the file
    if not '.sc' in lib:
        return { 'result' : "", 'error' : "Please use the right script format ('.sc')" }
    
    filePath = LIBRARIES + '/' + lib
    filePath = filePath.replace(' ', '')
    remove(filePath)
        
    return { 'result' : f"Successfully removed the '{lib}' library!", 'error' : '' } 
