import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "configs/prisma/schema.prisma",
  migrations: {
    path: "configs/prisma/migrations",
    seed: "tsx configs/prisma/seed/seed.ts"
  },
  datasource: {
    url: env("DIRECT_URL")
  }
});
