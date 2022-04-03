import {
    isAlphaNumeric,
    isChar,
    isEqual,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isGreaterThanOrEqualToZero,
    isLessThanZero,
    isNewLine,
    isNumeric,
    isSpace,
    isZero,
    some,
} from "../../conditional/mod.ts";
import {
    BiConsumer,
    BiPredicate,
    BiTransform,
    Consumer,
    ConsumerAsync,
    Predicate,
    State,
    Transform,
} from "../../fp/mod.ts";
import {
    char,
    charCount,
    fromCharCode,
    toCharCode,
} from "../../strings/mod.ts";

enum ItemType { // 33 types
    Error,
    Boolean,
    Comment,
    Assign,
    Declare,
    EOF,
    Field,
    Identifier,
    LeftDelim,
    LeftParen,
    Number,
    Pipe,
    RawString,
    RightDelim,
    RightParen,
    Space,
    String,
    Text,
    Variable,
    Keyword,
    Block,
    Dot,
    Define,
    Else,
    End,
    If,
    Range,
    Null,
    Undefined,
    Template,
    With,
}

export interface ItemLiteral {
    type: ItemType;
    position: number;
    value: string;
    line: number;
}

export interface Item extends ItemLiteral { }

export class Item {
    constructor(cfg: ItemLiteral) {
        Object.assign(this, cfg);
    }

    toString(): string {
        return this.writeTo("");
    }

    writeTo(sb: string): string {
        switch (true) {
            case isEqual(ItemType.EOF)(this.type):
                return sb += "EOF";
            case isEqual(ItemType.Error)(this.type):
                return sb += this.value;
            case isGreaterThan(ItemType.Keyword)(this.type):
                return sb += "<" + this.value + ">";
            case isGreaterThan(10)(this.value.length):
                return sb += this.value.slice(0, 10) + "...";
        }

        return sb += this.value;
    }
}

export interface LexerLiteral {
    items: Array<ItemLiteral>;
    name: string;
    input: string;
    leftDelim: string;
    rightDelim: string;
    emitComment: boolean;
    position: number;
    start: number;
    width: number;
    line: number;
    startLine: number;
    parenDepth: number;
}

export interface Lexer extends Omit<LexerLiteral, "items"> {
    items: Array<Item>;
}

export class Lexer {
    constructor(cfg: LexerLiteral) {
        this.name = cfg.name;
        this.input = cfg.input;
        this.leftDelim = cfg.leftDelim;
        this.rightDelim = cfg.rightDelim;
        this.position = cfg.position;
        this.start = cfg.start;
        this.width = cfg.width;
        this.line = cfg.line;
        this.startLine = cfg.startLine;
        this.parenDepth = cfg.parenDepth;
        this.items = cfg.items.map((v) => new Item(v));
    }

    toString(): string {
        return this.writeTo("");
    }

    writeTo(sb: string): string {
        for (const [i, v] of this.items.entries()) {
            sb += v.toString();
            // if (!isEOF(v.type)) sb += "\n";
        }
        return sb;
    }
}

const eof = -1;
const trimMarker = "-";
const trimMarkerLen = 2;
const leftDelim = "{{";
const rightDelim = "}}";
const leftComment = "/*";
const rightComment = "*/";
// const spaceChars = " \t\r\n";
const key: Record<string, ItemType> = {
    ".": ItemType.Dot,
    "block": ItemType.Block,
    "define": ItemType.Define,
    "else": ItemType.Else,
    "end": ItemType.End,
    "if": ItemType.If,
    "range": ItemType.Range,
    "null": ItemType.Null,
    "undefined": ItemType.Undefined,
    "template": ItemType.Template,
    "with": ItemType.With,
};

const next: Transform<LexerLiteral, number> = (l) => {
    if (l.position >= l.input.length) {
        l.width = 0;
        return eof;
    }

    const ch = char(l.input.slice(l.position));

    l.width = ch.length;
    l.position += l.width;
    isNewLine(ch) && l.line++;

    return toCharCode(ch);
};

const peek: Transform<LexerLiteral, number> = (l) => {
    const r = next(l);
    backup(l);
    return r;
};

const backup: Consumer<LexerLiteral> = (l) => {
    isEqual(1)(l.width) && isNewLine(l.input[l.position -= l.width]) &&
        l.line--;
};

