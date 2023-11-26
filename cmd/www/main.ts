import { serve } from "../../serve.ts";
import { Hono } from "~/deps.ts";

if (import.meta.main) {
    const app = new Hono()
        .get("/", (_) => new Response("ok"));

    await serve(app);
}
