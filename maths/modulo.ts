import { Transform } from "../fp/mod.ts";

export const mod: Transform<
    number,
    Transform<number, number>
> = (divisor) => (value) => value % divisor;

export const mod26 = mod(26);
