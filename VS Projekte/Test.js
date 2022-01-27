const { comment, identifier } = require("./Constant.js");
var c = require("./Constant.js");
console.log(c);
String.prototype.removeAt = c.removeAt;

// Editor data
var lineData = [];
var current_code = ' ';
var final_code = '';
const cPos = {
    idx : 0,
    lnIdx : 1,
    'AltLeft' : false,
    'ShiftLeft' : false,
    fastShift : 5,
    clipboardStart : undefined,
    clipboardEnd : undefined,
    clipboardCode : ''
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
function genLine(ln=0, max_rowIdx=0) {
    lineData.push({
        ln : ln,
        max_rowIdx : max_rowIdx
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
                output += '#bffaa0;">';
                break;
            case c.keyword:
                output += '#faa0ec;">';
                break;
            case c.metacode:
                output += '#ac77ed">';
                break;
            case c.vartype:
                output += '#91abff;">';
                break;
            case c.identifier:
                output += '#72ceed;">';
                break;
            case c.textelement:
                output += '#dbdbdb;">';
                break;
            case c.text:
                output += '#f0c141;">';
                break;
            case c.number:
                output += '#ffde85;">';
                break;
            case c.comment:
                token.value = token.value.replace(/\n/i, '<br>');
                output += '#507a43;">';
                break;
            case c.whitespace:
                output += '&nbsp;';
                break;
            case c.newline:
                output += '<br>';
                break;
            case c.selectedChar:
                output += '#eb4034">'
                break;
            case c.functionCall:
                output += '#fce562">';
                break;
            case c.byteexpr:
                output += '#81948e">';
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
    allNewlines = [];

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
    const advance = (advFrom='std while') => {
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
    Array.from(beforeCursor).forEach(c => { if (c === '\n') newlineCount++});
    
    //console.log(newlineCount);
    cPos.lnIdx = newlineCount;
}
function updateCursor(newIdx) {
    if (newIdx > 0) {
        if (cPos.idx + newIdx > current_code.length -1)
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

    if (cPos.AltLeft && newIdx !== 0) {
        if (cPos.clipboardStart === undefined) {
            cPos.clipboardStart = cPos.idx - newIdx;
        }
        cPos.clipboardEnd = cPos.idx + newIdx;

        cPos.clipboardCode = current_code.substring(cPos.clipboardStart, cPos.clipboardEnd);
    }
    else if (!cPos.AltLeft && newIdx !== 0) {
        cPos.clipboardStart = undefined;
        cPos.clipboardEnd = undefined;
        cPos.clipboardCode = '';
    }

    getLineIdx();
    final_code = replaceAt(cPos.idx, '@', [
        genReplacement('"', cPos.clipboardStart),
        genReplacement('"', cPos.clipboardEnd)
    ]);
}
function addCharTocode(char, idx=0) {
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

function genReplacement(replacement, atIdx) {
    return {
        replacement : replacement,
        atIdx : atIdx
    };
}
function replaceAt(idx, char, moreChanges=[]) {
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

// Initializing code
function init() {
    console.log("Called init function.");
    
    // Set up document
    window.getCode = getCode;

    // Key events
    document.addEventListener('keydown', function (e) {
        //console.log(e.code);

        switch (e.code) {
            case 'AltRight':
            case 'AltLeft':
            case 'ShiftRight':
            case 'ShiftLeft':
                var keycode = e.code.includes('Right') ? e.code.replace('Right', 'Left') : e.code;
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
                if (cPos.idx -1 >= 0) {
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
                    updateCursor(-cPos.fastShift);
                else
                    updateCursor(-1);
                break;
            case 'ArrowRight':
                if (cPos.ShiftLeft)
                    updateCursor(cPos.fastShift);
                else
                    updateCursor(1);
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
            case 'KeyV':
                if (cPos.AltLeft) {
                    setTimeout(async () => {
                        const text = await navigator.clipboard.readText();
                        addCharTocode(text, cPos.idx);
                        cPos.idx += text.length;
                      }, 2000);
                }
                break;
            case 'KeyC':
                if (cPos.AltLeft) {
                    navigator.clipboard.writeText(cPos.clipboardCode);
                    //console.log(cPos.clipboardCode);
                }
                break;
            default:
                var char = c.getCharFromKeycode(e.code);

                if (!char) break;

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

        updateCursor(0, true);
        lexing(final_code);
        
        // Display lines
        var str = '';
        for (let i = 1; i < lineData.length + 1; i++)
            str += i > 1 ? "\n" + i : i;

        document.getElementById("lines").innerText = str;
    });
    document.addEventListener('keyup', function (e) {
        switch (e.code) {
            case 'AltRight':
            case 'AltLeft':
            case 'ShiftRight':
            case 'ShiftLeft':
                var keycode = e.code.includes('Right') ? e.code.replace('Right', 'Left') : e.code;
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
/////////////////////////////////////////////////////////////////////////////////////////
