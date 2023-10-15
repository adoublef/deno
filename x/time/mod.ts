import { average } from "../collection/mod.ts";
import { Supplier } from "../fp/mod.ts";

export const { time, timeEnd, timeLog } = console;

// the signature for `logTimer` is like this
// as cant get my Monads to work well with rest parameters
// this is not amazing design wise, but it works so not fussed
export const consoleTimer = (
    label?: string,
): {
    startTimer: Supplier<void>;
    endTimer: Supplier<void>;
    logTimer: (...data: unknown[]) => void;
} => {
    return {
        startTimer: () => time(label),
        endTimer: () => timeEnd(label),
        logTimer: (...data: unknown[]) => timeLog(label, ...data),
    };
};

export const timer = (
    { label, quantity }: { label: string; quantity: number; },
    fn: () => void,
) => {
    let index = 0;
    const arr = [];
    while (index < quantity) {
        const start = Date.now();
        fn();
        arr.push(Date.now() - start);
        index++;
    }

    return `average time for ${label} is equal to ${arr.reduce(average, 0).toFixed(2)
        }ms`;
};
