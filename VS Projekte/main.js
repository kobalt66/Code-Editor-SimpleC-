import { c } from "./Constant.js"
String.prototype.removeAt = c.removeAt;

// Editor data
var lineData = [];
var current_code = ' ';
var final_code = '';
var clipboard = '';

var loadedProjects = {};
var projectCount = 0;
var fileCount = 0;

var bin = null;
var terminal_input = null;
var terminal_output = null;
var file_viewer = null;
var realFileBtn = null;
var uploadLib = null;
const cPos = {
    idx: 0,
    lnIdx: 1,
    'AltLeft': false,
    'ShiftLeft': false,
    'Control': false,
    fastShift: 5,
    clipboardStart: undefined,
    clipboardEnd: undefined,
    clipboardCode: '',
    allowedToType: false,
    options: {
        showCurlInfo: true
    },
    currScript: '',
    currProject: ''
}

// Send request to server
export const CurlPythonServer = async (code, address = c.server, func = "POST", onready = () => { }) => {
    if (cPos.options.showCurlInfo)
        unique_info(`[${func}] Curl on ${address}`);

    if (func === "POST") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", address);

        // Process data
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                bin.innerHTML = xhr.responseText;
                var result = bin.innerHTML;

                if (code.type === 'LOADPROJECTS') {
                    bin.innerHTML = '';
                    var obj = JSON.parse(result);
                    if (obj['error'] !== '') throwError(obj['error']);

                    var projects = obj['result'].split(';');
                    loadedProjects = { projects: {} };

                    for (let i = 0; i < projects.length; i++) {
                        var currProject = projects[i];
                        if (currProject === "") continue;

                        var files = currProject.split(' ');
                        var projectTag = files[0];

                        loadedProjects.projects[projectTag] = {
                            open: false,
                            files: []
                        }

                        for (let j = 1; j < files.length; j++)
                            loadedProjects.projects[projectTag].files.push(files[j]);
                    }

                    loadFiles();
                    return;
                }

                if (!['GETCODE', 'GETCMDOPTIONS'].includes(code.type)) {
                    bin.innerHTML = '';
                    var obj = JSON.parse(result);
                    if (obj['error'] !== '') throwError(obj['error']);
                    http(obj['result']);
                }

                onready();
            }
        };

        xhr.send(JSON.stringify(code));
    }
    else if (func === "GET") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", address);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                bin.innerHTML = xhr.responseText;
                var result = bin.innerHTML;
                bin.innerHTML = '';

                var obj = JSON.parse(result);
                if (obj['error'] !== '') throwError(obj['error']);
                http(obj['result']);
            }
        };

        xhr.send(JSON.stringify(code));
    }
}

