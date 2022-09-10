import { assertEquals } from "testing";

import { compose, pipe } from "fp/curried/compose.ts";
import { Transform } from "fp/utils.ts";

Deno.test("compose & pipe", () => {
    const fn1: Transform<string, string> = (value) => `fn1(${value})`;
    const fn2: Transform<string, string> = (value) => `fn2(${value})`;
    const fn3: Transform<string, string> = (value) => `fn3(${value})`;

    const fn4 = compose(fn1, fn2, fn3)("inner");
    const fn5 = pipe(fn1, fn2, fn3)("inner");

    assertEquals(fn4, "fn1(fn2(fn3(inner)))");
    assertEquals(fn5, "fn3(fn2(fn1(inner)))");
});
