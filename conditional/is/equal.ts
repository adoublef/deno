import { identity, Predicate, Transform } from "../../fp/mod.ts";

type Equal = <T extends unknown, U extends unknown>(
    fn1: Transform<T, U>,
    fn2?: Transform<T, U>,
) => <R extends T>(a: R) => Predicate<R>;

const equal: Equal = (fn1, fn2?) => (a) => (b) => (fn2 || fn1)(b) === fn1(a);

export const isEqualJson = equal(JSON.stringify);

export const isEqual = equal(identity);

export const isZero = isEqual(0);