// File viewer
function saveCurrScript() {
    const code = {
        type: "SAVESCRIPT",
        tag: cPos.currProject,
        script: {
            tag: cPos.currScript,
            code: getCode()
        }
    };
    CurlPythonServer(code);
}
function compileCurrProject() {
    const code = {
        type: "COMPILE",
        tag: cPos.currProject
    };

    CurlPythonServer(code);
}
function loadFiles() {
    file_viewer.innerHTML = '';
    projectCount = 0;
    fileCount = 0;

    for (let project in loadedProjects.projects) {
        projectCount++;
        file_viewer.innerHTML += `<button id="_p${projectCount}" class="file folder" role="button" onclick="clickProject('${project}')"><img src="img/folder.png" style="width: 15px; height: 15px;">${project}</button>`;
        const currProject = loadedProjects.projects[project];

        if (currProject.open)
            for (let file of currProject.files) {
                fileCount++;
                file_viewer.innerHTML += `<button id="_f${fileCount}" class="file" role="button" onclick="clickScript('${project}', '${file}')" style="padding-left: 30px"><img src="img/SimpleC_icon.png" style="width: 10px; height: 10px;">${file}</button>`;
            }
    }
}
function removeFiles() {
    loadedProjects = {};
    for (let i = 1; i < fileCount + 1; i++) {
        var file = document.getElementById(`_f${i}`);
        if (file !== undefined)
            file.remove();
    }
    for (let i = 1; i < projectCount + 1; i++) {
        var project = document.getElementById(`_p${i}`);
        if (project !== undefined)
            project.remove();
    }
}
function clickProject(project) {
    loadedProjects.projects[project].open = !loadedProjects.projects[project].open;
    loadFiles();
}
async function clickScript(project, script) {
    cPos.currProject = project;
    cPos.currScript = script;

    const code = {
        type: "GETCODE",
        project: project,
        script: script
    }
    await CurlPythonServer(code, c.server, "POST", () => {
        var res = bin.innerHTML;
        bin.innerHTML = '';

        // Load script into the editor
        var obj = JSON.parse(res);
        if (obj['error'] !== '') throwError(obj['error']);

        loadCode(obj['result']);
        updateCursor(0, false);
        lexing(final_code);

        // Display lines
        var str = '';
        for (let i = 1; i < lineData.length + 1; i++)
            str += i > 1 ? "\n" + i : i;

        document.getElementById("lines").innerText = str;
    });
}
export async function submitFile(path) {
    var code = {
        type: "SUBMITFILE",
        path: path
    }
    await CurlPythonServer(code);
    removeFiles();

    var code = { type: "LOADPROJECTS" };
    CurlPythonServer(code);
}
function submitLib(event) {
    if (realFileBtn.value) {
        const file = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        if (!file.includes('.txt')) {
            throwError(`The format of ${file} is not supported!<br>You can only upload .txt files.`);
            return;
        }
        if (!file.includes('.sc')) {
            throwError(`Please use the right script format for ${file}!<br>Use the '.sc' format.`);
            return;
        }

        var reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const result = event.target.result;

            var fileParts = file.split('.');
            info("Uploading: " + fileParts[0] + '.' + fileParts[1]);
            const code = {
                type: "UPLOADLIB",
                lib: fileParts[0] + '.' + fileParts[1],
                code: result
            }
            CurlPythonServer(code);
        });
        reader.readAsText(event.target.files[0]);
        realFileBtn.value = "";
    }
}
async function deleteFile(path) {
    var code = {
        type: "DELETEFILE",
        path: path
    }
    await CurlPythonServer(code);
    removeFiles();

    cPos.currScript = '';
    cPos.currProject = '';
    loadCode('');
    var code = { type: "LOADPROJECTS" };
    CurlPythonServer(code);
}
async function deleteLib(lib) {
    var code = {
        type: "DELETELIB",
        lib: lib
    }
    await CurlPythonServer(code);
}

// Editor functions
function genTok(idx, row, value, type) {
    return {
        idx: idx,
        rowPos: row,
        value: value,
        type: type
    };
}
function genLine(ln = 0, max_rowIdx = 0) {
    lineData.push({
        ln: ln,
        max_rowIdx: max_rowIdx
    });
}

