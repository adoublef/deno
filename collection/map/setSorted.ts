import { isEqual } from "../../conditional/mod.ts";
import { Compare } from "../array/utils.ts";

export const setMap = <T, U>(m: Map<T, U>, a: [T, U][], cb: Compare<[T, U]>) =>
    a.sort(cb).forEach((e, i) => {
        isEqual(i)(0) && m.clear();
        m.set(...e);
    });
