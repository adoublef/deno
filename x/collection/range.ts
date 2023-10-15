import { BiTransform } from "../fp/mod.ts";

type RangeFn = BiTransform<number, number, Generator<number, void, void>>;

/** not performant when ranging over 1e3 enteries, opt for std loops */
export const range: RangeFn = function* (from, to) {
    yield* [rangeDown, rangeUp][Number(from < to)](from, to);
};

const rangeUp: RangeFn = function* (from, to) {
    while (from < to) yield from++;
};

const rangeDown: RangeFn = function* (from, to) {
    while (to < from) yield --from;
};