function organizeCode() {
    var chars = Array.from(getCode());
    var openCBraketCount = 0;
    var openCBraket = false;

    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '{') {
            openCBraket = true;
            openCBraketCount++;
        }
        if (chars[i] === '}') {
            openCBraketCount--;
            openCBraket = openCBraketCount !== 0;
        }

        if (openCBraket && chars[i] === '\n' && chars[i + 1] !== ' ') {
            if (openCBraketCount > 0) {
                var totalCount = openCBraketCount;
                totalCount = chars[i + 1] === '}' ? totalCount - 1 : totalCount;

                for (let j = 0; j < totalCount; j++)
                    chars[i] += '   ';
            }
        }
    }

    var finalStr = '';
    chars.forEach(c => finalStr += c);
    current_code = finalStr;
    updateCursor(0, false);
    lexing(final_code);
}
function highlight_code(tokens) {
    var output = '<p>';
    tokens.forEach(token => {
        //console.log(token);

        if ([c.newline, c.whitespace].includes(token.type))
            output += '<span>';
        else
            output += '<span style="color: ';

        switch (token.type) {
            case c.operator:
                output += '#bffaa0; text-shadow: 0 0 5px #bffaa0; #C8C8C8;">';
                break;
            case c.keyword:
                output += '#faa0ec; text-shadow: 0 0 5px #faa0ec;">';
                break;
            case c.metacode:
                output += '#ac77ed; text-shadow: 0 0 5px #ac77ed;">';
                break;
            case c.vartype:
                output += '#91abff; text-shadow: 0 0 5px #91abff;">';
                break;
            case c.identifier:
                output += '#72ceed; text-shadow: 0 0 5px #72ceed;">';
                break;
            case c.textelement:
                output += '#dbdbdb; text-shadow: 0 0 5px #dbdbdb;">';
                break;
            case c.text:
                output += '#f0c141; text-shadow: 0 0 5px #f0c141;">';
                break;
            case c.number:
                output += '#ffde85; text-shadow: 0 0 5px #ffde85;">';
                break;
            case c.comment:
                token.value = token.value.replace(/\n/i, '<br>');
                output += '#507a43; text-shadow: 0 0 5px #507a43;">';
                break;
            case c.whitespace:
                output += '&nbsp;';
                break;
            case c.newline:
                output += '<br>';
                break;
            case c.selectedChar:
                output += '#eb4034; text-shadow: 0 0 5px #eb4034;">'
                break;
            case c.functionCall:
                output += '#fce562; text-shadow: 0 0 5px #fce562;">';
                break;
            case c.byteexpr:
                output += '#81948e; text-shadow: 0 0 5px #81948e;">';
                break;
            case c._typeof:
                output += '#8be05a; text-shadow: 0 0 5px #8be05a;">';
                break;
        }

        output += token.value;
        output += '</span>';
    });
    output += '</p>';

    var code = document.getElementById("output");
    code.innerHTML = output;
}
function lexing(code) {
    // Reset data
    lineData = [];

    // Generating tokenlist
    var ln = 0;
    var row = -1;
    var idx = -1;
    var tokens = [];

    // Data of the current token
    var char = undefined;
    var type = undefined;
    var value = undefined;

    // Lexing cases
    var isDotAccess = false;
    var isByte = false;

    // Functions
    const advance = (advFrom = 'std while') => {
        if (idx + 1 < code.length) {
            idx++;
            row++;
            char = code[idx];
        }
        else
            char = c.EOF;

        //console.log(char + " : Advace from '" + advFrom + "'");
        return char;
    }
    const genIdentifier = () => {
        var str = '';

        //console.log(`Check if ${char} is inside ${letters} : ${(letters + '_').includes(char)}`);
        while ((c.letters_digits + '_').includes(char)) {
            str += char;
            advance();
        }

        // Determin the token type
        type = c.keywords.includes(str) ? c.keyword : c.identifier;
        type = c.metaKeywords.includes(str) ? c.metacode : type;
        type = c.types.includes(str) ? c.vartype : type;
        type = c.typeofTypes.includes(str) ? c._typeof : type;
        type = Number.isInteger(Number.parseInt(str)) ? c.number : type;

        // Special cases
        if (type === c.identifier) {
            type = char === c.codeStructure.leftB ? c.functionCall : type;
        }
        if (type === c.number) {
            type = isByte ? c.byteexpr : type;
        }

        isDotAccess = false;
        isByte = false;
        value = str;
    }
    const genCommentOrDivide = () => {
        var str = char;
        type = c.operator;
        advance();

        if (char === c.ops.DIVIDE) {
            while (true) {
                if ([c.EOF, c.NL].includes(char))
                    break;
                str += char;
                advance();
            }

            type = c.comment;
        }
        else if (char === c.ops.MULTIPLY) {
            str += char;
            advance();

            while (true) {
                if (char === c.EOF) break;
                if (char === c.ops.MULTIPLY) {
                    str += char;
                    advance();

                    if (char === c.ops.DIVIDE) {
                        str += char;
                        advance();
                        break;
                    }
                }

                if (char === c.NL)
                    str += "<br>";
                else
                    str += char;

                advance();
            }

            type = c.comment;
        }

        value = str;
    }
    const genString = () => {
        var str = char;
        advance();

        while (true) {
            if (char === c.NL) {
                str += "<br>";
                advance();
                continue;
            }

            if ([c.EOF].includes(char)) break;
            else if (char === c.ops.QUOTE) {
                str += char;
                advance();
                break;
            }

            str += char;
            advance();
        }

        type = c.text;
        value = str;
    }
    const genChar = () => {
        var str = char;

        advance();
        str += char;
        advance();

        if (char === c.ops.SQUOTE) {
            str += char;
            advance();
        }

        value = str;
        type = c.text;
    }

    // Loop through all the characters
    while (true) {
        //console.warn(char);
        if (char === c.EOF) break;

        switch (char) {
            case c.ops.PLUS:
            case c.ops.MINUS:
            case c.ops.MULTIPLY:
            case c.ops.MODULUS:
            case c.ops.POWER:
            case c.ops.EQUALS:
            case c.ops.ISEQUALTO:
            case c.ops.NOT:
            case c.ops.LESS:
            case c.ops.GREATER:
            case c.ops.AND:
            case c.ops.OR:
            case c.ops.COLON:
                type = c.operator;
                value = char;
                advance();
                break;
            case c.ops.DOT:
                isDotAccess = true;
                type = c.operator;
                value = char;
                advance();
                break;
            case c.NL:
                // Update line
                ln++;
                row = 0;

                // Safe the newline token
                value = c.NL;
                type = c.newline;
                advance();
                break;
            case c.ops.DIVIDE:
                genCommentOrDivide();
                break;
            case c.codeStructure.leftCB:
            case c.codeStructure.rightCB:
            case c.codeStructure.leftSB:
            case c.codeStructure.rightSB:
            case c.codeStructure.leftB:
            case c.codeStructure.rightB:
            case c.codeStructure.hashtag:
            case c.codeStructure.endcolumn:
            case c.codeStructure.comma:
                type = c.textelement;
                value = char;
                advance();
                break;
            case c.ops.BYTESTART:
                isByte = true;
                type = c.operator;
                value = char;
                advance();
                break;
            case c.ops.QUOTE:
                genString();
                break;
            case c.ops.SQUOTE:
                genChar();
                break;
            case undefined:
            case ' ':
                type = c.whitespace;
                value = '';
                advance();
                break;
            case c.codeStructure.selected:
                type = c.selectedChar;
                value = '@'
                advance();
                break;
            default:
                genIdentifier();
                break;
        }

        tokens.push(genTok(idx, row, value, type));
        if (lineData.every(l => l.ln !== ln))
            genLine(ln, row);
        else
            lineData[ln].max_rowIdx = row;
    }

    tokens.shift();
    highlight_code(tokens);
}

