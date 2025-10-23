import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // DATABASE_URL will be provided by environment variables at runtime
    url: env("DATABASE_URL"),
  },
});
