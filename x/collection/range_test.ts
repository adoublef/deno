import { range } from "./range.ts";

Deno.test("range", () => {
    for (const i of range(0, 3)) {
        console.log(i);
    }
});

Deno.test("for loop", () => {
    for (let i = 0; i < 3; i++) {
        console.log(i);
    }
});
