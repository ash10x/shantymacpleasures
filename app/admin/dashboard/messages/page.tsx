import { getMessages } from "@/server/actions/adminMessages";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const msgs = await getMessages();
  return <MessagesClient messages={msgs} />;
}