// Coding functions
function getLineIdx() {
    var beforeCursor = current_code.substring(0, cPos.idx);

    var newlineCount = 1;
    Array.from(beforeCursor).forEach(c => { if (c === '\n') newlineCount++ });

    //console.log(newlineCount);
    cPos.lnIdx = newlineCount;
}
function updateCursor(newIdx, typeing = true) {
    if (newIdx > 0) {
        if (cPos.idx + newIdx > current_code.length - 1)
            cPos.idx = current_code.length - 1;
        else
            cPos.idx += newIdx;
    }
    else if (newIdx < 0) {
        if (cPos.idx + newIdx < 0)
            cPos.idx = 0;
        else
            cPos.idx += newIdx;
    }

    if (!typeing) {
        if (cPos.Control && newIdx !== 0) {
            if (cPos.clipboardStart === undefined) {
                cPos.clipboardStart = cPos.idx - newIdx;
            }
            cPos.clipboardEnd = cPos.idx + newIdx;

            var start = newIdx > 0 ? cPos.clipboardStart : cPos.clipboardStart + 1;
            var end = newIdx > 0 ? cPos.clipboardEnd + 1 : cPos.clipboardEnd;
            cPos.clipboardCode = current_code.substring(start, end);
        }
        else if (!cPos.Control && newIdx !== 0) {
            cPos.clipboardStart = undefined;
            cPos.clipboardEnd = undefined;
            cPos.clipboardCode = '';
        }
    }

    if (cPos.idx > current_code.length - 1)
        cPos.idx = current_code.length - 1;

    getLineIdx();
    final_code = replaceAt(cPos.idx, '@', [
        genReplacement('"', cPos.clipboardStart),
        genReplacement('"', cPos.clipboardEnd)
    ]);
}
function addCharTocode(char, idx = 0) {
    var strArray = [];
    var finalStr = '';
    strArray = Array.from(current_code);

    if (strArray.length === 0) {
        current_code = char;
        return;
    }

    for (let i = 0; i < strArray.length; i++) {
        if (i === idx) {
            switch (char) {
                case '{':
                    finalStr += '{}';
                    break;
                case '[':
                    finalStr += '[]';
                    break;
                case '(':
                    finalStr += '()';
                    break;
                default:
                    finalStr += char;
                    break;
            }
        }

        finalStr += strArray[i];
    }

    current_code = finalStr;
    return;
}
function loadCode(newCode) {
    if (newCode.charAt(newCode.length - 1) === ' ')
        current_code = newCode;
    else
        current_code = newCode + ' ';

    document.getElementById("currFile").innerHTML = cPos.currProject + "/" + cPos.currScript;
}