const emit: BiConsumer<LexerLiteral, ItemType> = (l, t) => {
    l.items.push({
        type: t,
        position: l.start,
        line: l.startLine,
        value: l.input.slice(l.start, l.position),
    });

    l.start = l.position;
    l.startLine = l.line;
};

const ignore: Consumer<LexerLiteral> = (l) => {
    l.line += charCount(l.input.slice(l.start, l.position), "\n");

    l.start = l.position;
    l.startLine = l.line;
};

const accept: BiPredicate<LexerLiteral, string> = (l, valid) => {
    if (valid.includes(fromCharCode(next(l)))) return true;
    backup(l);
    return false;
};

const acceptRun: BiConsumer<LexerLiteral, string> = (l, valid) => {
    while (valid.includes(fromCharCode(next(l)))) { }
    backup(l);
};

const lexError: BiTransform<LexerLiteral, string, undefined> = (
    l,
    err,
): undefined => {
    l.items.push({
        type: ItemType.EOF,
        position: l.start,
        line: l.startLine,
        value: err,
    });

    return undefined;
};

export const lex: Transform<
    Pick<
        LexerLiteral,
        "name" | "input" | "leftDelim" | "rightDelim" | "emitComment"
    >,
    Lexer
> = (cfg) => {
    // FIXME: I would like to switch to ??= but could lead to code breaking feats
    // so need to be carful whenI plan on doing so
    cfg.leftDelim ||= leftDelim;
    cfg.rightDelim ||= rightDelim;

    const l: LexerLiteral = {
        ...cfg,

        items: [],
        line: 1,
        startLine: 1,

        position: 0,
        start: 0,
        width: 0,
        parenDepth: 0,
    };

    run(l);
    return new Lexer(l);
};

const run: ConsumerAsync<LexerLiteral> = async (l) => {
    for (let state = lexText; state != null;) state = state(l);
};

const lexText: State<LexerLiteral> = (l) => {
    const x = l.input.slice(l.position).indexOf(l.leftDelim);

    if (isGreaterThanOrEqualToZero(x)) {
        const ldn = l.leftDelim.length;
        l.position += x;

        let trimLength = 0;

        if (hasLeftTrimMarker(l.input.slice(l.position + ldn))) {
            trimLength = rightTrimLength(l.input.slice(l.start, l.position));
        }

        if (isGreaterThan(l.start)(l.position -= trimLength)) {
            l.line += charCount(l.input.slice(l.start, l.position), "\n");
            emit(l, ItemType.Text);
        }

        l.position += trimLength;
        ignore(l);
        return lexLeftDelim;
    }

    if (isGreaterThan(l.start)(l.position = l.input.length)) {
        l.line += charCount(l.input.slice(l.start, l.position), "\n");
        emit(l, ItemType.Text);
    }

    emit(l, ItemType.EOF);
    return undefined;
};

const lexLeftDelim: State<LexerLiteral> = (l) => {
    l.position += l.leftDelim.length;

    const trimSpace = hasLeftTrimMarker(l.input.slice(l.position));
    const afterMarker = trimSpace ? trimMarkerLen : 0;

    // TODO: Comments are not going to be implemented
    // but the code for that would go here
    if (l.input.slice(l.position + afterMarker).startsWith(leftComment)) {
        l.position += afterMarker;
        ignore(l);
        return lexComment;
    }

    emit(l, ItemType.LeftDelim);
    l.position += afterMarker;
    ignore(l);
    l.parenDepth = 0;

    return lexInsideAction;
};

const lexComment: State<LexerLiteral> = (l) => {
    l.position += leftComment.length;
    const i = l.input.slice(l.position).indexOf(rightComment);
    if (isLessThanZero(i)) return lexError(l, "unclosed comment");

    l.position += i + l.rightDelim.length;

    const [delim, trimSpace] = atRightDelim(l);
    if (!delim) return lexError(l, "comment ends before closing delimiter");
    l.emitComment && emit(l, ItemType.Comment);
    trimSpace && (l.position += trimMarkerLen);

    l.position += l.rightDelim.length;
    trimSpace && (l.position += leftTrimLength(l.input.slice(l.position)));

    ignore(l);
    return lexText;
};

const lexRightDelim: State<LexerLiteral> = (l) => {
    const trimSpace = hasRightTrimMarker(l.input.slice(l.position));
    if (trimSpace) {
        l.position += trimMarkerLen;
        ignore(l);
    }

    l.position += l.rightDelim.length;
    emit(l, ItemType.RightDelim);
    if (trimSpace) {
        l.position += leftTrimLength(l.input.slice(l.position));
        ignore(l);
    }

    return lexText;
};

