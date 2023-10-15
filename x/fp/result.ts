import { Result, Transform } from "./utils.ts";

export const result = async <T>(promise: Promise<T>): Result<T> => {
    try {
        return await promise;
    } catch (e) {
        return e;
    }
};
