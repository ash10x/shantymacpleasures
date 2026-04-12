import { getSession } from "@/server/lib/auth";
import { getUsers } from "@/server/actions/adminUsers";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await getSession();
  if (session?.role !== "super_admin") redirect("/admin/dashboard");

  const users = await getUsers();
  return <UsersClient users={users} currentUserId={session.id} />;
}
