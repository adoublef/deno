import { Predicate, Supplier } from "../../fp/mod.ts";
import { Handler } from "./handler.ts";

export interface RequestContext
    extends Deno.RequestEvent, Partial<Deno.WebSocketUpgrade> { }

export interface ServerInit extends
    Deno.ListenOptions,
    Partial<
    Omit<Deno.ListenTlsOptions, "hostname" | "port" | "transport">
    > {
    transport?: "tcp" | undefined;
    handler?: Handler;
}

interface DispatchInit<T extends EventInit> {
    obj: EventTarget;
    type: string;
    init?: T;
}

export const dispatch: Predicate<DispatchInit<EventInit>> = (
    { obj, type, init },
) => obj.dispatchEvent(new Event(type, init));
export const dispatchCustom: Predicate<DispatchInit<CustomEventInit>> = (
    { obj, type, init },
) => obj.dispatchEvent(new CustomEvent(type, init));

export const serverRunning: Supplier<EventListener> = () =>
    (
        e,
        { detail: { hostname, port, certFile } } = e as CustomEvent<ServerInit>,
    ) => {
        const proto = certFile ? "https://" : "http://";
        (!hostname || hostname.match("0.0.0.0")) && (hostname = "localhost");
        console.log(`server running on ${proto}${hostname}:${port}`);
    };
