import { assertEquals } from "../../test/mod.ts";

import { isEqual } from "./equal.ts";

Deno.test("simple", () => {
    const isEqual3 = isEqual(3);

    assertEquals(isEqual3(4), false);
    assertEquals(isEqual3(3), true);
});
