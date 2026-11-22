"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  key: string;
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity" | "key">, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  increaseQty: (key: string) => void;
  decreaseQty: (key: string) => void;
  total: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ prevents overwrite on first load

  /* ================= LOAD FROM LOCAL STORAGE ================= */
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const saved = JSON.parse(storedCart) as Array<Partial<CartItem> & Pick<CartItem, "id" | "name" | "price" | "image" | "quantity">>;
        setCart(saved.map((item) => {
          const color = item.color ?? "";
          return { ...item, color, key: `${item.id}:${color}` } as CartItem;
        }));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /* ================= SAVE TO LOCAL STORAGE ================= */
  useEffect(() => {
    if (!isLoaded) return; // ✅ don’t save before initial load

    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart, isLoaded]);

  /* ================= CART FUNCTIONS ================= */
  const addToCart = (product: Omit<CartItem, "quantity" | "key">, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return;
    const color = product.color ?? "";
    const key = `${product.id}:${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        );
      }

      return [...prev, { ...product, color, key, quantity }];
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const increaseQty = (key: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQty = (key: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  /* ================= TOTAL ================= */
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        total,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart must be used inside CartProvider");
  return context;
};
