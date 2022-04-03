import { ConsumerAsync, Transform } from "../../fp/mod.ts";
import { RequestContext } from "./context.ts";
import { handleMethodNotAllowed, HandlerFunc } from "./handler.ts";

export type Middleware = Transform<HandlerFunc, HandlerFunc>;

type Logger = Transform<
    ConsumerAsync<Pick<RequestContext, "request">>,
    Middleware
>;
export const httpLogger: Logger = (log) => (hf) => async (e) => {
    await log(e);
    return await hf(e);
};

export const allowedMethods: Transform<
    Array<"GET" | "POST" | "PUT" | "DELETE"> | null,
    Middleware
> = (method) => (hf) => async (e) => {
    if (!method || method.some((m) => m === e.request.method)) return await hf(e);

    return await handleMethodNotAllowed(e);
};

export const allowAll = allowedMethods(null);
export const allowGet = allowedMethods(["GET"]);
export const allowPost = allowedMethods(["POST"]);
export const allowPut = allowedMethods(["PUT"]);
export const allowDelete = allowedMethods(["DELETE"]);
