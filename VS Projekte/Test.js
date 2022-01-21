// Token types
const operator = 'operator';
const keyword = 'keyword';
const identifier = 'identifier';
const textelement = 'textelement';
const comment = 'comment';

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

const NL = '\n';
const TAB = '\t';
const EOF = 'endoffile';

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const letgits = letters + digits;

function genTok(row, value, type) {
    return {
        rowPos : row,
        value : value,
        type : type
    };
}

function lexing(code) {
    console.log(code);

    // Generating tokenlist
    var row = -1;
    var idx = -1;
    var ln = 0;
    var tokens = [];

    // Functions
    var char = 'none';
    var type = 'none';
    var value = 'none';

    const advance = () => {
        row++;
        idx++;
        char = idx + 1 <= code.length ? code[idx++] : EOF;
        return char;
    }
    const reverse = (count=1) => {
        if (idx - count <= 0) {
            row = 0;
            idx = 0;
        }
        row -= count;
        idx -= count;
        char = code[idx];
        return char;
    } 
    const genKeywordORIdentifier = () => {
        var str = '';

        while ((letgits + '_').includes(char) && char !== EOF)
            str.join(char);

        type = keywords.includes(str) ? keyword : identifier;
        value = str;
    }
    const genCommentOrDivide = () => {
        var str = char;
        advance();
        if (char !== DIVIDE) {
            reverse();
        }
        else if (char === DIVIDE) {
            type = comment;

            advance();
            str += char;
            
            while (currChar !== NL) {
                if (currChar === EOF)
                   break;
                advance();
                str += char;
            }

            advance();
            str += char;
        }
        else if (char === MULTIPLY) {
            type = comment;
            
            advance();
            str += char;

            while (currChar != EOF) {
                if (currChar === MULTIPLY) {
                    advance();
                    str += char;
                    if (currChar === DIVIDE)
                        break;
                }
                advance();
                str += char;
            }

            advance();
            str += char;
        }

        value = str;
    }

    // Loop through all the characters
    while (true) {
        advance();
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
            case QUOTE:
            case SQUOTE:
            case DOT:
            case AND:
            case OR:
            case BYTESTART:
            case COLON:
                type = operator
                value = char;
                break;
            case NL:
                ln++;
                row = 0;
                value = NL;
                type = textelement;
                break; 
            case letters.includes(char):
                genKeywordORIdentifier();
                break;
            case DIVIDE:
                genCommentOrDivide();
                break;
            default:
                value = char;
                type = textelement;
                break; 
        }
        tokens.push(genTok(row, value, type));
    }
}

function highlight_code(json) {

}

function getCode() {
    return document.getElementsByName("editor")[0].value;
}
