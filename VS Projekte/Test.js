var c = require("./Constant.js");
console.log(c);

// Editor data
const currentPos = {
    currLn : 0,
    currRow : 0,
    'AltLeft' : false,
    'ShiftLeft' : false
}
var lineData = [];
var current_code = '';

// Editor functions
function genTok(row, value, type) {
    return {
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
                output += '#bffaa0">';
                break;
            case c.keyword:
                output += '#faa0ec">';
                break;
            case c.vartype:
                output += '#91abff">';
                break;
            case c.identifier:
                output += '#72ceed">';
                break;
            case c.textelement:
                output += '#dbdbdb">';
                break;
            case c.text:
                output += '#c97026">';
                break;
            case c.number:
                output += '#ffde85">';
                break;
            case c.comment:
                token.value = token.value.replace(/\n/i, '<br>');
                output += '#507a43">';
                break;
            case c.whitespace:
                output += '&nbsp;';
                break;
            case c.newline:
                output += '<br>';
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
    console.clear();
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
        if (char !== c.ops.DIVIDE && char !== c.ops.MULTIPLY) {
            value = str;
            return;
        }
        else if (char === c.ops.DIVIDE) {
            type = comment;
            
            str += char;
            advance();
            str += char;
            
            while (char !== c.NL) {
                if (char === c.EOF)
                    break;
                advance();
                str += char;
            }
        }
        else if (char === c.ops.MULTIPLY) {
            type = comment;
            
            str += char;
            advance();
            str += char;

            while (char != c.EOF) {
                if (char === c.ops.MULTIPLY) {
                    advance();
                    if (char !== c.EOF)
                        str += char;
                    
                        if (char === c.ops.DIVIDE) {
                        advance();
                        break;
                    }
                }
                advance();
                if (char !== c.EOF)
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
                // Save current line data
                genLine(ln, row);

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
            default:
                genIdentifier();
                break;
        }
        tokens.push(genTok(row, value, type));
    }
    
    tokens.shift();
    highlight_code(tokens);
}

function init() {
    console.log("Called init function.");
    document.addEventListener('keydown', function (e) {
        console.log(e.code);

        switch (e.code) {
            case 'AltLeft':
            case 'ShiftLeft':
                currentPos[e.code] = true;
                break;
            case 'Enter':
                current_code += '\n';
                break;
            case 'Backspace':
                if (current_code.length > 0)
                    current_code = current_code.slice(0, -1);
                break;
            default:
                var char = c.getCharFromKeycode(e.code);
                
                if (!char) break;

                if (currentPos.AltLeft) {
                    if (c.altChars.hasOwnProperty(char))
                        current_code += c.altChars[char];
                }
                else if (currentPos.ShiftLeft) {
                    if (c.shiftChars.hasOwnProperty(char))
                        current_code += c.shiftChars[char];
                    else
                        current_code += char.toUpperCase();
                }
                else {
                    current_code += char;
                }
                break;
        }

        lexing(current_code);
    });
    document.addEventListener('keyup', function (e) {
        switch (e.code) {
            case 'AltLeft':
            case 'ShiftLeft':
                currentPos[e.code] = false;
                break;
        }
    });
}

init();
