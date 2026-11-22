import db from "@/server/index";
import { logs } from "@/server/schema";

/** Internal audit writer. Keep this out of `use server` action modules. */
export async function writeAuditLog(
  action: string,
  entity?: string,
  entityId?: number,
  details?: string,
  performedBy?: number,
) {
  await db.insert(logs).values({ action, entity, entityId, details, performedBy });
}
