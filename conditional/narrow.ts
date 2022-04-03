import { isEqual } from "./is/mod.ts";

// export const isUndefined = (a: any) => !a;

export const isNumber = (a: any): a is number => typeof a === "number";

export const isString = (a: any): a is string => typeof a === "string";

export const isWebSocket = <T extends WebSocket>(obj: any): obj is T =>
    "socket" in obj;

export const isMethod = (
    method: string,
): method is "GET" | "POST" | "PUT" | "DELETE" =>
    ["GET", "POST", "PUT", "DELETE"].some(isEqual(method.toUpperCase()));

// export const isHTMLElement = <K extends keyof HTMLElementTagNameMap, T extends HTMLElementTagNameMap[K]>(selector: K) => (obj: any): obj is T => obj.localName == selector;
