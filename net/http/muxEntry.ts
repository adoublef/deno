import { Transform } from "../../fp/mod.ts";
import { Handler, HandlerFunc, handlerFunc } from "./handler.ts";

type Method =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE";

export interface MuxEntry {
    handler: Handler;
    pattern: URLPattern;
    // src/net/middlware/method.ts [4:49]
    // lets tru use the same API and omit the "*" way
    method?: Method;
}

export type MuxEntryCollection = Map<URLPattern, MuxEntry[]>;

export interface MuxEntryInit extends Pick<MuxEntry, "method"> {
    map?: MuxEntryCollection;
    pattern?: string; //FIXME: this should not really be undefined as itis important, but I dunno how much I will be punished not doing so
    handler: HandlerFunc | Handler;
}

export const muxEntry: Transform<MuxEntryInit, MuxEntry> = ({ handler, pattern, method },) => ({
    handler: "serveHttp" in handler ? handler : handlerFunc(handler),
    pattern: new URLPattern({ pathname: pattern }),
    method,
});

// export const appendPatternSort: BiConsumer<Array<MuxEntry>, MuxEntry> = (arr, e) => pushSorted(arr, e, me => isGreaterThan(me.pattern.pathname.length)(e.pattern.pathname.length));

// export const alreadyRegistered: Predicate<Omit<MuxEntryInit, "handler" | "arr"> & Required<Pick<MuxEntryInit, "map">>> = ({ map, pattern, method }) => arr.some(me => isEqual(method)(me.method) && isEqual(pattern)(me.pattern.pathname));
