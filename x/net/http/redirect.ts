import { BiPredicate, BiTransform, Transform } from "../../fp/mod.ts";
import { HandlerFunc } from "./handler.ts";
import { MuxEntryCollection } from "./muxEntry.ts";

const shouldRedirect: BiPredicate<Pick<URL, "href">, MuxEntryCollection> = ({ href }, map) => {
    // using a wildcard, I need to be careful with my pattern names
    // if "/*" & "/foo/" registered, regardless of order
    // "/*" will always be called. however "/" wont be
    // is this intened behaviour though? if so then I can live with that
    // TODO: think this issue has been resovled
    if ([...map.keys()].some((pattern) => pattern.test(href))) return false;
    if ([...map.keys()].some((pattern) => pattern.test(href + "/"))) {
        return !href.endsWith("/");
    }

    return false;
};

export const redirectToPathSlash: BiTransform<URL, MuxEntryCollection, URL | undefined> = (url, arr) =>
    shouldRedirect(url, arr) ? new URL(url.href + "/") : undefined;

export const handleRedirect: Transform<Pick<URL, "href">, HandlerFunc> = ({ href }) => {
    return async (e) => await e.respondWith(Response.redirect(href, 302));
};