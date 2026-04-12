"use server";

import db from "../index";
import { logs } from "../schema";
import { desc, ilike, or } from "drizzle-orm";

export async function writeLog(
  action: string,
  entity?: string,
  entityId?: number,
  details?: string,
  performedBy?: number,
) {
  await db.insert(logs).values({ action, entity, entityId, details, performedBy });
}

type GetLogsOptions = {
  limit?: number;
  query?: string;
};

export async function getLogs({ limit = 50, query }: GetLogsOptions = {}) {
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
