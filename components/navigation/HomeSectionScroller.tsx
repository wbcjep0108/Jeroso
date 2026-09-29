"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { isSplashDone, whenSplashDone } from "@/lib/splash-state";
import {
  SECTION_IDS,
  scrollToSection,
  sectionFromHash,
  setActiveSection,
  type SectionId,
} from "@/lib/sections";

/*
  Homepage-only controller. Renders nothing.

  1. Hash on arrival (/#contact): the browser may already have jumped to the section
     behind the splash. Reset to the top while the splash still covers the page, wait
     for the splash to finish (scroll lock released), then scroll smoothly to it.
     Arriving from another page by client navigation, the splash is already done, so
     it scrolls right away from the top.
  2. Back and forward between section entries: jump instantly, like the browser would.
  3. Active section: one IntersectionObserver with a thin band just above the middle
     of the screen drives the navbar underline.
*/
export default function HomeSectionScroller() {
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | undefined>(lenis);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  // 1. Hash on arrival.
  useEffect(() => {
    const id = sectionFromHash(window.location.hash);
    if (!id) return;

    const firstLoad = !isSplashDone();
    const previousRestoration = window.history.scrollRestoration;
    if (firstLoad) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });

    let frame = 0;
    const unsubscribe = whenSplashDone(() => {
      frame = requestAnimationFrame(() => {
        scrollToSection(id, { lenis: lenisRef.current });
        if (firstLoad) window.history.scrollRestoration = previousRestoration;
      });
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
      if (firstLoad) window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  // 2. Back and forward.
  useEffect(() => {
    function onPopState() {
      const id = sectionFromHash(window.location.hash);
      if (id) scrollToSection(id, { lenis: lenisRef.current, immediate: true, focus: false });
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 3. Active section for the navbar.
  useEffect(() => {
    const visible = new Set<SectionId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        setActiveSection(SECTION_IDS.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      setActiveSection(null);
    };
  }, []);

  return null;
}
