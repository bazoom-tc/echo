import Echo, { type BroadcastDriver, type EchoOptions } from "laravel-echo";
import Pusher from "pusher-js";
import type { ConfigDefaults } from "../types";

let echoInstance: Echo<BroadcastDriver> | null = null;
let echoConfig: EchoOptions<BroadcastDriver> | null = null;

const getEchoInstance = <T extends BroadcastDriver>(): Echo<T> => {
    if (echoInstance) {
        return echoInstance as Echo<T>;
    }

    if (!echoConfig) {
        throw new Error(
            "Echo has not been configured. Please call `configureEcho()`.",
        );
    }

    echoConfig.Pusher ??= Pusher;

    echoInstance = new Echo(echoConfig);

    return echoInstance as Echo<T>;
};

/**
 * Configure the Echo instance with sensible defaults.
 *
 * @link https://laravel.com/docs/broadcasting#client-side-installation
 */
export const configureEcho = <T extends BroadcastDriver>(
    config: EchoOptions<T>,
): void => {
    const defaults: ConfigDefaults<BroadcastDriver> = {
        reverb: {
            broadcaster: "reverb",
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
            wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
            wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
            forceTLS:
                (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https",
            enabledTransports: ["ws", "wss"],
        },
        pusher: {
            broadcaster: "pusher",
            key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
            forceTLS: true,
            wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
            wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT,
            wssPort: process.env.NEXT_PUBLIC_PUSHER_PORT,
            enabledTransports: ["ws", "wss"],
        },
        "socket.io": {
            broadcaster: "socket.io",
            host: process.env.NEXT_PUBLIC_SOCKET_IO_HOST,
        },
        null: {
            broadcaster: "null",
        },
        ably: {
            broadcaster: "pusher",
            key: process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
            wsHost: "realtime-pusher.ably.io",
            wsPort: 443,
            disableStats: true,
            encrypted: true,
        },
    };

    echoConfig = {
        ...defaults[config.broadcaster],
        ...config,
    } as EchoOptions<BroadcastDriver>;

    // Reset the instance if it was already created
    if (echoInstance) {
        echoInstance = null;
    }
};

export const echo = <T extends BroadcastDriver>(): Echo<T> =>
    getEchoInstance<T>();
