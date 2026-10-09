/** Single source of truth for site navigation, shared by Navbar and Footer. */

import type { SectionId } from "@/lib/sections";

export type NavLink = {
  /** Standalone route; also used for the active state on non-home pages. */
  href: string;
  label: string;
  /** When set, the link goes to this homepage section (/#section) instead of the route. */
  section?: SectionId;
};

export const primaryLinks: NavLink[] = [
  { href: "/wines", label: "Wines" },
  { href: "/tastings", label: "Tastings", section: "tastings" },
  { href: "/insights", label: "Insights", section: "insights" },
  { href: "/about", label: "About", section: "about" },
  { href: "/#contact", label: "Contact", section: "contact" },
];

export const accountLinks: NavLink[] = [
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
