import { assertEquals } from "$std/assert/mod.ts";
import { isMethod, isNumber, isString } from "./narrow.ts";

Deno.test("string narrowing", () => {
    const foo = (): string | number => 0;

    let x = foo();
    if (isString(x)) {
        x; // infer string
    } else {
        x; // infer number
    }
});

Deno.test("number narrowing", () => {
    const foo = (): string | number => 0;

    let x = foo();
    if (isNumber(x)) {
        x; // infer number
    } else {
        x; // infer string
    }
});
Deno.test("valid method", async () => {
    const parseMethod = () => "get";

    let m = parseMethod();
    if (isMethod(m)) {
        m; // infer "GET" | "POST" | "PUT" | "DELETE"
    } else {
        m; // string
    }

    assertEquals(isMethod("GET"), true);
    assertEquals(isMethod("get"), true);
    assertEquals(isMethod("lip"), false);
});
