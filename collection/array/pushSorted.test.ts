import { assertEquals } from "../../test/mod.ts";

import { isGreaterThan, isLessThan } from "../../conditional/mod.ts";
import { pushSorted } from "./pushSorted.ts";

Deno.test("sort number array", () => {
    let arr: number[] = [];

    const add = (e: number) => pushSorted(arr, e, isGreaterThan(e));

    add(1);
    add(3);
    add(4);
    add(2);

    assertEquals(arr, [1, 2, 3, 4]);
});

Deno.test("sort number array 2", () => {
    let arr: number[] = [];

    [1, 3, 4, 2].forEach((e) => pushSorted(arr, e, isLessThan(e)));

    assertEquals(arr, [4, 3, 2, 1]);
});
