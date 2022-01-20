from typing import Counter
import string
import numpy

# Variable types
VAR = 'var'  # [variable]
BYT = 'byt'  # [byte]
CHR = 'chr'  # [character]
STR = 'str'  # [string]
INT = 'int'  # [integer]
FLT = 'flt'  # [floating point]
DBL = 'dbl'  # [double]
BOL = 'bol'  # [boolean]
TYP = 'typ'  # [type]

VARTYPE = 'VARIABLE'
VARTYPES = [
    VAR,
    BYT,
    CHR,
    STR,
    INT,
    FLT,
    DBL,
    BOL,
    TYP
]

# Keywords
IF = 'if'
ELIF = 'elif'
ELSE = 'else'
WHILE = 'while'
DO = 'do'
FOR = 'for'
EACH = 'each'
CLASS = 'class'
FUNCTION = 'function'
STRUCT = 'struct'
CONSTRUCTOR = 'constructor'
PUBLIC = 'public'
PRIVATE = 'private'
PROTECTED = 'protected'
CONST = 'const'
STATIC = 'static'
VOID = 'void'
OVERRIDE = 'override'
OPERATION = 'operation'
RETURN = 'return'
CONTINUE = 'continue'
BREAK = 'break'
SIZEOF = 'sizeof'
TYPEOF = 'typeof'
LENGHTOF = 'lenghtof'
NULL = 'null'
FALSE = 'false'
TRUE = 'true'
USING = 'using'
NAMESPACE = 'namespace'

KEYWORD = 'KEYWORD'
IDENTIFIER = 'IDENTIFIER'
KEYWORDS = [
    IF,
    ELIF,
    ELSE,
    WHILE,
    DO,
    FOR,
    EACH,
    CLASS,
    FUNCTION,
    STRUCT,
    PUBLIC,
    PRIVATE,
    PROTECTED,
    CONST,
    STATIC,
    VOID,
    OVERRIDE,
    OPERATION,
    RETURN,
    CONTINUE,
    BREAK,
    SIZEOF,
    TYPEOF,
    LENGHTOF,
    USING,
    NAMESPACE
]

PREDEFINED = [
    NULL,
    FALSE,
    TRUE
]

# Operations
PLUS = '+'
PLUSEQUALS = '+='
PLUSPLUS = '++'
MINUS = '-'
MINUSEQUALS = '-='
MINUSMINUS = '--'
DIVIDE = '/'
DIVIDEEQUALS = '/='
COMMENT = '//'
MULTIPLY = '*'
MULTIPLYEQUALS = '*='
MODULUS = '%'
POWER = '^'
ISEQUALTO = '?'
EQUALS = '='
NOT = '!'
LESS = '<'
GREATER = '>'
LESSEQUAL = '<='
GREATEREQUAL = '>='
TOCODE = '>>'
QUOTE = '"'
SQUOTE = '\''
DOT = '.'
OR = '|'
AND = '&'
BYTESTART = '$'
COLON = ':'

OPERATOR = 'OPERATOR'

# Metacode keywords
METACODE = '#'
LIB = 'lib'
DEFINE = 'define'
METIF = 'metif'
METELIF = 'metelif'
METELSE = 'metelse'
METENDIF = 'metendif'
IMPORT = 'import'

METAKEYWORD = 'METAKEYWORD'
METAKEYWORDS = [
    LIB,
    IMPORT,
    DEFINE,
    METIF,
    METELIF,
    METELSE,
    METENDIF
]

# Extra compiler stuff
LCBRACKET = '{'
RCBRACKET = '}'
LSBRACKET = '['
RSBRACKET = ']'
LBRACKET = '('
RBRACKET = ')'
ENDCOLUMN = ';'
COMMA = ','
EOF = 'endofFile'

LETTERS = string.ascii_letters
DIGITS = '0123456789'
LETGITS = LETTERS + DIGITS
FLOATMIN = 0.0000000000000001

# Extra types
BON = 'binopnode'
UNN = 'unarynode'
VAC = 'varaccess'
DOA = 'dotaccess'
LIA = 'listaccess'
AGA = 'argaccess'
FUNCTYPES = [
    VOID,
    VAR,
    BYT,
    CHR,
    STR,
    INT,
    FLT,
    DBL,
    BOL,
    TYP
]


# Error types
TESTERROR = 'TestError'
ILLEGALCHAR = 'IllegalChar'
EXPEXTEDCHAR = 'ExpectedChar'
PARSEERROR = 'ParseError'
SYNTAXERROR = 'SyntaxError'
DIVBYZERO = 'DivisionByZero'
PYTHON_EXCEPTION = 'Python Exception'
# ... (more in the future)


#####################
# - Lexer classes - #
#####################


class Position:
    def __init__(self, idx, ln, col, fn, ftxt):
        self.idx = idx
        self.ln = ln
        self.col = col
        self.fn = fn
        self.ftxt = ftxt

    def advance(self, currChar=None):
        self.idx += 1
        self.col += 1

        if currChar == '\n':
            self.ln += 1
            self.col = 0

        return self

    def copy(self):
        return Position(self.idx, self.ln, self.col, self.fn, self.ftxt)


