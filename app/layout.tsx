import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import SplashScreen from "@/components/ui/SplashScreen";
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
        {/*
          First element in <body>: server-rendered and visible by default, so it is
          painted on the very first frame of every full load, on any URL. The root
          layout persists across client-side navigation, so links never replay it.
        */}
        <SplashScreen />
        <SmoothScroll>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
