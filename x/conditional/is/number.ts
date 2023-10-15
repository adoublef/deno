import { Predicate } from "../../fp/mod.ts";
import { isEqual } from "./equal.ts";

type Equality = (a: number) => Predicate<number>;

export const isGreaterThan: Equality = (a) => (b) => b > a;

export const isGreaterThanZero: Predicate<number> = isGreaterThan(0);

export const isGreaterThanOrEqualTo: Equality = (a) =>
    (b) => isGreaterThan(a)(b) || isEqual(a)(b);

export const isGreaterThanOrEqualToZero: Predicate<number> =
    isGreaterThanOrEqualTo(0);

export const isLessThan: Equality = (a) => (b) => b < a;

export const isLessThanOrEqualTo: Equality = (a) =>
    (b) => isLessThan(a)(b) || isEqual(a)(b);

export const isLessThanOrEqualToZero: Predicate<number> = isLessThanOrEqualTo(
    0,
);

export const isLessThanZero: Predicate<number> = isLessThan(0);
