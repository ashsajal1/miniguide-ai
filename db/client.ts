import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

type Db = ReturnType<typeof create>;

function create() {
  // HTTP queries work in both Node and Cloudflare Workers and need no socket setup.
  return drizzle({
    client: neon(`${process.env.DATABASE_URL}`),
    schema: { ...schema, ...relations },
  });
}

// Lazy: creating the client at import time breaks static builds when
// DATABASE_URL is unset, so the first property access builds it instead.
let instance: Db | undefined;

export default new Proxy({} as Db, {
  get(_target, prop) {
    instance ??= create();
    return Reflect.get(instance, prop, instance);
  },
});
