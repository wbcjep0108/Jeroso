import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import SplashScreen from "@/components/ui/SplashScreen";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import "lenis/dist/lenis.css";
import "./globals.css";

// Italic serif for headlines and the logo.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Clean sans for everything else.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jeroso",
    template: "%s | Jeroso",
  },
  description:
    "Jeroso is a curated wine house: sommelier picks, tastings, and stories behind every bottle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-sans text-white">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
          {/*
          First element in <body>: server-rendered and visible by default, so it is
          painted on the very first frame of every full load, on any URL. The root
          layout persists across client-side navigation, so links never replay it.
          */}
          <SplashScreen />
            <SiteChrome>{children}</SiteChrome>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
