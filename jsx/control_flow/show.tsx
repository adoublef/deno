import { html, HtmlEscapedString } from "../deps.ts";

/** [TODO](https://www.solidjs.com/docs/latest/api#show) */
export function Show<T>(
    { when, fallback, children }: ShowProps<T>,
): HtmlEscapedString {
    if (!when) return html`${fallback}`;
    return html`${typeof children === "function" ? children(when) : children}`;
}

type ShowProps<T> = {
    when?: T; // | null | false;
    fallback?: HtmlEscapedString;
    children: HtmlEscapedString | ((item: T) => HtmlEscapedString);
};