const lexInsideAction: State<LexerLiteral> = (l) => {
    const [delim, _] = atRightDelim(l);

    if (delim) {
        if (isZero(l.parenDepth)) return lexRightDelim;
        return lexError(l, "unclosed left paren");
    }

    const r = next(l);

    switch (true) {
        case isEqual(eof)(r):
            return lexError(l, "unclosed action");
        case some(
            isChar(" "),
            isChar("\n"),
            isChar("\t"),
            isChar("\r"),
        )(r):
            backup(l);
            return lexSpace;
        case isChar("=")(r):
            emit(l, ItemType.Assign);
            break;
        case isChar(":")(r):
            if (!isChar("=")(next(l))) return lexError(l, "expected :=");
            emit(l, ItemType.Declare);
            break;
        case isChar("|")(r):
            emit(l, ItemType.Pipe);
            break;
        case isChar('"')(r):
            return lexQuote;
        case isChar("`")(r):
            return lexRawQuote;
        case isChar("$")(r):
            return lexVariable;
        case isChar(".")(r):
            if (l.position < l.input.length) {
                const r = l.input[l.position];
                if (r < "0" || "9" < r) {
                    return lexField;
                }
            }
        // break;
        case some(
            isChar("+"),
            isChar("-"),
            (r) => isNumeric(fromCharCode(r)),
        )(r):
            backup(l);
            return lexNumber;
        case isAlphaNumeric(fromCharCode(r)):
            backup(l);
            return lexIdentifier;
        case isChar("(")(r):
            emit(l, ItemType.LeftParen);
            l.parenDepth++;
            break;
        case isChar(")")(r):
            emit(l, ItemType.RightParen);
            l.parenDepth--;
            console.log(l.parenDepth);

            if (isLessThanZero(l.parenDepth)) {
                return lexError(l, `unexpected right paren ${fromCharCode(r)}`);
            }
            break;
        default:
            return lexError(
                l,
                `unrecognized character in action: ${String.fromCharCode(r)}`,
            );
    }

    return lexInsideAction;
};

const lexSpace: State<LexerLiteral> = (l) => {
    let r, numSpaces: number = 0;
    while (true) {
        r = peek(l);
        if (!isSpace(String.fromCharCode(r))) {
            break;
        }

        next(l);
        numSpaces++;
    }

    if (
        hasRightTrimMarker(l.input.slice(l.position - 1)) &&
        l.input.slice(l.position - 1 + trimMarkerLen).startsWith(l.rightDelim)
    ) {
        backup(l);
        if (isEqual(1)(numSpaces)) return lexRightDelim;
    }

    emit(l, ItemType.Space);
    return lexInsideAction;
};

const lexIdentifier: State<LexerLiteral> = (l) => {
    Loop:
    while (true) {
        const r = next(l);
        switch (true) {
            case isAlphaNumeric(fromCharCode(r)):
                break; // break or continue works here
            default:
                backup(l);
                const word = l.input.slice(l.start, l.position);
                if (!atTerminator(l)) {
                    return lexError(l, `bad character ${fromCharCode(r)}`);
                }
                switch (true) {
                    case key[word] > ItemType.Keyword:
                        emit(l, key[word]);
                        break;
                    case isEqual(".")(word[0]):
                        emit(l, ItemType.Field);
                        break;
                    case isEqual("true")(word) || isEqual("false")(word):
                        emit(l, ItemType.Boolean);
                        break;
                    default:
                        emit(l, ItemType.Identifier);
                        break;
                }
                break Loop;
        }
    }

    return lexInsideAction;
};

const lexField: State<LexerLiteral> = (l) =>
    lexFieldOrVariable(l, ItemType.Field);

const lexVariable: State<LexerLiteral> = (l) => {
    if (atTerminator(l)) { // Nothing interesting follows -> "$".
        emit(l, ItemType.Variable);
        return lexInsideAction;
    }

    return lexFieldOrVariable(l, ItemType.Variable);
};

const lexFieldOrVariable: BiTransform<
    LexerLiteral,
    ItemType,
    State<LexerLiteral>
