"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

function ConfirmationContent() {
  const params = useSearchParams();
  const ids = params.get("ids")?.split(",").filter(Boolean) ?? [];
  const email = params.get("email") ?? "";

  return (
    <div className="min-h-screen bg-white py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-pink-100/40 via-purple-100/30 to-white blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg"
        >
          ✓
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-semibold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Order Confirmed
        </motion.h1>

        <p className="text-black/60 mb-10">
          Thank you for your purchase. Your order has been received and is being processed with discretion.
        </p>

        <motion.div
          className="bg-white border border-black/10 rounded-2xl p-6 shadow-md text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {ids.length > 0 ? (
            <div className="space-y-2 text-sm text-black/70">
              <p>Order {ids.length === 1 ? "ID" : "IDs"}: <span className="font-mono font-semibold text-black">{ids.map((id) => `#${id}`).join(", ")}</span></p>
              {email && <p>Confirmation will be sent to <span className="font-medium text-black">{email}</span>.</p>}
            </div>
          ) : (
            <p className="text-black/60 text-sm">Your order has been successfully placed.</p>
          )}
        </motion.div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-md"
            >
              Continue Shopping
            </motion.button>
          </Link>
          {email && (
            <Link href={`/orders?email=${encodeURIComponent(email)}`}>
              <button className="px-6 py-3 rounded-full border border-black/20 hover:bg-gray-100 transition">
                Track Your Orders
              </button>
            </Link>
          )}
          <Link href="/">
            <button className="px-6 py-3 rounded-full border border-black/20 hover:bg-gray-100 transition">
              Back to Home
            </button>
          </Link>
        </div>

        <p className="text-xs text-black/50 mt-8">
          🔒 Discreet packaging • Secure processing • Premium support
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

