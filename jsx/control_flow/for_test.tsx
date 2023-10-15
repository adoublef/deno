import { assertEquals } from "$std/assert/mod.ts";
import { For } from "./for.tsx";

Deno.test("control_flow/for", async (t) => {
    await t.step("should render the array", (t) => {
        const rs = <ul><For each={[1, 2, 4, 6, 8]}>{n => (<li>{n}</li>)}</For></ul>;
        assertEquals(rs.toString(), `<ul><li>1</li><li>2</li><li>4</li><li>6</li><li>8</li></ul>`);
    });

    await t.step("should render the fallback", (t) => {
        const rs = <ul><For each={[]} fallback={<li>0</li>}>{() => (<li>never</li>)}</For></ul>;
        assertEquals(rs.toString(), `<ul><li>0</li></ul>`);
    });

    await t.step("should render nested component", (t) => {
        const A = ({ n = 1 }) => <div>{n}</div>;
        const rs = <ul><For each={[1, 2, 4, 6, 8]}>{n => (<li><A n={n}></A></li>)}</For></ul>;
        assertEquals(rs.toString(), `<ul><li><div>1</div></li><li><div>2</div></li><li><div>4</div></li><li><div>6</div></li><li><div>8</div></li></ul>`);
    });
});