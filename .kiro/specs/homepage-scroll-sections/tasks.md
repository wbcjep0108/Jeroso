# Tasks: Homepage Scroll Sections (Phase 1)

Each task ends with `tsc --noEmit`, `eslint` on the touched files, and `next build`
passing. No emojis, no `any`, no new dependencies.

- [x] 1. Shared section plumbing
  - [x] 1.1 Create `lib/sections.ts`: `SECTION_IDS`, `SectionId` type, `isSectionId()`,
    `SECTION_OFFSET_PX = 96`, and the active-section store (`setActiveSection`,
    `useActiveSection`) using `useSyncExternalStore`.
    _Requirements: 1.2, 4.1, 4.2_
  - [x] 1.2 Add `scrollToSection(id, { lenis, immediate, focus })` to `lib/sections.ts`:
    Lenis `scrollTo` with `offset: -SECTION_OFFSET_PX`, native `scrollIntoView`
    fallback, focus the section after scrolling.
    _Requirements: 1.3, 10.4, 10.5_
  - [x] 1.3 Create `components/sections/SectionShell.tsx`: `<section id>` with
    `scroll-mt-24`, `tabIndex={-1}`, `aria-labelledby`, Container, Reveal, heading as h1
    or h2 via a `headingLevel` prop, and a focus style that does not show on scroll.
    _Requirements: 1.3, 1.4, 1.5, 2.4_

- [x] 2. Splash done signal
  - [x] 2.1 Extend `lib/splash-state.ts` with a `"pending" | "active" | "done"` phase and
    `whenSplashDone(callback)` returning an unsubscribe function.
    _Requirements: 10.1_
  - [x] 2.2 In `components/ui/SplashScreen.tsx` cleanup, restore the scroll lock, then
    `setSplashActive(false)`, then set the phase to `"done"`. Also mark `"done"` when the
    splash renders nothing because it already played this load.
    _Requirements: 10.1, 10.2_

- [x] 3. Content data files (no invented facts)
  - [x] 3.1 Create `lib/tastings.ts`: `TastingEvent` type and async
    `getUpcomingTastings()` returning `[]`.
    _Requirements: 5.1, 5.3_
  - [x] 3.2 Create `lib/insights.ts`: `InsightGuide` type (region, country, grape, style,
    pairings, wine slugs) and async `getInsightGuides()` with one factual guide per
    region in `lib/wines.ts`. Check every slug exists.
    _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 3.3 Create `lib/site-info.ts`: address, phone and hours as "To be filled in", and
    `CONTACT_TOPICS` with `isContactTopic()`.
    _Requirements: 8.1_

- [x] 4. Section components
  - [x] 4.1 `components/sections/TastingsSection.tsx`: event list or "No events
    scheduled yet", plus "Ask about a private tasting" linking to
    `/?topic=private-tasting#contact` (context "home") or
    `/contact?topic=private-tasting` (context "page").
    _Requirements: 5.1, 5.2_
  - [x] 4.2 `components/sections/InsightsSection.tsx`: guide cards with links to the
    matching wine detail pages.
    _Requirements: 6.1, 6.3_
  - [x] 4.3 `components/sections/AboutSection.tsx`: Journey, Essence, Nectar, and three
    labelled placeholder blocks (story, photos, founder).
    _Requirements: 7.1, 7.2, 7.3_
  - [x] 4.4 `components/contact/ContactForm.tsx`: name, email, topic and message with
    visible labels; topic read from `useSearchParams` and validated; submit disabled and
    labelled "Sending available soon". `components/sections/ContactSection.tsx`: contact
    details plus the form inside `<Suspense>` with an identical fallback.
    _Requirements: 8.1, 8.2_

- [x] 5. Navigation
  - [x] 5.1 Create `components/navigation/SectionLink.tsx`: real `<Link href="/#id"
    scroll={false}>`. On `/`, intercept plain left clicks: call `onNavigate` (closes the
    mobile menu), `history.pushState`, then `scrollToSection` on the next frame. Leave
    modified clicks alone.
    _Requirements: 3.1, 3.2, 3.3, 3.5, 3.7_
  - [x] 5.2 Add a `section` field to the section items in `lib/navigation.ts`; Wines
    stays a route.
    _Requirements: 3.4_
  - [x] 5.3 Update `components/layout/Navbar.tsx`: desktop and mobile section items use
    `SectionLink`; on `/` the active state comes from `useActiveSection()`, elsewhere
    from `isActivePath()`.
    _Requirements: 3.1, 3.5, 4.1, 4.2, 4.3_
  - [x] 5.4 Update `components/layout/Footer.tsx`: section items use `SectionLink`; replace
    the drinking-age line with "Must be 18 or older to purchase alcohol."
    _Requirements: 3.6, 9.1_
  - [x] 5.5 In `components/layout/SmoothScroll.tsx`, set Lenis `anchors: false`.
    _Requirements: 3.1_

- [x] 6. Homepage scroll controller
  - [x] 6.1 Create `components/navigation/HomeSectionScroller.tsx`:
    - on mount with a known hash: set `history.scrollRestoration = "manual"`, jump to
      the top, then `whenSplashDone(() => scrollToSection(id))`;
    - `popstate` with a known hash: `scrollToSection(id, { immediate: true, focus: false })`;
    - one `IntersectionObserver` (`rootMargin: "-45% 0px -50% 0px"`) driving
      `setActiveSection`, reset to `null` on unmount.
    _Requirements: 3.2, 3.3, 4.1, 4.2, 10.1_

- [x] 7. Pages
  - [x] 7.1 `app/page.tsx`: render Tastings, Insights, About and Contact (context "home",
    h2) after the collection, plus `HomeSectionScroller`.
    _Requirements: 1.1_
  - [x] 7.2 Replace `ComingSoon` in `app/tastings`, `app/insights`, `app/about` and
    `app/contact` with the matching section (context "page", h1) and add title and
    description metadata. Keep `ComingSoon` for the other placeholder routes.
    _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Verification
  - [x] 8.1 Build check script (temporary, deleted afterward) over the built HTML:
    section order on `/`, one h1 per standalone page, `scroll-mt-24` on each section,
    `/#id` links in navbar and footer, the 18+ line on every page, and "No events
    scheduled yet" in Tastings.
    _Requirements: 1.1, 1.3, 2.4, 3.6, 5.1, 9.1_
  - [x] 8.2 Screenshot check at desktop and 500px width of the homepage sections and one
    standalone page.
    _Requirements: 1.4, 10.3_
  - [x] 8.3 Report the manual checks from the design (hash load, mobile menu closing
    before scroll, reduced motion, keyboard focus, prefill, active link) as items for
    you to confirm in a browser.
    _Requirements: 3.5, 10.4, 10.5_
