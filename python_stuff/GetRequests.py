from subprocess import call, run, PIPE
from os import path, mkdir, listdir
from json import loads

CMDOPTIONS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/cmdoptions.txt'
PROJECTS = '/home/pi/Desktop/SimpleC/Code-Editor-SimpleC-/python_stuff/Projects'

def RUN():
    # Process data
    result = run(['mcs', 'output.cs'], stdout=PIPE, stderr=PIPE)
    if not result.stderr == b'':
        return { 'result' : result.stdout.decode('utf-8'), 'error' : result.stderr.decode('utf-8') }
    
    result = run(['mono', 'output.exe'], stdout=PIPE, stderr=PIPE)
    return { 'result' : result.stdout.decode('utf-8'), 'error' : result.stderr.decode('utf-8') }

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
    
    return { 'result' : output, 'error' : '' }

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
        return { 'result' : file.read(), 'error' : '' }
    
    return { 'result' : '', 'error' : f"Something went wrong while getting code {project}/{script}!" }

def GETCMDOPTIONS():
    # Get cmd options
    if path.exists(CMDOPTIONS):
        file = open(CMDOPTIONS, 'r')
        result = { 'result' : loads(file.read()), 'error' : '' }
        file.close()
        return result
    else:
        return { 'result' : '', 'error' : "Command options file doesn't exist!" }
