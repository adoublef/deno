import { ItemLiteral, LexerLiteral } from "./lex.ts";

export interface TreeLiteral {
    name: string;
    parseName: string;

    // root: ListVertex;

    parseMode: number;
    text: string;
    fns: Record<string, unknown>;
    lex: LexerLiteral;
    lookAhead: ItemLiteral[];
    peekCount: number;
    vars: string[];
    set: Record<string, Tree>;
    actionLine: number;
    mode: number;
}

export interface Tree extends TreeLiteral { }

export class Tree {
}
