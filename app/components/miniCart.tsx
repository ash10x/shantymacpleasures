"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/context/cartContext";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/server/lib/money";

export default function MiniCart({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cart, total, increaseQty, decreaseQty, removeFromCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* DRAWER */}
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-white z-50 p-6 flex flex-col shadow-2xl"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Your Cart</h2>

              {/* ❌ CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="text-xl hover:text-pink-500 transition"
              >
                ✕
              </button>
            </div>

            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto space-y-5">
              {cart.length === 0 ? (
                <p className="text-sm text-black/60 text-center mt-10">
                  Your cart is empty
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.key} className="flex gap-3 border-b pb-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      unoptimized
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.color && <p className="text-xs text-black/60">Color: {item.color}</p>}
                      <p className="text-xs text-black/60">{formatMoney(item.price)}</p>

                      {/* QUANTITY */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decreaseQty(item.key)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-pink-100"
                        >
                          -
                        </button>

                        <span className="text-sm">{item.quantity}</span>

                        <button
                          onClick={() => increaseQty(item.key)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-pink-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => removeFromCart(item.key)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-sm hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-6">
              <div className="flex justify-between font-semibold mb-4">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>

              {/* CHECKOUT */}
              <Link href="/checkout">
                <button
                  onClick={onClose}
                  className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-pink-200/40 transition"
                >
                  Checkout
                </button>
              </Link>

              {/* TRUST */}
              <p className="text-xs text-black/50 text-center mt-3">
                🔒 Secure • Discreet • Fast delivery
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
