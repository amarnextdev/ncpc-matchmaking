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

/**
 * The pooler closes connections that sit idle, and a dead connection makes the next query hang
 * or fail ("Failed query"). So: drop idle connections early, recycle old ones, and give up quickly
 * when a new connection can't be opened.
 */
const client =
  globalForDb.pg ??
  postgres(getServerEnv().DATABASE_URL, {
    prepare: false,
    max: 5,
    idle_timeout: 20, // seconds without use → close
    max_lifetime: 60 * 15, // recycle every 15 minutes
    connect_timeout: 10, // seconds to open a connection
  });

// Reuse one connection pool during hot reload in development.
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Db = typeof db;
