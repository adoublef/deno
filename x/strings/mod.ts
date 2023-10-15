import { BiTransform, Transform } from "../fp/mod.ts";

export const fromCharCode: Transform<number, string> = (r) =>
    String.fromCharCode(r);

export const toCharCode: Transform<string, number> = (ch) => ch.charCodeAt(0);

export const charCount: BiTransform<string, string, number> = (s, ch) =>
    s.split(ch).length - 1;

export const char: Transform<string, string> = (s) => s[0];

export const rune: Transform<string, number> = (s) => toCharCode(s[0]);

export const capitalize = (input: string) => {
    if (input.length === 0) return input;
    return input[0].toUpperCase() + input.slice(1);
};
