import { isError } from "../../conditional/mod.ts";
import {
    BiConsumerAsync,
    BiTransform,
    result,
    Transform,
} from "../../fp/mod.ts";
import { panic } from "../../macro/mod.ts";
import {
    handleNotFound,
    Handler,
    handleRedirect,
    HandlerFunc,
    htmlResponse,
    RequestContext,
} from "../http/mod.ts";

const serveFile: Transform<string, HandlerFunc> = pathname => async ({ respondWith }) => {
    const file = await Deno.readFile(pathname);

    let contentType: "application/javascript" | "text/html" | "text/plain";
    switch (true) {
        case pathname.endsWith(".js"):
        case pathname.endsWith(".ts"):
            contentType = "application/javascript";
            break;
        case pathname.endsWith(".html"):
            contentType = "text/html";
            break;
        default:
            contentType = "text/plain";
    }

    return await respondWith(new Response(file, { headers: { "Content-Type": contentType } }));
};

const serveDir: Transform<string, HandlerFunc> = pathname => async ({ respondWith }) => {
    let body = "";
    for await (const entry of Deno.readDir(pathname)) {
        const name = entry.name + (entry.isDirectory ? "/" : "");
        body += name.link(name) + "\n";
    }

    const response = htmlResponse(`<pre>${body}</pre>`);
    return await respondWith(response);
};

const serve: BiConsumerAsync<RequestContext, FileServerInit> = async (ctx, { filepath, url: { href, pathname } }) => {
    const info = await result(Deno.lstat(filepath + pathname));
    if (isError(info)) return await handleNotFound(ctx);

    if (info.isFile) return await serveFile(filepath + pathname)(ctx);

    return !pathname.endsWith("/") ? await handleRedirect({ href })(ctx) : await serveDir(filepath + pathname)(ctx);
};

interface FileServerInit {
    filepath: string;
    url: URL;
}

const fileServerOptions: BiTransform<string, Pick<Request, "url">, FileServerInit> = (filepath, { url }) => ({ filepath, url: new URL(url) });

// TODO: change to absolute path not relative
export const stripPrefix: BiTransform<string, Handler, Handler> = (prefix, handler) => (new class implements Handler {
    async serveHttp(ctx: RequestContext, { href, pathname } = new URL(ctx.request.url)): Promise<void> {
        Object.defineProperty(ctx.request, "url", {
            value: href.replace(pathname, pathname.slice(prefix.length - 1))
        });
        return await handler.serveHttp(ctx);
    }
}());

export const fileServer: Transform<string, Handler> = (pathname: string) => (new class implements Handler {
    async serveHttp(ctx: RequestContext): Promise<void> {
        !pathname.startsWith("./") && panic(`not prefixed with "." or "./"`);
        return await serve(ctx, fileServerOptions(pathname, ctx.request));
    }
}());
