import { assertEquals } from "$std/assert/mod.ts";

import {
    isGreaterThan,
    isGreaterThanZero,
    isLessThan,
    isLessThanZero,
} from "./number.ts";

Deno.test("equality", () => {
    assertEquals(isGreaterThan(1)(10), true);
    assertEquals(isGreaterThanZero(-5), false);
    assertEquals(isLessThan(10)(1), true);
    assertEquals(isLessThanZero(-5), true);
});
