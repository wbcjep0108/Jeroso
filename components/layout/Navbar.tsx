"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";
import SectionLink from "@/components/navigation/SectionLink";
import { isActivePath, primaryLinks, type NavLink } from "@/lib/navigation";
import { useActiveSection } from "@/lib/sections";

type NavbarProps = {
  /**
   * See-through over a hero image, turning solid on scroll.
   * Defaults to true on the homepage and false everywhere else.
   */
  transparent?: boolean;
};

const iconLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/search", label: "Search", Icon: Search },
  { href: "/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/cart", label: "Cart", Icon: ShoppingBag },
  { href: "/account", label: "Account", Icon: User },
];

/** Past this, the transparent variant turns solid. */
const SOLID_AFTER = 24;
/** Past this, scrolling down tucks the navbar away; scrolling up brings it back. */
const HIDE_AFTER = 160;
/** Ignore tiny scroll jitter when detecting direction. */
const DIRECTION_TOLERANCE = 8;

const EASE = "motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/** True while the user is scrolling down past HIDE_AFTER. */
function useHideOnScrollDown(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;

      if (y < HIDE_AFTER) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(delta) > DIRECTION_TOLERANCE) {
        setHidden(delta > 0);
        lastY = y;
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}

export default function Navbar({ transparent }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPast(SOLID_AFTER);
  const tuckedAway = useHideOnScrollDown();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const activeSection = useActiveSection();

  const isTransparentVariant = transparent ?? pathname === "/";
  const seeThrough = isTransparentVariant && !scrolled && !menuOpen;
  const hidden = tuckedAway && !menuOpen;

  // Escape closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const mobileLinks: NavLink[] = [...primaryLinks, iconLinks[0], iconLinks[3]];

  // On the homepage, section links follow the section on screen; elsewhere, the route.
  const isHome = pathname === "/";
  const currentValue = isHome ? "location" : "page";
  function isLinkActive(link: NavLink): boolean {
    if (isHome) return link.section !== undefined && link.section === activeSection;
    return isActivePath(pathname, link.href);
  }

  // Only the fixed (hero) variant changes height, so sticky pages never reflow while scrolling.
  const barHeight = isTransparentVariant ? (seeThrough ? "h-22" : "h-16") : "h-18";

  return (
    <header
      className={[
        "inset-x-0 top-0 z-50 border-b",
        isTransparentVariant ? "fixed" : "sticky",
        "motion-safe:transition-[background-color,border-color,box-shadow,backdrop-filter,translate] motion-safe:duration-500",
        EASE,
        // Keyboard users tabbing into a tucked-away bar bring it back.
        hidden ? "-translate-y-full focus-within:translate-y-0" : "translate-y-0",
        seeThrough
          ? "border-transparent bg-transparent backdrop-blur-[0px]"
          : "border-ink-line bg-ink/85 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md",
      ].join(" ")}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <Container
        className={`flex items-center justify-between gap-6 motion-safe:animate-nav-in motion-safe:transition-[height] motion-safe:duration-500 ${EASE} ${barHeight}`}
      >
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {primaryLinks.map((link) => {
              const active = isLinkActive(link);
              const className = [
                      "relative py-2 text-sm tracking-wide motion-safe:transition-colors motion-safe:duration-300",
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-sage-light",
                      "motion-safe:after:transition-transform motion-safe:after:duration-500 motion-safe:after:ease-[cubic-bezier(0.22,1,0.36,1)]",
                      active
                        ? "text-white after:scale-x-100"
                        : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100 focus-visible:after:scale-x-100",
                    ].join(" ");
              return (
                <li key={link.href}>
                  {link.section ? (
                    <SectionLink section={link.section} aria-current={active ? currentValue : undefined} className={className}>
                      {link.label}
                    </SectionLink>
                  ) : (
                    <Link href={link.href} aria-current={active ? "page" : undefined} className={className}>
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1">
            {iconLinks.map(({ href, label, Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href} className={href === "/search" || href === "/account" ? "hidden sm:block" : ""}>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group flex h-10 w-10 items-center justify-center rounded-full",
                      "motion-safe:transition-colors motion-safe:duration-300",
                      active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`h-[18px] w-[18px] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110 ${EASE}`}
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            ref={toggleRef}
            type="button"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {/* Three lines that morph into an X */}
            <span aria-hidden="true" className="relative block h-[15px] w-5">
              {[
                menuOpen ? "top-[7px] rotate-45" : "top-0",
                menuOpen ? "top-[7px] scale-x-0 opacity-0" : "top-[7px]",
                menuOpen ? "top-[7px] -rotate-45" : "top-[14px]",
              ].map((state, i) => (
                <span
                  key={i}
                  className={`absolute left-0 h-px w-5 bg-current motion-safe:transition-all motion-safe:duration-300 ${EASE} ${state}`}
                />
              ))}
            </span>
          </button>
        </div>
      </Container>

      {/* Mobile menu: height animates via grid rows; inert when closed so it is skipped by keyboard and screen readers. */}
      <div
        id={menuId}
        inert={!menuOpen}
        className={[
          "grid lg:hidden motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-500",
          EASE,
          menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <nav aria-label="Mobile" className="overflow-hidden">
          <div className="border-t border-ink-line bg-ink">
            <Container className="py-4">
              <ul className="flex flex-col">
                {mobileLinks.map((link, i) => {
                  const active = isLinkActive(link);
                  const className = [
                    "flex items-center gap-3 border-l-2 py-3 pl-4 font-serif text-2xl italic",
                    "motion-safe:transition-[color,border-color,padding] motion-safe:duration-300",
                    active
                      ? "border-sage-light text-white"
                      : "border-transparent text-white/70 hover:border-sage-dark hover:pl-5 hover:text-white",
                  ].join(" ");
                  return (
                    <li
                      key={link.href}
                      className={[
                        "motion-safe:transition-[opacity,translate] motion-safe:duration-500",
                        EASE,
                        menuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                      ].join(" ")}
                      style={{ transitionDelay: menuOpen ? `${80 + i * 45}ms` : "0ms" }}
                    >
                      {link.section ? (
                        // Closes the menu first, then scrolls (see SectionLink).
                        <SectionLink
                          section={link.section}
                          onNavigate={closeMenu}
                          aria-current={active ? currentValue : undefined}
                          className={className}
                        >
                          {link.label}
                        </SectionLink>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          aria-current={active ? "page" : undefined}
                          className={className}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Container>
          </div>
        </nav>
      </div>
    </header>
  );
}
