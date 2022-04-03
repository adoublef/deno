import {
    isGreaterThanZero,
    isLessThanZero,
    isUpperCase,
} from "../../conditional/mod.ts";
import { BiTransform, Transform } from "../../fp/mod.ts";
import { mod, mod26 } from "../../maths/mod.ts";
import { fromCharCode, toCharCode } from "../../strings/mod.ts";

const execute: BiTransform<
    number[],
    boolean,
    Transform<string, string>
> = (pattern, isEncode) =>
        (phrase) => {
            if (!pattern.length) return phrase;
            return phrase.replaceAll(/\w/g, run(pattern, isEncode));
        };

const run: BiTransform<
    number[],
    boolean,
    BiTransform<string, number, string>
> = (pattern, isEncode) =>
        (ch, i) => {
            const shift = pattern[mod(pattern.length)(i)];
            const norm = (isUpperCase(ch) ? [65, 90] : [97, 122])[
                Number((isEncode ? isLessThanZero : isGreaterThanZero)(shift))
            ];
            return fromCharCode(
                norm +
                mod26(
                    toCharCode(ch) + [-1, 1][Number(isEncode)] * shift - norm,
                ),
            );
        };

export class CeasarShift {
    #pattern: number[];
    #cache: Record<string, string>;

    constructor(...pattern: number[]) {
        this.#pattern = pattern;
        this.#cache = {};
    }

    encode(phrase: string): string {
        return this.#cache[phrase] = execute(this.#pattern, true)(phrase);
    }

    decode(phrase: string): string {
        for (const key in this.#cache) {
            if (this.#cache[key] === phrase) return key;
        }
        return this.#cache[phrase] = execute(this.#pattern, false)(phrase);
    }
}
