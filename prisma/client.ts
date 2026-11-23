import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import dns from "node:dns";

import ws from "ws";

const isWorkerRuntime =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

class IPv4WebSocket extends ws {
  constructor(url: string, protocols?: string | string[], options?: ws.ClientOptions) {
    super(url, protocols as never, {
      ...(options ?? {}),
      lookup: (hostname: string, opts: never, cb: never) =>
        dns.lookup(hostname, { ...(opts as dns.LookupAllOptions), family: 4 }, cb as never),
    } as ws.ClientOptions);
  }
}

// Node-only: this dev machine has no working IPv6 route to Neon, so force the
// WebSocket connection over IPv4. Workers use the native WebSocket — `ws` has
// no TCP socket there and its fetch upgrade breaks.
if (!isWorkerRuntime) {
  dns.setDefaultResultOrder("ipv4first");
  neonConfig.webSocketConstructor = IPv4WebSocket as never;
}

// Reuse the client across dev hot reloads; env is loaded by Next itself.
const g = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaNeon({ connectionString: `${process.env.DATABASE_URL}` });
const prisma = g.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") g.prisma = prisma;

export default prisma;
