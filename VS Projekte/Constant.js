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

const ops = {
    PLUS : PLUS,
    MINUS : MINUS,
    DIVIDE : DIVIDE,
    MULTIPLY : MULTIPLY,
    MODULUS : MODULUS,
    POWER : POWER,
    ISEQUALTO : ISEQUALTO,
    EQUALS : EQUALS,
    NOT : NOT,
    LESS : LESS,
    GREATER : GREATER,
    QUOTE : QUOTE,
    SQUOTE : SQUOTE,
    DOT : DOT,
    OR : OR,
    AND : AND,
    BYTESTART : BYTESTART,
    COLON : COLON
};

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

const codeStructure = {
    leftCB : leftCB,
    rightCB : rightCB,
    leftSB : leftSB,
    rightSB : rightSB,
    leftB : leftB,
    rightB : rightB,
    endcolumn : endcolumn,
    comma : comma,
    hashtag : hashtag
};

const NL = '\n';
const TAB = '\t';
const EOF = 'endoffile';

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const letters_digits = letters + digits;

// If the shift or alt key is pressed specific characters will output special characters.
const shiftChars = {
    '1' : '!',
    '2' : '"',
    '4' : '$',
    '5' : '%',
    '6' : '&',
    '7' : '/',
    '8' : '(',
    '9' : ')',
    '0' : '=',
    '#' : '\'',
    '+' : '*',
    ',' : ';',
    '.' : ':',
    '-' : '_',
    '<' : '>'
}
const altChars = {
    '5' : '[',
    '6' : ']',
    '7' : '|',
    '8' : '{',
    '9' : '}',
    'l' : '@'
}

// Functions
function getCharFromKeycode(code) {
    switch (code) {
        case 'KeyA':
            return 'a';
        case 'KeyB':
            return 'b';
        case 'KeyC':
            return 'c';
        case 'KeyD':
            return 'd';
        case 'KeyE':
            return 'e';
        case 'KeyF':
            return 'f';
        case 'KeyG':
            return 'g';
        case 'KeyH':
            return 'h';
        case 'KeyI':
            return 'i';
        case 'KeyJ':
            return 'j';
        case 'KeyK':
            return 'k';
        case 'KeyL':
            return 'l';
        case 'KeyM':
            return 'm';
        case 'KeyN':
            return 'n';
        case 'KeyO':
            return 'o';
        case 'KeyP':
            return 'p';
        case 'KeyQ':
            return 'q';
        case 'KeyR':
            return 'r';
        case 'KeyS':
            return 's';
        case 'KeyT':
            return 't';
        case 'KeyU':
            return 'u';
        case 'KeyV':
            return 'v';
        case 'KeyW':
            return 'w';
        case 'KeyX':
            return 'x';
        case 'KeyY':
            return 'y';
        case 'KeyZ':
            return 'z';
        case 'Digit1':
            return '1';
        case 'Digit2':
            return '2';
        case 'Digit3':
            return '3';
        case 'Digit4':
            return '4';
        case 'Digit5':
            return '5';
        case 'Digit6':
            return '6';
        case 'Digit7':
            return '7';
        case 'Digit8':
            return '8';
        case 'Digit9':
            return '9';
        case 'Digit0':
            return '0';
        case 'Backslash':
            return '#';
        case 'Minus':
            return '?';
        case 'Comma':
            return ',';
        case 'Period':
            return '.';
        case 'Slash':
            return '-';
        case 'BracketRight':
            return '+';
        case 'IntlBackslash':
            return '<';
        case 'Backquote':
            return '^';
        case 'Space':
            return ' ';
    }
}

module.exports = {
    operator : operator, 
    keyword : keyword, 
    vartype : vartype, 
    identifier : identifier , 
    textelement : textelement, 
    text : text, 
    number : number, 
    comment : comment, 
    newline : newline, 
    whitespace : whitespace, 
    keywords : keywords,
    types : types,
    ops : ops,
    codeStructure : codeStructure,
    NL : NL,
    TAB : TAB,
    EOF : EOF,
    letters : letters,
    digits : digits,
    letters_digits : letters_digits,
    shiftChars : shiftChars,
    altChars : altChars,
    getCharFromKeycode : getCharFromKeycode
};