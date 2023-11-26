import { Predicate, Transform } from "../fp/mod.ts";

// This helper function would be useful but does not help wit
// the some function lol...
// I will need to understand more about the type system in TS
export type Some<T extends unknown> = Transform<
    Array<Predicate<T>>,
    Predicate<T>
>;
export const some =
    <T extends unknown>(...fns: Predicate<T>[]): Predicate<T> => (b) =>
        fns.some((fn) => fn(b));

export type Every<T extends unknown> = Transform<
    Array<Predicate<T>>,
    Predicate<T>
>;
export const every =
    <T extends unknown>(fns: Predicate<T>[]): Predicate<T> => (b) =>
        fns.every((fn) => fn(b));
