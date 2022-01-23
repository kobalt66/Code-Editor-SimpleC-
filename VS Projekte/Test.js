// Token types
const operator = 'operator';       // pale green
const keyword = 'keyword';         // dark pink
const vartype = 'type';            // dark blue
const identifier = 'identifier';   // light blue
const textelement = 'textelement'; // white
const text = 'text';               // dark orange
const number = 'number';           // pale yellow
const comment = 'comment';         // dark green
const newline = 'newline';
const whitespace = 'whitespace';

// Predefined token values
// Keywords
const keywords = [
    'if',
    'elif',
    'else',
    'while',
    'do',
    'for',
    'each',
    'class',
    'function',
    'struct',
    'public',
    'private',
    'protected',
    'const',
    'static',
    'void',
    'override',
    'operation',
    'return',
    'continue',
    'break',
    'sizeof',
    'typeof',
    'lenghtof',
    'using',
    'namespace',
    'null',
    'true',
    'false',
    'var',
    'byt',
    'chr',
    'str',
    'int',
    'flt',
    'dbl',
    'bol',
    'typ'
];

// Variable types
const types = [
    'var',
    'byt',
    'chr',
    'str',
    'int',
    'flt',
    'dbl',
    'bol',
    'typ',
    'void'
];

// Operations
const PLUS = '+';
const MINUS = '-';
const DIVIDE = '/';
const MULTIPLY = '*';
const MODULUS = '%';
const POWER = '^';
const ISEQUALTO = '?';
const EQUALS = '=';
const NOT = '!';
const LESS = '<';
const GREATER = '>';
const QUOTE = '"';
const SQUOTE = '\'';
const DOT = '.';
const OR = '|';
const AND = '&';
const BYTESTART = '$';
const COLON = ':';

const ops = [
    PLUS,
    MINUS,
    DIVIDE,
    MULTIPLY,
    MODULUS,
    POWER,
    ISEQUALTO,
    EQUALS,
    NOT,
    LESS,
    GREATER,
    QUOTE,
    SQUOTE,
    DOT,
    OR,
    AND,
    BYTESTART,
    COLON
];

// Code structure
const leftCB = '{';
const rightCB = '}';
const leftSB = '[';
const rightSB = ']';
const leftB = '(';
const rightB = ')';
const endcolumn = ';';
const comma = ',';
const hashtag = '#';

const codeStructure = [
    leftCB,
    rightCB,
    leftSB,
    rightSB,
    leftB,
    rightB,
    endcolumn,
    comma,
    hashtag
];

const NL = '\n';
const TAB = '\t';
const EOF = 'endoffile';

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const letgits = letters + digits;

function genTok(row, value, type) {
    return {
        rowPos: row,
        value: value,
        type: type
    };
}

function highlight_code(tokens) {
    var output = '<p>';
    tokens.forEach(token => {
        console.log(token);
        if ([newline, whitespace].includes(token.type))
            output += '<span>';
        else
            output += '<span style="color: ';

        switch (token.type) {
            case operator:
                output += '#bffaa0">';
                break;
            case keyword:
                output += '#faa0ec">';
                break;
            case vartype:
                output += '#91abff">';
                break;
            case identifier:
                output += '#72ceed">';
                break;
            case textelement:
                output += '#dbdbdb">';
                break;
            case text:
                output += '#c97026">';
                break;
            case number:
                output += '#ffde85">';
                break;
            case comment:
                token.value = token.value.replace(/\n/i, '<br>');
                output += '#507a43">';
                break;
            case whitespace:
                output += ' ';
                break;
            case newline:
                output += '<br>';
                break;
        }
        output += token.value;
        output += '</span>';
    });
    output += '</p>';

    var code = document.getElementById("code").contentWindow.document;
    document.body.onkeyup = function() {
        code.open();
        code.writeln(
            "<style>" +
            output + 
            "</script>"
        );
        code.close();
    };
}

function lexing(code) {
    console.clear();
    console.log(code);

    // Generating tokenlist
    var row = -1;
    var idx = -1;
    var tokens = [];

    // Data of the current token
    var char = undefined;
    var type = undefined;
    var value = undefined;

    // Functions
    const advance = (advFrom) => {
        if (idx + 1 < code.length) {
            idx++;
            row++;
            char = code[idx];
        }
        else
            char = EOF;
        //console.log(char + " : Advace from '" + advFrom + "'");
        return char;
    }
    const reverse = (count = 1) => {
        if (idx - count <= 0) {
            row = 0;
            idx = 0;
        }
        row -= count;
        idx -= count;
        char = code[idx];
        return char;
    }

    const genIdentifier = () => {
        var str = '';

        //console.log(`Check if ${char} is inside ${letters} : ${(letters + '_').includes(char)}`);
        while ((letgits + '_').includes(char)) {
            str += char;
            advance('genIdentifier');
        }

        type = keywords.includes(str) ? keyword : identifier;
        type = types.includes(str) ? vartype : type;
        type = Number.isInteger(Number.parseInt(str)) ? number : type;
        value = str;
    }
    const genCommentOrDivide = () => {
        var str = char;
        advance();
        if (char !== DIVIDE && char !== MULTIPLY) {
            value = str;
            return;
        }
        else if (char === DIVIDE) {
            type = comment;
            
            str += char;
            advance();
            str += char;
            
            while (char !== NL) {
                if (char === EOF)
                    break;
                advance();
                str += char;
            }
        }
        else if (char === MULTIPLY) {
            type = comment;
            
            str += char;
            advance();
            str += char;

            while (char != EOF) {
                if (char === MULTIPLY) {
                    advance();
                    if (char !== EOF)
                        str += char;
                    
                        if (char === DIVIDE) {
                        advance();
                        break;
                    }
                }
                advance();
                if (char !== EOF)
                    str += char;
            }
        }

        value = str;
    }

    // Loop through all the characters
    while (true) {
        //console.warn(char);
        if (char === EOF) break;

        switch (char) {
            case PLUS:
            case MINUS:
            case MULTIPLY:
            case MODULUS:
            case POWER:
            case EQUALS:
            case ISEQUALTO:
            case NOT:
            case LESS:
            case GREATER:
            case DOT:
            case AND:
            case OR:
            case BYTESTART:
            case COLON:
                type = operator;
                value = char;
                advance('std while (l.301)');
                break;
            case NL:
                row = 0;
                value = NL;
                type = newline;
                advance('std while (l.307)');
                break;
            case DIVIDE:
                genCommentOrDivide();
                break;
            case leftCB:
            case rightCB:
            case leftSB:
            case rightSB:
            case leftB:
            case rightB:
            case endcolumn:
            case hashtag:
            case comma:
                type = textelement;
                value = char;
                advance('std while (l.324)');
                break;
            case QUOTE:
            case SQUOTE:
                type = text;
                value = char;
                advance('std while (l.330)');
                break;
            case ' ':
            case undefined:
                type = whitespace;
                value = '';
                advance('std while');
                break;
            default:
                genIdentifier();
                break;
        }
        tokens.push(genTok(row, value, type));
    }

    highlight_code(tokens);
}

function getCode() {
    return document.getElementsByName("editor")[0].value;
}
