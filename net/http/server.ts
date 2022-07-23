import { pushSorted, setMap } from "../../collection/mod.ts";
import { isMethod } from "../../conditional/mod.ts";
import { BiConsumer, BiTransform, Consumer, ConsumerAsync, Transform } from "../../fp/mod.ts";
import { panic, todo } from "../../macro/mod.ts";
import { dispatchCustom, RequestContext, ServerInit } from "./context.ts";
import { Handle, HandleFunc, handleMethodNotAllowed, handleNotFound, Handler, HandlerFunc } from "./handler.ts";
import { MuxEntry, muxEntry, MuxEntryCollection, MuxEntryInit } from "./muxEntry.ts";
import { handleRedirect, redirectToPathSlash } from "./redirect.ts";
import { upgradeWebSocket } from "./request.ts";

const globalMap: MuxEntryCollection = new Map();

const _found = (method: "GET" | "POST" | "PUT" | "DELETE") => (p: MuxEntry | undefined, [, v]: [URLPattern, MuxEntry[]],): MuxEntry | undefined => {
    const ok = v.find((e) => e.method === method || !e.method);
    ok && !p?.pattern && (p = ok);
    return p;
};

// going to learn some algorithms for this part
const match: BiTransform<Required<Pick<MuxEntryInit, "method" | "map">>, URL, MuxEntry> = ({ method, map }, { href }) => {
    const group = [...map.entries()].filter(([k]) => k.test(href));
    if (!group.length) return muxEntry({ handler: handleNotFound });

    const found = group.reduce(_found(method), {} as undefined | MuxEntry);
    if (!found) return muxEntry({ handler: handleMethodNotAllowed });

    return found;
};

const _handler: BiTransform<Pick<RequestContext, "request">, MuxEntryCollection, MuxEntry> = ({ request: { method, url } }, map) => {
    if (!isMethod(method)) return panic("server: illigal method");

    const u = new URL(url), v = redirectToPathSlash(u, map);
    return v
        ? muxEntry({ handler: handleRedirect(v), pattern: v.pathname, method })
        : match({ method, map }, u);
};

const handler: Transform<RequestContext, MuxEntry> = ctx => _handler(ctx, globalMap);

const _handle: Consumer<MuxEntryInit> = ({ pattern, handler, method, map }) => {
    !pattern && panic("http: invalid pattern");
    !handler && panic("http: nil handler");

    // alreadyRegistered({ arr: globalArray, pattern, method }) && panic("http: mulitple registrations");
    const [e, es] = [muxEntry({ handler, pattern, method }), [...(map ??= globalMap).entries()]];

    map.has(e.pattern) ? pushSorted(map.get(e.pattern)!, e, me => !me.method) : es.push([e.pattern, [e]]);


    setMap(map, es, ([a], [b]) => b.pathname.length - a.pathname.length);
};

export const handle: Handle = (pattern, handler) => _handle({ pattern, handler });
export const handleFunc: HandleFunc = (pattern, hf) => _handle({ pattern, handler: hf });
// I could very much use HOF here but I think it would be more to just use type declarations
export const handleGet: HandleFunc = (pattern, hf) => _handle({ pattern, handler: hf, method: "GET" });
export const handlePost: HandleFunc = (pattern, hf) => _handle({ pattern, handler: hf, method: "POST" });
export const handlePut: HandleFunc = (pattern, hf) => _handle({ pattern, handler: hf, method: "PUT" });
export const handleDelete: HandleFunc = (pattern, hf) => _handle({ pattern, handler: hf, method: "DELETE" });

export const listenAndServe: ConsumerAsync<ServerInit> = async (options) => {
    // FIXME: I could be calling twice?
    dispatchCustom({ obj: globalThis, type: "listen", init: { detail: options }, });

    for await (const conn of Deno.listen(options)) {
        serve(conn, options.handler || new class implements Handler {
            async serveHttp(ctx: RequestContext, { handler: h } = handler(ctx),): Promise<void> { await h.serveHttp(ctx); }
        }());
    }
};

const serve: BiConsumer<Deno.Conn, Handler> = async (conn, handler) => {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
        await handler.serveHttp({ request, respondWith, ...upgradeWebSocket(request), });
    }
};

export class ServeMux implements Handler {
    #list: MuxEntryCollection = new Map();

    async serveHttp(ctx: RequestContext, { handler: h } = this.#handler(ctx),): Promise<void> {
        return await h.serveHttp(ctx);
    }

    #handler(ctx: RequestContext) {
        return _handler(ctx, this.#list);
    }

    #handle({ pattern, handler, method }: MuxEntryInit) {
        _handle({ pattern, handler, method, map: this.#list });
    }

    handle(pattern: string, handler: Handler) {
        this.#handle({ pattern, handler });
    }

    handleFunc(pattern: string, hf: HandlerFunc) {
        this.#handle({ pattern, handler: hf });
    }

    get(pattern: string, hf: HandlerFunc) {
        this.#handle({ pattern, handler: hf, method: "GET" });
    }

    post(pattern: string, hf: HandlerFunc) {
        this.#handle({ pattern, handler: hf, method: "POST" });
    }

    put(pattern: string, hf: HandlerFunc) {
        this.#handle({ pattern, handler: hf, method: "PUT" });
    }

    delete(pattern: string, hf: HandlerFunc) {
        this.#handle({ pattern, handler: hf, method: "DELETE" });
    }
}

export class Server extends EventTarget {
    #options: ServerInit;

    constructor(options: ServerInit) {
        super();
        this.#options = options;
    }

    async listenAndServe() {
        dispatchCustom({ obj: this, type: "listen", init: { detail: this.#options } });
        await listenAndServe(this.#options);
    }

    async listenAndServeTls() {
        await todo();
    }
}
