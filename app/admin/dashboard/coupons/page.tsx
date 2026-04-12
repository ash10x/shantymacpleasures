import { getCoupons } from "@/server/actions/adminCoupons";
import CouponsClient from "./CouponsClient";

export default async function CouponsPage() {
  const coupons = await getCoupons();
  return <CouponsClient coupons={coupons} />;
}