> = (l, typ) => {
    // TODO: Nothing interesting follows -> "." or "$".
    if (atTerminator(l)) {
        emit(
            l,
            isEqual(typ)(ItemType.Variable) ? ItemType.Variable : ItemType.Dot,
        );
        return lexInsideAction;
    }

    let r: number;
    while (true) {
        r = next(l);
        if (!isAlphaNumeric(fromCharCode(r))) {
            backup(l);
            break;
        }
    }

    if (!atTerminator(l)) {
        return lexError(l, `bad character ${fromCharCode(r)}`);
    }

    emit(l, typ);
    return lexInsideAction;
};

const atTerminator: Predicate<LexerLiteral> = (l) => {
    const r = peek(l);

    if (
        some(
            isChar(" "),
            isChar("\n"),
            isChar("\t"),
            isChar("\r"),
        )(r)
    ) {
        return true;
    }

    switch (true) {
        case some(
            isEqual(eof),
            some(
                isChar("."),
                isChar(","),
                isChar("|"),
                isChar(":"),
                isChar(")"),
                isChar("("),
            ),
        )(r):
            return true;
    }

    return isChar(l.rightDelim)(r);
};

const lexNumber: State<LexerLiteral> = (l) => {
    if (!scanNumber(l)) {
        return lexError(
            l,
            `bad number syntax: ${l.input.slice(l.start, l.position)}`,
        );
    }

    emit(l, ItemType.Number);
    return lexInsideAction;
};

// FIXME: unexpected ".3" in operand [tbc]
// TODO: illegal number syntax: "+" [node.go L708]
const scanNumber: Predicate<LexerLiteral> = (l) => {
    accept(l, "+-");
    const digits = "0123456789_";

    acceptRun(l, digits);
    accept(l, ".") && acceptRun(l, digits);

    if (isEqual(10 + 1)(digits.length) && accept(l, "eE")) {
        accept(l, "+-");
        acceptRun(l, digits);
    }

    if (!isAlphaNumeric(fromCharCode(peek(l)))) return true;

    next(l);
    return false;
};

const lexQuote: State<LexerLiteral> = (l) => {
    Loop:
    while (true) {
        switch (next(l)) {
            case toCharCode("\\"):
                const r = next(l);
                if (!isEqual(eof)(r) && !isChar("\n")(r)) {
                    break;
                }
            // fallthrough keyword does not exist in JS/TS
            case eof || toCharCode("\n"):
                return lexError(l, "unterminated quoted string");
            case toCharCode('"'):
                break Loop;
        }
    }

    emit(l, ItemType.String);
    return lexInsideAction;
};

const lexRawQuote: State<LexerLiteral> = (l) => {
    Loop:
    while (true) {
        switch (next(l)) {
            case eof:
                return lexError(l, "unterminated raw quoted string");
            case toCharCode("\`"):
                break Loop;
        }
    }

    emit(l, ItemType.RawString);
    return lexInsideAction;
};

const atRightDelim: Transform<LexerLiteral, [boolean, boolean]> = (l) => {
    if (
        hasRightTrimMarker(l.input.slice(l.position)) &&
        l.input.slice(l.position + trimMarkerLen).startsWith(l.rightDelim)
    ) {
        return [true, true];
    }

    if (l.input.slice(l.position).startsWith(l.rightDelim)) {
        return [true, false];
    }
    return [false, false];
};

const hasLeftTrimMarker: Predicate<string> = (s) =>
    isGreaterThanOrEqualTo(2)(s.length) && isEqual(trimMarker)(s[0]) &&
    isSpace(s[1]);

const hasRightTrimMarker: Predicate<string> = (s) =>
    isGreaterThanOrEqualTo(2)(s.length) && isEqual(trimMarker)(s[1]) &&
    isSpace(s[0]);

const leftTrimLength: Transform<string, number> = (s) =>
    s.length - s.trimStart().length;

const rightTrimLength: Transform<string, number> = (s) =>
    s.length - s.trimEnd().length;

const lexer = lex({
    name: "test",
    input: `
    <h1>Welcome Home, {{ .Name.First }}</h1>
    <h3>Here are your tasks for today</h3>
    {{ range .Tasks }}
      <p> {{.Name}}: {{if Varr}}</p>
      {{end}}
    {{end}}
    `,
    // input: `<h1>Welcome to your new appartment{{/* This is my name */}}</h1>`,
    leftDelim: "",
    rightDelim: "",
    emitComment: true,
});

console.log(lexer.items);
