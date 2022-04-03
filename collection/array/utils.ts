export type Transform<T extends unknown, R extends unknown> = (
    value: T,
    index: number,
    array: T[],
) => R;
export type Predicate<T extends unknown> = Transform<T, boolean>;
export type Consumer<T extends unknown> = Transform<T, void>;

export type TransformAsync<T extends unknown, R extends unknown> = (
    value: T,
    index: number,
    array: T[],
) => Promise<R>;
export type PredicateAsync<T extends unknown> = TransformAsync<T, boolean>;
export type ConsumerAsync<T extends unknown> = TransformAsync<T, void>;

export type Compare<T extends unknown> = (a: T, b: T) => number;
