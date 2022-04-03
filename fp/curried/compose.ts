import { Transform } from "../utils.ts";

export const pipe = <T extends any[], R>(
    fn1: (...args: T) => R,
    ...fns: Array<(a: R) => R>
) => {
    const piped = fns.reduce(
        (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
        (value) => value,
    );
    return (...args: T) => piped(fn1(...args));
};

export const compose = <R>(...fns: Array<Transform<R, R>>) => {
    return fns.reduce((p, n) => (value) => p(n(value)));
};
