import { redirect } from "next/navigation";
import { getSession } from "@/server/lib/auth";
import DashboardShell from "./DashboardShell";
import db from "@/server/index";
import { messages } from "@/server/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin");

  const unreadMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.read, false));

  return (
    <DashboardShell session={session} unreadCount={unreadMessages.length}>
      {children}
    </DashboardShell>
  );
}
