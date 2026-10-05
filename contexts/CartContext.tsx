"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  updateQuantity: (slug: string, quantity: number) => Promise<void>;
  removeItem: (slug: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cartState, setCartState] = useState<{ userId: string; items: CartItem[] } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      return;
    }

    const unsubscribe: Unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "cart"),
      (snapshot) => {
        setCartState({ userId: user.uid, items: snapshot.docs.map((item) => item.data() as CartItem) });
      },
      () => setCartState({ userId: user.uid, items: [] }),
    );

    return unsubscribe;
  }, [authLoading, user]);

  const items = useMemo(
    () => (cartState?.userId === user?.uid ? (cartState?.items ?? []) : []),
    [cartState, user],
  );
  const loading = authLoading || Boolean(user && cartState?.userId !== user.uid);

  const value = useMemo<CartContextValue>(() => ({
    items,
    loading,
    async addItem(item, quantity = 1) {
      if (!user) throw new Error("Sign in to add items to your cart.");
      const itemRef = doc(db, "users", user.uid, "cart", item.slug);
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(itemRef);
        const previousQuantity = existing.exists() ? Number(existing.data().quantity) || 0 : 0;
        transaction.set(itemRef, {
          ...item,
          quantity: Math.min(12, previousQuantity + quantity),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
    },
    async updateQuantity(slug, quantity) {
      if (!user) throw new Error("Sign in to update your cart.");
      const itemRef = doc(db, "users", user.uid, "cart", slug);
      if (quantity <= 0) {
        await deleteDoc(itemRef);
        return;
      }
      await setDoc(itemRef, { quantity: Math.min(12, quantity), updatedAt: serverTimestamp() }, { merge: true });
    },
    async removeItem(slug) {
      if (!user) throw new Error("Sign in to update your cart.");
      await deleteDoc(doc(db, "users", user.uid, "cart", slug));
    },
  }), [items, loading, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
