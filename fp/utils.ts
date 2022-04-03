export type Transform<T extends unknown, R extends unknown> = (value: T) => R;
export type Predicate<U extends unknown> = Transform<U, boolean>;
export type Consumer<T extends unknown> = Transform<T, void>;
export type Supplier<R extends unknown> = Transform<void, R>;

export type TransformAsync<T extends unknown, R extends unknown> = (
    value: T,
) => Promise<R>;
export type PredicateAsync<U extends unknown> = TransformAsync<U, boolean>;
export type ConsumerAsync<T extends unknown> = TransformAsync<T, void>;
export type SupplierAsync<R extends unknown> = TransformAsync<void, R>;

export type BiTransform<
    T extends unknown,
    U extends unknown,
    R extends unknown,
    > = (a: T, b: U) => R;
export type BiPredicate<T, U extends unknown> = BiTransform<T, U, boolean>;
export type BiConsumer<T, U extends unknown> = BiTransform<T, U, void>;

export type BiTransformAsync<
    T extends unknown,
    U extends unknown,
    R extends unknown,
    > = (a: T, b: U) => Promise<R>;
export type BiPredicateAsync<T, U extends unknown> = BiTransformAsync<
    T,
    U,
    boolean
>;
export type BiConsumerAsync<T, U extends unknown> = BiTransformAsync<
    T,
    U,
    void
>;

export type Either<T extends unknown, U extends unknown> = T | U;
export type Result<T extends unknown> = Promise<T | Error>;
export type Option<T extends unknown> = Either<T, undefined>;

export type State<T extends unknown> = Option<(args: T) => State<T>>;

export const identity = <T extends unknown, R extends unknown>(v: T) => v as R;
