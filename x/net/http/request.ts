import { isEqual } from "../../conditional/mod.ts";
import { Transform, Option } from "../../fp/mod.ts";

// Should this be async?
export const upgradeWebSocket: Transform<Request, Option<Deno.WebSocketUpgrade>> = request => {
    return isEqual(request.headers.get("upgrade"))("websocket") ? Deno.upgradeWebSocket(request) : undefined;
};