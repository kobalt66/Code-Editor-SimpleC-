// Token types
const operator = 'operator';             // pale green
const keyword = 'keyword';               // dark pink
const metacode = 'metacode';             // dark purple
const vartype = 'type';                  // dark blue
const _typeof = 'typeof';                // light green
const identifier = 'identifier';         // light blue
const functionCall = 'functionCall';     // yellow
const byteexpr = 'byteexpr';             // grayish color
const textelement = 'textelement';       // white
const text = 'text';                     // dark orange
const number = 'number';                 // pale yellow
const comment = 'comment';               // dark green
const newline = 'newline';
const whitespace = 'whitespace';
const selectedChar = 'selectedChar';


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
    'constructor',
    'return',
    'continue',
    'break',
    'sizeof',
    'typeof',
    'lengthof',
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
const metaKeywords = [
    "lib",
    "import",
    "define",
    "metif",
    "metelif",
    "metelse",
    "metendif"
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
    'void',
    'lst'
];
const typeofTypes = [
    'BYT',
    'INT',
    'FLT',
    'STR',
    'DBL',
    'CHR',
    'TYP',
    'LST'
]

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
    PLUS: PLUS,
    MINUS: MINUS,
    DIVIDE: DIVIDE,
    MULTIPLY: MULTIPLY,
    MODULUS: MODULUS,
    POWER: POWER,
    ISEQUALTO: ISEQUALTO,
    EQUALS: EQUALS,
    NOT: NOT,
    LESS: LESS,
    GREATER: GREATER,
    QUOTE: QUOTE,
    SQUOTE: SQUOTE,
    DOT: DOT,
    OR: OR,
    AND: AND,
    BYTESTART: BYTESTART,
    COLON: COLON
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
const selected = '@';

const codeStructure = {
    leftCB: leftCB,
    rightCB: rightCB,
    leftSB: leftSB,
    rightSB: rightSB,
    leftB: leftB,
    rightB: rightB,
    endcolumn: endcolumn,
    comma: comma,
    hashtag: hashtag,
    selected: selected
};

const NL = '\n';
const TAB = '\t';
const EOF = 'endoffile';

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
export const letters_digits = letters + digits;

const server = "http://100.115.92.196:8000";
const origin = "http://100.115.92.196:3000";

// If the shift or alt key is pressed specific characters will output special characters.
const shiftChars = {
    '1': '!',
    '2': '"',
    '4': '$',
    '5': '%',
    '6': '&',
    '7': '/',
    '8': '(',
    '9': ')',
    '0': '=',
    '#': '\'',
    '+': '*',
    ',': ';',
    '.': ':',
    '-': '_',
    '<': '>'
}
const altChars = {
    '5': '[',
    '6': ']',
    '7': '|',
    '8': '{',
    '9': '}',
    'l': '@'
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
        case 'KeyZ':
            return 'y';
        case 'KeyY':
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
String.prototype.removeAt = function (idx) {
    if (idx >= this.length) {
        return this.valueOf();
    }
    return this.substring(0, idx) + this.substring(idx + 1);
}

// Terminal
const commands = [
    "compile",
    "load",
    "log",
    "run",
    "clear",
    "curlInfo",
    "rmfile",
    "rmlib"
];
const command_tokens = [
    '-d',
    '-j',
    '-a',
    '-p',
    '-this'
];

export const c = {
    operator: operator,
    keyword: keyword,
    metacode: metacode,
    vartype: vartype,
    _typeof: _typeof,
    typeofTypes : typeofTypes,
    identifier: identifier,
    byteexpr: byteexpr,
    functionCall: functionCall,
    textelement: textelement,
    text: text,
    number: number,
    comment: comment,
    newline: newline,
    whitespace: whitespace,
    keywords: keywords,
    metaKeywords: metaKeywords,
    selectedChar: selectedChar,
    types: types,
    ops: ops,
    codeStructure: codeStructure,
    NL: NL,
    TAB: TAB,
    EOF: EOF,
    letters: letters,
    digits: digits,
    letters_digits: letters_digits,
    shiftChars: shiftChars,
    altChars: altChars,
    getCharFromKeycode: getCharFromKeycode,
    removeAt: String.prototype.removeAt,
    server: server,
    origin: origin,
    commands: commands,
    command_tokens: command_tokens
};
