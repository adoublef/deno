import { isEqual } from "../../conditional/mod.ts";

export const upgradeWebSocket = (request: Request) =>
    isEqual(request.headers.get("upgrade"))("websocket")
        ? Deno.upgradeWebSocket(request)
        : undefined;