class Token:
    def __init__(self, type, value=None, start=None, end=None):
        self.type = type
        self.value = value
        if start:
            self.start = start.copy()
            self.end = start.copy()
            self.end.advance()
        if end:
            self.end = end

    def matches(self, type, value):
        return self.type == type and self.value == value

    def __repr__(self):
        if self.value:
            return f'\n\t{self.type}:{self.value}'
        return f'\n\t{self.type}'


class Error:
    def __init__(self, message, errorType, position, fileName):
        self.message = message
        self.errorType = errorType
        self.position = position
        self.fileName = fileName

    def throw(self):
        print(
            f'{self.errorType} in {self.fileName} (line: {self.position.ln}, {self.position.col}):\n\t\t{self.message}')


##################
# - The lexer - #
##################

class Lexer:
    def __init__(self, fn, text):
        self.fn = fn
        self.text = text
        self.pos = Position(-1, 0, -1, fn, text)
        self.currChar = None
        self.advance()

    def advance(self):
        self.pos.advance(self.currChar)
        self.currChar = self.text[self.pos.idx] if self.pos.idx < len(
            self.text) else None

    def genTokens(self):
        tokens = []

        while self.currChar != None:
            if self.currChar in ' \t\n':                # [Space] or [Tab]
                self.advance()
            elif self.currChar in DIGITS:               # 0123456789
                token, error = self.genNum()
                if error:
                    return [], error
                tokens.append(token)
            elif self.currChar in LETTERS:              # abcdef...
                tokens.append(self.genIdentifier())
            elif self.currChar == LESS:                 # < or <=
                tokens.append(self.genLess())
            elif self.currChar == GREATER:              # > or >=
                tokens.append(self.genGreater())
            elif self.currChar == PLUS:                 # + or ++ or +=
                tokens.append(self.genPlus())
            elif self.currChar == MINUS:                # - or -- or -=
                tokens.append(self.genMinus())
            elif self.currChar == DIVIDE:               # / or // ... or /*...*/ or /=
                token = self.genDivide()
                if token:
                    tokens.append(token)
            elif self.currChar == MULTIPLY:             # * or *=
                tokens.append(self.genMultiply())
            elif self.currChar == METACODE:             # (metacode-expression)
                token, error = self.genMetaCode()
                if error:
                    return [], error
                tokens.append(token)
            elif self.currChar == QUOTE:                # "Hello World."
                tokens.append(self.genString())
            elif self.currChar == SQUOTE:               # 'a'
                token, error = self.genChar()
                if error:
                    return [], error
                tokens.append(token)
            elif self.currChar == BYTESTART:            # $0xFF
                token, error = self.genByte()
                if error:
                    return [], error
                tokens.append(token)
            elif self.currChar == ENDCOLUMN:            # ;
                tokens.append(Token(ENDCOLUMN, start=self.pos))
                self.advance()
            elif self.currChar == LCBRACKET:            # {
                tokens.append(Token(LCBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == RCBRACKET:            # }
                tokens.append(Token(RCBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == LSBRACKET:            # [
                tokens.append(Token(LSBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == RSBRACKET:            # ]
                tokens.append(Token(RSBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == LBRACKET:             # (
                tokens.append(Token(LBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == RBRACKET:             # )
                tokens.append(Token(RBRACKET, start=self.pos))
                self.advance()
            elif self.currChar == POWER:                # ^
                tokens.append(Token(POWER, start=self.pos))
                self.advance()
            elif self.currChar == EQUALS:               # =
                tokens.append(Token(EQUALS, start=self.pos))
                self.advance()
            elif self.currChar == ISEQUALTO:            # ?
                tokens.append(Token(ISEQUALTO, start=self.pos))
                self.advance()
            elif self.currChar == NOT:                  # !
                tokens.append(Token(NOT, start=self.pos))
                self.advance()
            elif self.currChar == MODULUS:              # %
                tokens.append(Token(MODULUS, start=self.pos))
                self.advance()
            elif self.currChar == COMMA:                # ,
                tokens.append(Token(COMMA, start=self.pos))
                self.advance()
            elif self.currChar == DOT:                  # .
                tokens.append(Token(DOT, start=self.pos))
                self.advance()
            elif self.currChar == COLON:                # :
                tokens.append(Token(COLON, start=self.pos))
                self.advance()
            elif self.currChar == AND:                  # &
                tokens.append(Token(AND, start=self.pos))
                self.advance()
            elif self.currChar == OR:                   # |
                tokens.append(Token(OR, start=self.pos))
                self.advance()
            else:                                       # Error if nothing is true
                self.advance()
                return [], Error(f'Illegal character : \'{self.currChar}\'', SYNTAXERROR,  self.pos, self.pos.fn)

        # Appending an End-Of-File token.
        # Returning the list of all tokens with no error message.

        tokens.append(Token(EOF, start=self.pos))
        return tokens, None

    def genNum(self):
        num = ''
        dotCount = 0
        eCount = 0
        minusCount = 0
        start = self.pos.copy()

        while self.currChar != None and self.currChar in DIGITS + DOT + 'e-':
            if self.currChar == DOT:
                if dotCount == 1:
                    return None, Error("'.'", ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
                dotCount += 1
                num += DOT
            elif self.currChar == 'e':
                if eCount == 1:
                    return None, Error("'ee' is not allowed inside a number!", ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
                num += 'e'
                eCount += 1
                self.advance()

                if self.currChar == MINUS:
                    if minusCount == 1:
                        return None, Error("Two '-' is not allowed inside a number!", ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
                    num += MINUS
                    minusCount += 1
                else:
                    return None, Error("Expected '-'", ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
            elif self.currChar == MINUS:
                if minusCount == 1:
                    return None, Error("Two '-' is not allowed inside a number!", ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
                else:
                    break
            else:
                num += self.currChar
            self.advance()

        if dotCount == 0 and eCount == 0:
            return Token(INT, int(num), start, self.pos), None
        else:
            Num = numpy.double(num)
            type = DBL if Num < FLOATMIN else FLT
            if type == DBL:
                return Token(DBL, numpy.double(num), start, self.pos), None
            if type == FLT:
                return Token(FLT, float(num), start, self.pos), None

    def genIdentifier(self):
        value = ''
        start = self.pos.copy()

        while self.currChar != None and self.currChar in LETGITS + "_":
            value += self.currChar
            self.advance()

        type = KEYWORD if value in KEYWORDS else IDENTIFIER
        type = VARTYPE if value in VARTYPES else type
        type = BOL if value in (TRUE, FALSE) else type
        return Token(type, value, start, self.pos)

    def genLess(self):
        type = LESS
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = LESSEQUAL
            value += nextChar
            self.advance()
        return Token(type, value, start, self.pos)

    def genGreater(self):
        type = GREATER
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = GREATEREQUAL
            value += nextChar
            self.advance()
        elif nextChar == GREATER:
            type = TOCODE
            value += nextChar
            self.advance()
        return Token(type, value, start, self.pos)

    def genPlus(self):
        type = PLUS
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = PLUSEQUALS
            value += nextChar
            self.advance()
        elif nextChar == PLUS:
            type = PLUSPLUS
            value += nextChar
            self.advance()
        return Token(type, value, start, self.pos)

    def genMinus(self):
        type = MINUS
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = MINUSEQUALS
            value += nextChar
            self.advance()
        elif nextChar == MINUS:
            type = MINUSMINUS
            value += nextChar
            self.advance()
        return Token(type, value, start, self.pos)

    def genDivide(self):
        type = DIVIDE
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = DIVIDEEQUALS
            value += nextChar
            self.advance()
        elif nextChar == DIVIDE:
            type = COMMENT
            value += nextChar

            self.advance()
            while self.currChar != '\n':
                if self.currChar == None:
                    break
                self.advance()
            self.advance()
            return None
        elif nextChar == MULTIPLY:
            type = COMMENT
            value += nextChar

            self.advance()
            while self.currChar != None:
                if self.currChar == MULTIPLY:
                    self.advance()
                    if self.currChar == DIVIDE:
                        break
                self.advance()
            self.advance()
            return None

        return Token(type, value, start, self.pos)

    def genMultiply(self):
        type = MULTIPLY
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        nextChar = self.currChar
        if nextChar == EQUALS:
            type = MULTIPLYEQUALS
            value += nextChar
            self.advance()
        return Token(type, value, start, self.pos)

    def genMetaCode(self):
        self.advance()
        value = ''
        start = self.pos.copy()

        while self.currChar != None and self.currChar in LETTERS:
            value += self.currChar
            self.advance()

        type = METAKEYWORD if value in METAKEYWORDS else None
        if type == None:
            return None, Error("Expected 'metif', 'define', ...", ILLEGALCHAR, self.pos, self.fn)
        return Token(type, value, start, self.pos), None

    def genString(self):
        self.advance()
        value = ''
        start = self.pos.copy()

        while self.currChar != QUOTE:
            value += self.currChar
            self.advance()

        self.advance()
        return Token(STR, value, start, self.pos)

    def genChar(self):
        self.advance()
        value = self.currChar
        start = self.pos.copy()

        self.advance()
        if self.currChar != SQUOTE:
            return None, Error('Expected \'', ILLEGALCHAR, self.pos.ln, self.pos.col, self.fn)
        self.advance()

        return Token(CHR, value, start, self.pos), None

    def genByte(self):
        self.advance()
        value = ''
        start = self.pos.copy()

        while self.currChar != None and self.currChar in LETGITS:
            value += self.currChar
            self.advance()

        type = BYT if all(
            c in 'xX' + string.hexdigits for c in value) else None
        if not type:
            return None, Error('Wrong byte format!', SYNTAXERROR, self.pos.ln, self.pos.col, self.fn)
        return Token(type, value, start, self.pos), None