/** Single source of truth for site navigation, shared by Navbar and Footer. */

export type NavLink = {
  href: string;
  label: string;
};

export const primaryLinks: NavLink[] = [
  { href: "/wines", label: "Wines" },
  { href: "/tastings", label: "Tastings" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const accountLinks: NavLink[] = [
  { href: "/search", label: "Search" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
