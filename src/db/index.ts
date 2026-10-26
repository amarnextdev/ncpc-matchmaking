import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * Drizzle database client. SERVER ONLY: never import this from a "use client" file.
 * Uses the Supabase transaction pooler, so prepared statements are turned off.
 */
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

const client = globalForDb.pg ?? postgres(getServerEnv().DATABASE_URL, { prepare: false, max: 5 });

// Reuse one connection pool during hot reload in development.
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Db = typeof db;
