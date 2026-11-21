import { defineConfig, env } from "prisma/config";
import "dotenv/config";
const databaseUrl = process.env.DATABASE_URL;
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(databaseUrl && { datasource: { url: databaseUrl } }),
});
