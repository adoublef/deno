import { isError } from "./error.ts";

Deno.test("error narrowing", () => {
    const foo = (): number | Error => 0;

    let x = foo();
    if (isError(x)) {
        x.message; //infer Error
    } else {
        x; //infer number
    }
});
