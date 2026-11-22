import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/lib/adminSession";
import DashboardShell from "./DashboardShell";
import db from "@/server/index";
import { messages } from "@/server/schema";
import { count, eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const unreadMessages = await db
    .select({ value: count() })
    .from(messages)
      .where(eq(messages.read, false));

  return (
    <DashboardShell session={session} unreadCount={unreadMessages[0]?.value ?? 0}>
      {children}
    </DashboardShell>
  );
}
