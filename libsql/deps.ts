/* libsql */
export { LibsqlError } from "$libsql/api";
export type {
    Config
    , Client
    , IntMode
    , InStatement
    , InArgs
    , InValue
    , ResultSet
    , Row
    , Transaction
    , TransactionMode
    , Value
} from "$libsql/api.d.ts";
export {
    expandConfig
} from "$libsql/config";
export type {
    ExpandedConfig
} from "$libsql/config.d.ts";
import Database from "npm:libsql@0.1.29";
export { Database };
/* std */
export { encodeBase64 as encode } from "https://deno.land/std@0.203.0/encoding/base64.ts";