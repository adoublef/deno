import { Predicate, Transform } from "../../fp/mod.ts";
import { fromCharCode } from "../../strings/mod.ts";
import { isEqual } from "./equal.ts";

export const isUpperCase: Predicate<string> = (char) =>
    char === char.toUpperCase();

export const isLowerCase: Predicate<string> = (char) => !isUpperCase(char);

export const isSpace: Predicate<string> = (s) => " \t\r\n".includes(s);

export const isTerminal: Predicate<string> = (ch) => ".,|:)(".includes(ch);

export const isAlpha: Predicate<string> = (ch) =>
    "a" <= ch.toLowerCase() && "z" >= ch.toLowerCase();

export const isNumeric: Predicate<string> = (ch) => "0" <= ch && "9" >= ch;

export const isAlphaNumeric: Predicate<string> = (ch) =>
    isEqual("_")(ch) || isAlpha(ch) || isNumeric(ch);

export const isChar: Transform<string, Predicate<number>> = (a) =>
    (b) => isEqual(a[0])(fromCharCode(b));

export const isCharCode: Transform<number, Predicate<string>> = (a) =>
    (b) => isEqual(fromCharCode(a))(b);

export const isNewLine = isEqual("\n");

export const isEmptyString = isEqual("");
