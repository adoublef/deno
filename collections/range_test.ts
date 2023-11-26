import { assertArrayIncludes } from "$std/assert/mod.ts";
import { range } from "./range.ts";

Deno.test("range", async (t) => {
    await t.step("should spread a range generator", () => {
        const rs = [...range(0, 3)];
        assertArrayIncludes(rs, [0, 1, 2]);
    });
});
