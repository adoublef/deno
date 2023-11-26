/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from "./deps.ts";
import { assertEquals } from "$std/assert/mod.ts";
import { Show } from "./show.tsx";

Deno.test("control_flow/for", async (t) => {
    await t.step("should render when true", (t) => {
        const rs = (
            <Show when={1} fallback={<div>0</div>}>
                {(n) => <div>{n}</div>}
            </Show>
        );
        assertEquals(rs.toString(), `<div>1</div>`);
    });

    await t.step("should render fallback", (t) => {
        const rs = (
            <Show when={"0"} fallback={<div>1</div>}>
                {(n) => <div>{n}</div>}
            </Show>
        );
        assertEquals(rs.toString(), `<div>1</div>`);
    });

    await t.step("should render static", (t) => {
        const rs = (
            <Show when={0} fallback={<div>1</div>}>
                <div>1</div>
            </Show>
        );
        assertEquals(rs.toString(), `<div>1</div>`);
    });
});
