/** not performant when ranging over 1e3 entries, opt for std loops */
export function* range(from: number, to: number): Generator<number, void, void> {
    yield* [rangeDown, rangeUp][Number(from < to)](from, to);
};

const rangeUp: (a: number, b: number) => Generator<number, void, void> = function* (from, to) {
    while (from < to) yield from++;
};

const rangeDown: (a: number, b: number) => Generator<number, void, void> = function* (from, to) {
    while (to < from) yield --from;
};
