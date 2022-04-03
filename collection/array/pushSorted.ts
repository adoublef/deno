import { isEqual } from "../../conditional/mod.ts";
import { Predicate } from "./utils.ts";

export const pushSorted = <T extends unknown>(
    list: T[],
    e: T,
    callback: Predicate<T>,
) => {
    const i = list.findIndex(callback);
    isEqual(-1)(i) ? list.push(e) : list.splice(i, 0, e);
};
