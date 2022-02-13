from subprocess import call, run, PIPE
from os import path, mkdir, listdir
from json import loads

PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'

def RUN():
    # Process data
    result = run(['mcs', 'output.cs'], stdout=PIPE, stderr=PIPE)
    if not result.stderr == b'':
        json = result.stderr.decode('utf-8')
        return json.encode('utf-8')
                
    result = run(['mono', 'output.exe'], stdout=PIPE, stderr=PIPE)
    json = result.stderr.decode('utf-8') + "<br><br>" + result.stdout.decode('utf-8')
    return json.encode('utf-8')

def LOADPROJECTS():
    # Get data from projects
    output = ''
    
    projects = listdir(PROJECTS)
    for project in projects:
        output += project
        
        files = listdir(PROJECTS + "/" + project)
        for file in files:
            output += " " + file
        
        output += ";"
        
    return output.encode('utf-8')

def GETCODE(content):
    # Get data from script
    # Extract data from JSON
    JSON = content.decode('utf-8')
    obj = loads(JSON)
    project = obj['project']
    script = obj['script']
    
    scriptPath = PROJECTS  + "/" + project + "/" + script
    if path.exists(scriptPath):
        file = open(scriptPath, 'r')
        return file.read().encode('utf-8')
    
    return f"Something went wrong while getting code {project}/{script}!".encode('utf-8')
    
