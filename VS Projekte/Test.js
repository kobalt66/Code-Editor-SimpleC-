//const c = require("./Constant.js");
import { c } from "./Constant.js"
String.prototype.removeAt = c.removeAt;

// Editor data
var lineData = [];
var current_code = ' ';
var final_code = '';
var clipboard = '';

var terminal_input = null;
var terminal_output = null;
var file_viewer = null;
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
    currScript : ''
}

// Send request to server
const CurlPythonServer = async (code, address = c.server, func = "POST") => {
    unique_info(`[${func}] Curl on ${address}`);

    if (func === "POST") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", address);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4)
                http(xhr.responseText);
        };

        xhr.send(JSON.stringify(code));
        http(xhr.responseText);
    }
    else if (func === "GET") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", address);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4)
                http(xhr.responseText);
        };

        xhr.send();
        http(xhr.responseText);
    }
}

// File viewer
const test_fileViewer = {
    projects : {
        "project1" : {
            open : false,
            files : [
                "test.sc",
                "test2.sc"
            ]
        },
        "project2" : {
            open : false,
            files : [
            ]
        }
    }
};

function saveCurrFile() {
    let request = new XMLHttpRequest();
    request.open('POST', `${c.origin}/${cPos.currScript}`);
    request.send(getCode());
}
function loadFiles() {
    file_viewer.innerHTML = '';

    for (let project in test_fileViewer.projects) {
        file_viewer.innerHTML += `<button class="file folder" role="button" onclick="clickProject('${project}')"><img src="img/folder.png" style="width: 15px; height: 15px;">${project}</button>`;
        const currProject = test_fileViewer.projects[project];

        if (currProject.open)
            for (let file of currProject.files)
                file_viewer.innerHTML += `<button class="file" role="button" onclick="clickScript('${project}', '${file}')" style="padding-left: 30px"><img src="img/SimpleC_icon.png" style="width: 10px; height: 10px;">${file}</button>`;
    }
}
function clickProject(project) {
    test_fileViewer.projects[project].open = !test_fileViewer.projects[project].open;
    loadFiles();
}
function clickScript(project, script) {
    let request = new XMLHttpRequest();

    request.open('GET', `${c.origin}/Projects/${project}/${script}`);
    request.onload = () => {
        cPos.currScript = `Projects/${project}/${script}`;
        terminal_input.innerHTML = request.responseText;
        current_code = terminal_input.innerHTML + ' ';
        terminal_input.innerHTML = '';

        updateCursor(0, false);
        lexing(final_code);
    };

    request.send();
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
        if (i === idx)
            finalStr += char;

        finalStr += strArray[i];
    }

    current_code = finalStr;
    return;
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
function throwError(msg) {
    terminal_output.innerHTML += `<br><span style="color: #eb4034; text-shadow: 0 0 5px #eb4034;">Error:<br>   ${msg}</span><br>`;
}
function unique_info(msg) {
    terminal_output.innerHTML += `<br><span style="color: #8035e8; text-shadow: 0 0 5px #8035e8;">${msg}</span>`;
}
function info(msg) {
    terminal_output.innerHTML += `<br><span style="color: #e6dabc; text-shadow: 0 0 5px #e6dabc;">${msg}</span>`;
}
function printTxt(msg) {
    terminal_output.innerHTML += `<br><span style="color: #8f8f8f; text-shadow: 0 0 5px #8f8f8f;">${msg}</span>`;
}
function http(msg) {
    if (!msg) return;
    var finalStr = msg.split('\n');

    var maxLooptime = 1000;
    var currLooptime = 0;
    for (let res of finalStr) {
        if (maxLooptime > currLooptime) {
            terminal_output.innerHTML += `<br><span style="color: #c8fa70; text-shadow: 0 0 5px #c8fa70;">${res}</span>`;
        }
        else {
            terminal_output.innerHTML += `<br><span style="color: #c8fa70; text-shadow: 0 0 5px #c8fa70;">... (${finalStr.length - 1001} more entries)</span>`;
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
                    info("Loading code");
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
                    returnVal = getCode();
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

    var obj = null;
    switch (items[0]) {
        case 'load':
            obj = Args(items);

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

            const code = {
                code: obj.returnVal
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
            CurlPythonServer(getCode(), c.server, 'GET');
            return;
        case 'clear':
            terminal_output.innerHTML = '';
            return;
    }

    if (obj.printRes) printTxt(obj.returnVal);
}

// Initializing code
function bodyInit() {
    // Set up objects
    terminal_input = terminal_input === null ? document.getElementById("terminal_input") : terminal_input;
    terminal_output = terminal_output === null ? document.getElementById("terminal_output") : terminal_output;
    file_viewer = !file_viewer ? document.getElementById("file_viewer") : file_viewer;

    loadFiles();
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
        //console.log(e.code);
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
                keycode = e.code.includes('Control') ? 'Control' : e.code;
                cPos[keycode] = true;
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
                    // Send that request:
                    const code = {
                        code: getCode()
                    };

                    CurlPythonServer(code);
                }
            case 'KeyS':
                if (cPos.AltLeft)
                    saveCurrFile();
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
                keycode = e.code.includes('Control') ? 'Control' : e.code;
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
// Automatisches einrücken implementieren.
//
// Bei mehrzeiligen Strings bzw. Kommentarblöcken werden die Zeilen nicht erkannt.
//
// Error checking when compiling the script!
//
// ^ doesn't work in csharp!
//
/////////////////////////////////////////////////////////////////////////////////////////

/*
#lib = "custom_Lib"
private str msg = "Secret Message!";

public class Program {
   static function void Main(str args) {
      Console.WriteLine(msg);
   }
}

#define asdf "GLOBAL_STRING"

public class Program {
  static function void Main(str args) {
     int idx = 0;  
     while (true) {
       idx++;
       Console.WriteLine(idx);
       if (idx ? 200)@return;  
     }
  }
}

public class Program {
   static function void Main() {
      
   }
}
*/
