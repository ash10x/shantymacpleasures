"use server";

import db from "../index";
import { logs } from "../schema";
import { desc, ilike, or } from "drizzle-orm";
import { getAdminSession } from "../lib/adminSession";

type GetLogsOptions = {
  limit?: number;
  query?: string;
};

export async function getLogs({ limit = 50, query }: GetLogsOptions = {}) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  limit = Math.max(1, Math.min(100, Math.floor(Number.isFinite(limit) ? limit : 50)));
  const trimmedQuery = query?.trim();
  const conditions = trimmedQuery
    ? or(
        ilike(logs.action, `%${trimmedQuery}%`),
        ilike(logs.entity, `%${trimmedQuery}%`),
        ilike(logs.details, `%${trimmedQuery}%`),
      )
    : undefined;

  const baseQuery = db.select().from(logs);

  return (conditions ? baseQuery.where(conditions) : baseQuery)
    .orderBy(desc(logs.createdAt))
    .limit(limit);
}
