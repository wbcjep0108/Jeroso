"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

type WishlistState = {
  userId: string;
  slugs: string[];
};

type WishlistContextValue = {
  slugs: string[];
  loading: boolean;
  isSaved: (slug: string) => boolean;
  toggleItem: (slug: string) => Promise<void>;
  removeItem: (slug: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [wishlistState, setWishlistState] = useState<WishlistState | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const unsubscribe: Unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "wishlist"),
      (snapshot) => {
        setWishlistState({
          userId: user.uid,
          slugs: snapshot.docs.map((item) => item.id),
        });
      },
      () => setWishlistState({ userId: user.uid, slugs: [] }),
    );

    return unsubscribe;
  }, [authLoading, user]);

  const slugs = useMemo(
    () => (wishlistState && wishlistState.userId === user?.uid ? wishlistState.slugs : []),
    [user, wishlistState],
  );
  const saved = useMemo(() => new Set(slugs), [slugs]);
  const loading = authLoading || Boolean(user && wishlistState?.userId !== user.uid);

  const value = useMemo<WishlistContextValue>(
    () => ({
      slugs,
      loading,
      isSaved: (slug) => saved.has(slug),
      async toggleItem(slug) {
        if (!user) throw new Error("Sign in to save wines to your wishlist.");
        const itemRef = doc(db, "users", user.uid, "wishlist", slug);
        const wasSaved = saved.has(slug);

        setWishlistState((current) => {
          const currentSlugs = current?.userId === user.uid ? current.slugs : slugs;
          return {
            userId: user.uid,
            slugs: wasSaved
              ? currentSlugs.filter((item) => item !== slug)
              : Array.from(new Set([...currentSlugs, slug])),
          };
        });

        try {
          if (wasSaved) {
            await deleteDoc(itemRef);
            return;
          }
          await setDoc(itemRef, { slug, createdAt: serverTimestamp() });
        } catch (error) {
          setWishlistState((current) => {
            const currentSlugs = current?.userId === user.uid ? current.slugs : slugs;
            return {
              userId: user.uid,
              slugs: wasSaved
                ? Array.from(new Set([...currentSlugs, slug]))
                : currentSlugs.filter((item) => item !== slug),
            };
          });
          throw error;
        }
      },
      async removeItem(slug) {
        if (!user) throw new Error("Sign in to update your wishlist.");
        setWishlistState((current) => ({
          userId: user.uid,
          slugs: (current?.userId === user.uid ? current.slugs : slugs).filter(
            (item) => item !== slug,
          ),
        }));
        try {
          await deleteDoc(doc(db, "users", user.uid, "wishlist", slug));
        } catch (error) {
          setWishlistState((current) => ({
            userId: user.uid,
            slugs: Array.from(
              new Set([...(current?.userId === user.uid ? current.slugs : slugs), slug]),
            ),
          }));
          throw error;
        }
      },
    }),
    [loading, saved, slugs, user],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
