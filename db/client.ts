import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

// HTTP queries work in both Node and Cloudflare Workers and need no socket setup.
const sql = neon(`${process.env.DATABASE_URL}`);

const db = drizzle({ client: sql, schema: { ...schema, ...relations } });

export default db;
