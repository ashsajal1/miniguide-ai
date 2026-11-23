import "dotenv/config";
// The `/edge` entry imports Prisma's query-compiler wasm as a module. Workers
// can't compile wasm at runtime, which is what the default entry does.
import { PrismaClient } from '@/generated/prisma/edge';
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
// WebSocket connection over IPv4. In Workers `ws` has no TCP socket and falls
// back to a fetch WebSocket upgrade, whose 101 breaks new Response(); native
// WebSocket handles the connection there.
if (!isWorkerRuntime) {
  dns.setDefaultResultOrder("ipv4first");
  neonConfig.webSocketConstructor = IPv4WebSocket as never;
}

// Polyfill global for environments where it's not defined
const g = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = g.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") g.prisma = prisma;

export default prisma;
