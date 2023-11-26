import { html, HtmlEscapedString } from "./deps.ts";

/** [TODO](https://www.solidjs.com/docs/latest/api#show) */
export function Show<T>({
    when,
    fallback,
    children,
}: ShowProps<T>): HtmlEscapedString | Promise<HtmlEscapedString> {
    if (!when) return html`${fallback}`;
    return html`${typeof children === "function" ? children(when) : children}`;
}

type ShowProps<T> = {
    when?: T; // | null | false;
    fallback?: HtmlEscapedString | Promise<HtmlEscapedString>;
    children:
        | HtmlEscapedString
        | Promise<HtmlEscapedString>
        | ((item: T) => HtmlEscapedString | Promise<HtmlEscapedString>);
};
