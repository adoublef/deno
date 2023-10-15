import { BiConsumer, ConsumerAsync, Transform } from "../../fp/mod.ts";
import { RequestContext } from "./context.ts";
import { HttpResponse, Status } from "./response.ts";

export interface Handler {
    serveHttp(ctx: RequestContext): Promise<void>;
}

export type HandlerFunc = ConsumerAsync<RequestContext>;

export type Handle = BiConsumer<string, Handler>;
export type HandleFunc = BiConsumer<string, HandlerFunc>;

export const handlerFunc: Transform<HandlerFunc, Handler> = (hf) => (new class implements Handler {
    async serveHttp(ctx: RequestContext) { await hf(ctx); }
}());

const handleResponse = <T extends keyof Status>({ status, statusText }: HttpResponse<T>, message?: string) => {
    return async ({ respondWith }: RequestContext) => {
        const bodyInit = message ?? statusText;
        const responseInit = { status, statusText, headers: { "content-type": "text/html" }, };

        return await respondWith(new Response(bodyInit, responseInit));
    };
};

export const handleEcho: Transform<string, HandlerFunc> = (message: string) =>
    handleResponse({ status: 200, statusText: "OK" }, message);

export const handleError = <T extends keyof Status>(v: HttpResponse<T>) => handleResponse(v);

export const handleNotFound = handleError({ status: 404, statusText: "Not Found" });

export const handleMethodNotAllowed = handleError({ status: 405, statusText: "Method Not Allowed", });
