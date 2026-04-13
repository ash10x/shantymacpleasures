"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/cartContext";
import { placeOrder, validateCoupon } from "@/server/actions/addOrder";
import { motion } from "framer-motion";
import { Loader2, Tag, Check, AlertCircle } from "lucide-react";

function getErrMsg(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [couponPending, startCouponTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (s: number, i: any) => s + i.price * i.quantity,
    0,
  );
  const grandTotal = Math.max(0, subtotal - discount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    setDiscount(0);
    startCouponTransition(async () => {
      try {
        const result = await validateCoupon(couponCode, subtotal);
        setDiscount(result.discount);
        setCouponMsg({
          text: `Coupon applied! You save $${(result.discount / 100).toFixed(2)}`,
          ok: true,
        });
      } catch (e) {
        setCouponMsg({ text: getErrMsg(e), ok: false });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setError("");
    startTransition(async () => {
      try {
        const { orderIds } = await placeOrder({
          customerName: form.name,
          customerEmail: form.email,
          customerAddress: form.address,
          customerCity: form.city,
          couponCode: couponCode || undefined,
          cart: cart.map((i: any) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        });
        clearCart();
        router.push(
          `/checkout/confirmation?ids=${orderIds.join(",")}&email=${encodeURIComponent(form.email)}`,
        );
      } catch (e) {
        setError(getErrMsg(e));
      }
    });
  };

  return (
    <div className="min-h-screen bg-white py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        {/* Form */}
        <motion.div
          className="backdrop-blur-xl bg-white/70 border border-black/10 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Checkout Details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />
            <input
              type="text"
              name="address"
              placeholder="Shipping Address"
              required
              value={form.address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              required
              value={form.city}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />

            {/* Coupon */}
            <div className="rounded-xl border border-black/10 bg-white/50 p-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-black/50 flex items-center gap-1">
                <Tag size={13} /> Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponMsg(null);
                    setDiscount(0);
                  }}
                  placeholder="ENTER CODE"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-black/10 font-mono text-sm uppercase focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponPending || !couponCode.trim()}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {couponPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`text-xs font-medium flex items-center gap-1 ${couponMsg.ok ? "text-green-600" : "text-red-500"}`}
                >
                  {couponMsg.ok ? (
                    <Check size={13} />
                  ) : (
                    <AlertCircle size={13} />
                  )}
                  {couponMsg.text}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              type="submit"
              disabled={isPending || cart.length === 0}
              className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-pink-200/40 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Placing order…" : "Complete Order"}
            </motion.button>

            <p className="text-xs text-black/50 text-center mt-2">
              🔒 Secure checkout • Discreet packaging guaranteed
            </p>
          </form>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          className="bg-white border border-black/10 rounded-3xl p-8 shadow-md"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Your Order</h2>

          {cart.length === 0 ? (
            <p className="text-black/60">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-black/60">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span>
                    <span>−${(discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(grandTotal / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
