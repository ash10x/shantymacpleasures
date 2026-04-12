import { getOrders } from "@/server/actions/adminOrders";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrdersClient orders={orders} />;
}