// Code stuff
function genReplacement(replacement, atIdx) {
    return {
        replacement: replacement,
        atIdx: atIdx
    };
}
function replaceAt(idx, char, moreChanges = []) {
    var strArray = Array.from(current_code);
    if (strArray[idx] === '\n')
        strArray[idx] = char + '\n';
    else
        strArray[idx] = char;

    // More changes at once
    if (moreChanges.length > 0) {
        moreChanges.forEach(change => {
            strArray[change.atIdx] = change.replacement;
        });
    }

    cPos.moveDir = 0;
    var finalStr = '';
    strArray.forEach(c => finalStr += c);
    return finalStr;
}

// Terminal stuff
export function throwWarn(msg) {
    terminal_output.innerHTML += `<br><span style="color: #f5e942; text-shadow: 0 0 5px #f5e942;"><img src="img/warning.png" style="width: 15px; height: 15px; padding-right: 10px;">Warning:<br>   ${msg}</span><br>`;
}
export function throwError(msg) {
    terminal_output.innerHTML += `<br><span style="color: #eb4034; text-shadow: 0 0 5px #eb4034;"><img src="img/error.png" style="width: 15px; height: 15px; padding-right: 10px;">Error:<br>   ${msg}</span><br>`;
}
export function unique_info(msg) {
    terminal_output.innerHTML += `<br><span style="color: #8035e8; text-shadow: 0 0 5px #8035e8;">${msg}</span>`;
}
export function info(msg) {
    terminal_output.innerHTML += `<br><span style="color: #e6dabc; text-shadow: 0 0 5px #e6dabc;"><img src="img/info.png" style="width: 15px; height: 15px; padding-right: 10px;">${msg}</span>`;
}
export function printTxt(msg) {
    terminal_output.innerHTML += `<br><span style="color: #8f8f8f; text-shadow: 0 0 5px #8f8f8f;">${msg}</span>`;
}
export async function http(msg) {
    if (!msg) return;
    var finalStr = msg.split('\n');

    var image = finalStr.length < 50;
    var maxLooptime = 1000;
    var currLooptime = 0;
    for (let res of finalStr) {
        if (maxLooptime > currLooptime) {
            if (image)
                terminal_output.innerHTML += `<br><span style="color: #c8fa70; text-shadow: 0 0 5px #c8fa70;"><img src="img/connection.png" style="width: 15px; height: 15px; padding-right: 10px;">${res}</span>`;
            else
                terminal_output.innerHTML += `<br><span style="color: #c8fa70; text-shadow: 0 0 5px #c8fa70;">${res}</span>`;
        }
        else {
            terminal_output.innerHTML += `<br><span style="color: #c8fa70; text-shadow: 0 0 5px #c8fa70;"><img src="img/connection.png" style="width: 15px; height: 15px; padding-right: 10px;">... (${finalStr.length - 1001} more entries)</span>`;
            break;
        }

        currLooptime++;
    }
}
function processTerminal(code) {
    terminal_input.value = '';
    info(code);

    // Spllitting command
    var items = code.split(' ');

    // Checking grammar
    if (!c.commands.includes(items[0])) {
        throwError(`The command token '${items[0]}' is not valid!`);
        return;
    }

    // Excute commands
    const Args = (args) => {
        var returnVal = '';
        var address = '';
        var printRes = false;

        for (let i = 1; i < args.length; i++) {
            switch (args[i]) {
                case '-d':
                    for (let j = i + 1; j < args.length; j++)
                        returnVal += args[j] + ' ';

                    return {
                        returnVal: returnVal,
                        address: address,
                        printRes: printRes
                    };
                case '-a':
                    i++;
                    address = args[i];
                    console.log(address);
                    break;
                case '-this':
                    returnVal = cPos.currProject;
                    break;
                case '-p':
                    printRes = true;
                    break;
            }
        }

        return {
            returnVal: returnVal,
            address: address,
            printRes: printRes
        };
    };

    var obj = {
        returnVal: undefined,
        address: undefined,
        printRes: false
    };
    switch (items[0]) {
        case 'load':
            obj = Args(items);
            info("Loading code");

            current_code = obj.returnVal + ' ';
            updateCursor(0, false);
            lexing(final_code);
            break;
        case 'compile':
            obj = Args(items);

            if (!obj.address) {
                throwError("Compile command needs an address token!");
                return;
            }
            if (!obj.returnVal) {
                throwError("Compile command needs a value to compile!");
                return;
            }

            var code = {
                type: "COMPILE",
                tag: obj.returnVal
            }
            CurlPythonServer(code, obj.address);
            break;
        case 'log':
            obj = Args(items);

            if (!obj.returnVal) {
                throwError("Log command needs a value to log!");
                return;
            }

            console.log(obj.returnVal);
            break;
        case 'run':
            var code = { type: "RUN" };
            CurlPythonServer(code, c.server, 'GET');
            return;
        case 'clear':
            terminal_output.innerHTML = '';
            return;
        case 'rmfile':
            obj = Args(items);

            if (!obj.returnVal) {
                throwError("Rmfile command needs a file path!");
                return;
            }

            deleteFile(obj.returnVal);
            break;
        case 'rmlib':
            obj = Args(items);

            if (!obj.returnVal) {
                throwError("Rmlib command needs a file path!");
                return;
            }

            deleteLib(obj.returnVal);
            break;
        case 'curlInfo':
            if (items.length < 2) {
                throwError("CurlInfor command needs value.");
                return;
            }

            var value = items[1];
            if (!["true", "false"].includes(value)) {
                throwError("Value needs to be a boolean.");
                return;
            }

            cPos.options.showCurlInfo = (value === 'true');
            info("Showing curl information: " + value);
            sendCmdOptions();
            break;
    }

    if (obj.printRes) printTxt(obj.returnVal);
}
function sendCmdOptions() {
    const code = {
        type: "SETCMDOPTIONS",
        options: cPos.options
    }
    CurlPythonServer(code);
}
async function getCmdOptions() {
    const code = {
        type: "GETCMDOPTIONS"
    }
    await CurlPythonServer(code, c.server, 'POST', () => {
        var res = bin.innerHTML;
        bin.innerHTML = '';

        // Loading options
        var obj = JSON.parse(res);
        var options = obj['result'];
        if (obj['error'] !== '') throwError(obj['error']);

        // Setting option values
        cPos.options.showCurlInfo = options.showCurlInfo;
    });
}

