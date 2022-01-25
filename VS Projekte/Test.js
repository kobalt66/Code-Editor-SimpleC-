var c = require("./Constant.js");
console.log(c);
String.prototype.removeAt = c.removeAt;

// Editor data
var lineData = [];
var current_code = ' ';
var final_code = '';
const cPos = {
    idx : 0,
    'AltLeft' : false,
    'ShiftLeft' : false
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
function genLine(ln, max_rowIdx) {
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
                output += '#c97026;">';
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
        }
        
        output += token.value;
        output += '</span>';
    });
    output += '</p>';

    //lineData.forEach(l => console.log(l));
    var code = document.getElementById("output");
    code.innerHTML = output;
}

function lexing(code) {
    // Reset data
    //console.clear();
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
            advance('genIdentifier');
        }

        type = c.keywords.includes(str) ? c.keyword : c.identifier;
        type = c.types.includes(str) ? c.vartype : type;
        type = Number.isInteger(Number.parseInt(str)) ? c.number : type;
        value = str;
    }
    const genCommentOrDivide = () => {
        var str = char;
        advance();
        if (char === c.ops.DIVIDE) {
            type = c.comment;
            str += char;
            
            while (char !== c.NL) {
                advance();
                if ([c.EOF, c.NL].includes(char))
                    break;
                str += char;
            }
        }
        else if (char === c.ops.MULTIPLY) {
            type = c.comment;
            str += char;

            while (char != c.EOF) {
                if (char === c.ops.MULTIPLY) {
                    advance();
                    if (![c.EOF, c.NL].includes(char))
                        str += char;
                    
                    if (char === c.ops.DIVIDE) {
                        advance();
                        break;
                    }
                }
                advance();
                if (![c.EOF, c.NL].includes(char))
                    str += char;
            }
        }
        
        value = str;
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
            case c.ops.DOT:
            case c.ops.AND:
            case c.ops.OR:
            case c.ops.BYTESTART:
            case c.ops.COLON:
                type = c.operator;
                value = char;
                advance('std while (l.301)');
                break;
            case c.NL:
                // Update line
                ln++;
                row = 0;

                // Safe the newline token
                value = c.NL;
                type = c.newline;
                advance('std while (l.307)');
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
            case c.codeStructure.endcolumn:
            case c.codeStructure.hashtag:
            case c.codeStructure.comma:
                type = c.textelement;
                value = char;
                advance('std while (l.324)');
                break;
            case c.ops.QUOTE:
            case c.ops.SQUOTE:
                type = c.text;
                value = char;
                advance('std while (l.330)');
                break;
            case undefined:
            case ' ':
                type = c.whitespace;
                value = '';
                advance('std while');
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
    
    final_code = replaceAt(cPos.idx, '@');
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
function replaceAt(idx, char) {
    var strArray = Array.from(current_code);
    if (strArray[idx] === '\n')
        strArray[idx] = char + '\n';
    else
        strArray[idx] = char;

    var finalStr = '';
    strArray.forEach(c => finalStr += c);
    return finalStr;
}

// Initializing code
function init() {
    console.log("Called init function.");
    
    // Key events
    document.addEventListener('keydown', function (e) {
        //console.log(e.code);

        switch (e.code) {
            case 'AltLeft':
            case 'ShiftLeft':
                cPos[e.code] = true;
                break;
            case 'Enter':
                addCharTocode('\n', cPos.idx);
                updateCursor(1);
                break;
            case 'Backspace':
                if (cPos.idx -1 >= 0) {
                    current_code = current_code.removeAt(cPos.idx - 1);
                    updateCursor(-1);
                }
                break;
            case 'Delete':
                if (current_code.length > 0 && cPos.idx < current_code.length - 1)
                    current_code = current_code.removeAt(cPos.idx + 1);
                break;
            case 'ArrowLeft':
                if (cPos.ShiftLeft)
                    updateCursor(-5);
                else
                    updateCursor(-1);
                break;
            case 'ArrowRight':
                if (cPos.ShiftLeft)
                    updateCursor(5);
                else
                    updateCursor(1);
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

        updateCursor(0);
        lexing(final_code);
    });
    document.addEventListener('keyup', function (e) {
        switch (e.code) {
            case 'AltLeft':
            case 'ShiftLeft':
                cPos[e.code] = false;
                break;
        }
    });
}

init();

// TODOs:
/////////////////////////////////////////////////////////////////////////////////////////
// Comment bug: Wenn man in einer neuen Zeile / schreibt, wird dieses Zeichen in die folgende Zeile gerückt. 
//              Wenn man nun nochmal / eingibt, springt der Comment wieder in die richtige Zeile.
//              Kommentar blöcke funktionieren nicht.
//
// Pfeiltasten: Wenn man mit den Pfeiltasten durch den Code scrollt verschiebt man die Buchstaben.
//
// Erster geschriebenes Zeichen: Das erste geschriebene Zeichen wird anerkannt, aber der cursor wird nicht geupdated.
//
// Pfeiltasten: ArrowUp und ArrowDown Tasten implementieren.
//
// Ausnahmen: Dinge wie Strings oder dotaccess supporten, sodass diese eine andere Farbe haben!
//
// Metacode: Meta Keywords hinzufügen, sodass begriffe wie 'define' eine bestimmte farbe haben.
//
/////////////////////////////////////////////////////////////////////////////////////////
