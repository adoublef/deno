/** @jsx jsx */
/** @jsxFrag Fragment */
import { Fragment, jsx } from "./deps.ts";
import { HtmlEscapedString } from "./deps.ts";

/** [TODO](https://www.solidjs.com/docs/latest/api#for) */
export const For = <T,>({
    each,
    fallback,
    children,
}: ForProps<T>): HtmlEscapedString | Promise<HtmlEscapedString> => {
    if (!each.length) return <>{fallback}</>;
    return <>{each.map(children)}</>;
};

export type ForProps<T> = {
    each: readonly T[];
    fallback?: HtmlEscapedString | Promise<HtmlEscapedString>;
    children: (
        item: T,
        index: number,
    ) => HtmlEscapedString | Promise<HtmlEscapedString>;
};