// Initializing code
function bodyInit() {
    // Set up objects
    terminal_input = document.getElementById("terminal_input");
    terminal_output = document.getElementById("terminal_output");
    file_viewer = document.getElementById("file_viewer");
    bin = document.getElementById("bin");
    realFileBtn = document.getElementById("real-file");
    uploadLib = document.getElementById("uploadLib");

    // Terminal information
    info("Called init function.");
    info("///////////////////////////////////////////");
    info("  Welcome to the SimpleC Code Editor v0.9.5");
    info("///////////////////////////////////////////<br><br>");

    // Loading server data
    cPos.options.showCurlInfo = false;
    const code = { type: "LOADPROJECTS" };
    CurlPythonServer(code);
    getCmdOptions();

    // Object Events
    uploadLib.addEventListener("click", function () {
        realFileBtn.click();
    });
    realFileBtn.addEventListener("change", function (event) {
        submitLib(event);
    });
}
function init() {
    console.log("Called init function.");

    // Set up document
    window.getCode = getCode;
    window.clickProject = clickProject;
    window.clickScript = clickScript;
    window.bodyInit = bodyInit;

    // Key events
    document.addEventListener('keydown', function (e) {
        // Deselect any selected object when typeing
        if (!["terminal_input", "cF-Input"].includes(document.activeElement.id))
            document.activeElement.blur();

        // Deny editor control when specific elements are selected
        if (["terminal_input", "cF-Input"].includes(document.activeElement.id) && cPos.allowedToType) {
            cPos.allowedToType = false;
            unique_info("Allow typing: " + cPos.allowedToType);
        }

        if (e.code === 'Escape') {
            cPos.allowedToType = !cPos.allowedToType;
            unique_info("Allow typing: " + cPos.allowedToType);
        }
        if (e.code === 'Enter' && !cPos.allowedToType) {
            terminal_input.value = terminal_input.value.replace('\n', '');
            var terminalText = terminal_input.value;

            if (['', '\n', ' '].includes(terminalText)) return;
            processTerminal(terminalText);
        }

        if (!cPos.allowedToType && !cPos.Control) return;

        switch (e.code) {
            case 'AltRight':
            case 'AltLeft':
            case 'ControlLeft':
            case 'ControlRight':
            case 'ShiftRight':
            case 'ShiftLeft':
                var keycode = e.code.includes('Right') ? e.code.replace('Right', 'Left') : e.code;
                keycode = e.code.includes('Control') ? 'Control' : keycode;
                cPos[keycode] = true
                break;
            case 'Enter':
                addCharTocode('\n', cPos.idx);
                updateCursor(1);
                cPos.lnIdx++;
                break;
            case 'Backspace':
                if (cPos.ShiftLeft) {
                    for (let i = 0; i < cPos.fastShift; i++) {
                        if (cPos.idx <= 0) break;
                        current_code = current_code.removeAt(cPos.idx - 1);
                        updateCursor(-1);
                    }
                    break;
                }
                if (cPos.idx - 1 >= 0) {
                    current_code = current_code.removeAt(cPos.idx - 1);
                    updateCursor(-1);
                }
                break;
            case 'Delete':
                if (cPos.ShiftLeft) {
                    for (let i = 0; i < cPos.fastShift; i++) {
                        if (current_code.length > 0 && cPos.idx < current_code.length - 2)
                            current_code = current_code.removeAt(cPos.idx + 1);
                    }
                    break;
                }
                if (current_code.length > 0 && cPos.idx < current_code.length - 2)
                    current_code = current_code.removeAt(cPos.idx + 1);
                break;
            case 'ArrowLeft':
                if (cPos.ShiftLeft)
                    updateCursor(-cPos.fastShift, false);
                else
                    updateCursor(-1, false);
                break;
            case 'ArrowRight':
                if (cPos.ShiftLeft)
                    updateCursor(cPos.fastShift, false);
                else
                    updateCursor(1, false);
                break;
            case 'ArrowUp':
                if (cPos.lnIdx > 1) {
                    cPos.lnIdx--;
                    cPos.idx -= lineData[cPos.lnIdx].max_rowIdx;
                }
                break;
            case 'ArrowDown':
                if (cPos.lnIdx < lineData.length) {
                    cPos.lnIdx++;
                    cPos.idx += lineData[cPos.lnIdx - 1].max_rowIdx;
                }
                break;
            case 'KeyB':
                if (cPos.AltLeft) {
                    if (cPos.currProject === '' || cPos.currScript === '') break;
                    compileCurrProject();
                    break;
                }
            case 'KeyS':
                if (cPos.AltLeft) {
                    if (cPos.currProject === '' || cPos.currScript === '') {
                        throwWarn("No script is opened!");
                        break;
                    }

                    organizeCode();
                    saveCurrScript();
                    break;
                }
            default:
                var char = c.getCharFromKeycode(e.code);

                if (!char || cPos.Control) break;

                if (cPos.AltLeft) {
                    if (c.altChars.hasOwnProperty(char))
                        addCharTocode(c.altChars[char], cPos.idx);
                }
                else if (cPos.ShiftLeft) {
                    if (c.shiftChars.hasOwnProperty(char))
                        addCharTocode(c.shiftChars[char], cPos.idx);
                    else
                        addCharTocode(char.toUpperCase(), cPos.idx);
                }
                else {
                    addCharTocode(char, cPos.idx);
                }

                updateCursor(1);
                break;
        }

        updateCursor(0, false);
        lexing(final_code);

        // Display lines
        var str = '';
        for (let i = 1; i < lineData.length + 1; i++)
            str += i > 1 ? "\n" + i : i;

        document.getElementById("lines").innerText = str;
    });
    document.addEventListener('copy', (e) => {
        if (!cPos.allowedToType) return;

        info("Copied to clipboard...");
        clipboard = cPos.clipboardCode;
    });
    document.addEventListener('paste', (e) => {
        if (!cPos.allowedToType) return;

        const text = clipboard;
        info("Pasted text. Press any button...");
        addCharTocode(text, cPos.idx);
        cPos.idx += text.length;
    });
    document.addEventListener('keyup', function (e) {
        if (!cPos.allowedToType) return;

        switch (e.code) {
            case 'AltRight':
            case 'AltLeft':
            case 'ShiftRight':
            case 'ShiftLeft':
            case 'ControlLeft':
            case 'ControlRight':
                var keycode = e.code.includes('Right') ? e.code.replace('Right', 'Left') : e.code;
                keycode = e.code.includes('Control') ? 'Control' : keycode;
                cPos[keycode] = false;
                break;
        }
    });
}
function getCode() {
    return current_code;
}

init();

// TODOs:
/////////////////////////////////////////////////////////////////////////////////////////
//
// Bei mehrzeiligen Strings bzw. Kommentarbl??cken werden die Zeilen nicht erkannt.
//
/////////////////////////////////////////////////////////////////////////////////////////
