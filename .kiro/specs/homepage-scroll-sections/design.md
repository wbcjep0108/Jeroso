# Design: Homepage Scroll Sections (Phase 1)

## Overview

Tastings, Insights, About and Contact become four section components. The homepage
renders all four below the wine collection; each standalone route renders one of them.
A small client-side "section scroll controller" owns every jump to a section: hash on
first load (after the splash), same-page navbar clicks, cross-page navigation and
back/forward. The navbar highlights the section currently on screen.

Phase 1 covers the homepage connection only. The Contact form renders with topic
prefill, but sending (Server Action, email, rate limiting, secrets) is Phase 2 and is
not designed here.

## Architecture

```
app/layout.tsx
  SplashScreen            first on every full load (unchanged behavior)
  SmoothScroll            Lenis root, anchors option turned OFF
  Navbar                  SectionLink for section items, active state from store
  main
    app/page.tsx (home)
      Hero, WineCollection
      TastingsSection   id="tastings"
      InsightsSection   id="insights"
      AboutSection      id="about"
      ContactSection    id="contact"
      HomeSectionScroller   hash on load, popstate, active-section observer
  Footer                  SectionLink for section items, 18+ notice

app/tastings/page.tsx  -> <TastingsSection headingLevel="h1" context="page" />
app/insights/page.tsx  -> <InsightsSection headingLevel="h1" context="page" />
app/about/page.tsx     -> <AboutSection headingLevel="h1" context="page" />
app/contact/page.tsx   -> <ContactSection headingLevel="h1" context="page" />
```

## Components and files

### New

| File | Purpose |
| --- | --- |
| `lib/sections.ts` | Section ids, the scroll offset constant, `scrollToSection()`, and the active-section store (`setActiveSection`, `useActiveSection`). |
| `lib/tastings.ts` | `TastingEvent` type and `getUpcomingTastings()`, returning an empty array for now. |
| `lib/insights.ts` | `InsightGuide` type and `getInsightGuides()`: factual region guides, each listing matching wine slugs. |
| `lib/site-info.ts` | Contact placeholders (address, phone, hours marked "To be filled in") and the `CONTACT_TOPICS` list. |
| `components/sections/SectionShell.tsx` | Shared wrapper: `<section id>` with `scroll-mt-24`, `tabIndex={-1}` for focus, Container, Reveal, and a heading rendered as h1 or h2. |
| `components/sections/TastingsSection.tsx` | Empty state or event list, plus the private-tasting call to action. |
| `components/sections/InsightsSection.tsx` | Guide cards linking to the matching wines. |
| `components/sections/AboutSection.tsx` | J.E.N. (Journey, Essence, Nectar) plus labelled placeholder slots. |
| `components/sections/ContactSection.tsx` | Contact details and `ContactForm`. |
| `components/contact/ContactForm.tsx` | Client form: name, email, topic, message. Reads the `topic` query param. Submit disabled in Phase 1. |
| `components/navigation/SectionLink.tsx` | Link that scrolls on the homepage and navigates to `/#id` elsewhere. |
| `components/navigation/HomeSectionScroller.tsx` | Homepage-only client component: initial hash, popstate, active-section observer. Renders nothing. |

### Changed

| File | Change |
| --- | --- |
| `app/page.tsx` | Render the four sections and `HomeSectionScroller`. |
| `app/{tastings,insights,about,contact}/page.tsx` | Replace `ComingSoon` with the section component, and add metadata. |
| `lib/navigation.ts` | Section items gain `section: "tastings"` and so on; Wines stays a plain route. |
| `components/layout/Navbar.tsx` | Use `SectionLink` for section items; active state from `useActiveSection()` on `/`. |
| `components/layout/Footer.tsx` | Use `SectionLink`; replace the drinking-age line with "Must be 18 or older to purchase alcohol." |
| `components/layout/SmoothScroll.tsx` | Set Lenis `anchors: false`, so the controller is the only thing handling section jumps. |
| `lib/splash-state.ts` | Add a `done` phase and `whenSplashDone(callback)`. |
| `components/ui/SplashScreen.tsx` | Mark the splash done in its cleanup, after the scroll lock is restored. |

`ComingSoon.tsx` stays for `/search`, `/wishlist`, `/account` and `/cart`.

## 1. Splash and hash links

**Goal:** opening `/#contact` (or any shared section link) plays the splash first, then
scrolls to Contact only after the splash has unmounted, with the scroll lock released.

### Splash phase

`lib/splash-state.ts` gains a phase:

- `"pending"`: a full page load that has not finished the splash yet. This is the
  initial value.
- `"active"`: the splash is on screen.
- `"done"`: the splash has unmounted, or it already played during this page load.

`whenSplashDone(callback)` runs the callback immediately if the phase is `"done"`,
otherwise once it becomes `"done"`. It returns an unsubscribe function.

`SplashScreen`'s effect cleanup already restores `overflow` and `padding-right`. The
new order is:

1. Restore the scroll lock.
2. `setSplashActive(false)` (unchanged; resumes the WebGL backgrounds).
3. Set the phase to `"done"`.

Because the phase flips only after step 1, nothing can scroll while the page is still
locked. The splash's existing 9-second hard cap also caps how long the hash waits.

### Initial hash load

The browser performs its own jump to `#contact` while parsing the HTML, before React
hydrates, because the section id is in the server-rendered markup. That jump happens
behind the fully opaque splash, so it is not visible, but the page would already be
sitting at Contact when the splash fades, with no scroll animation.

`HomeSectionScroller` handles this on mount:

1. Read `window.location.hash`. Ignore it unless it matches a known section id.
2. Set `history.scrollRestoration = "manual"` for this load, and call
   `window.scrollTo(0, 0)`. The splash still covers the screen, so this reset is
   invisible.
3. `whenSplashDone(() => scrollToSection(id))`: the page scrolls smoothly from the top
   to Contact right after the overlay is gone.

If the visitor has already scrolled by the time the splash ends (they cannot, since
scroll is locked, but for safety), the controller skips the automatic jump.

## 2. Lenis and anchors

Lenis's built-in `anchors` option is turned off. It only covers same-page clicks, it
does not know about the splash, and it would compete with Next.js scrolling. Every
section jump goes through one function.

### `scrollToSection(id, options)`

```ts
export const SECTION_OFFSET_PX = 96; // matches scroll-mt-24

export function scrollToSection(
  id: SectionId,
  { lenis, immediate = false, focus = true }: ScrollOptions,
): void;
```

1. Find `document.getElementById(id)`. Return if it is missing.
2. **With Lenis running:** `lenis.scrollTo(el, { offset: -SECTION_OFFSET_PX, immediate })`.
3. **Without Lenis** (reduced motion, where `SmoothScroll` never starts Lenis, or
   before it initializes): `el.scrollIntoView({ block: "start" })`. This is an instant
   jump that respects `scroll-margin-top`.
4. If `focus` is true, call `el.focus({ preventScroll: true })` once scrolling settles
   (Lenis `onComplete`, or immediately in the native path), so keyboard users continue
   from the section.

The Lenis instance comes from `useLenis()` in `lenis/react`. `SmoothScroll` uses
`root`, which registers a global instance that `useLenis()` can read outside the
provider. **To verify in implementation:** if `useLenis()` returns `undefined` there,
every call falls back to the native path, which still lands correctly.

### Navbar offset

The navbar is 64px tall once solid on the homepage (88px only at the very top), 72px
on other pages, and it may slide away on scroll down. The offset is one constant,
96px, used in two places:

- `scroll-mt-24` (96px) on every section, for native jumps and no-JavaScript.
- `SECTION_OFFSET_PX = 96` for Lenis.

96px clears the tallest solid navbar (72px) with breathing room. The navbar's
hide-on-scroll-down may hide it after a downward jump; the heading is then simply
further from the top, never covered.

### First load

As in section 1: reset to the top behind the splash, then scroll after the splash ends.

### Same-page clicks (on `/`)

`SectionLink` renders `<Link href="/#contact" scroll={false}>`. On `/`, its click
handler:

1. `preventDefault()`, and close the mobile menu first if it is open.
2. `window.history.pushState(null, "", "/#contact")`: one history entry per click, so
   Back returns to the previous section.
3. `scrollToSection("contact", { lenis })` on the next animation frame, after the menu
   has closed and layout has settled.

Modified clicks (Ctrl, Cmd, Shift, middle button) are not intercepted, so open in new
tab keeps working.

### Route changes (from another page to `/#contact`)

`SectionLink` lets Next.js navigate normally to `/#contact` with `scroll={false}`,
which stops Next.js doing its own instant hash jump. When the homepage mounts,
`HomeSectionScroller` sees the hash. The splash is already `"done"` after client-side
navigation, so it calls `scrollToSection` right away. Before scrolling it jumps to the
top instantly, so the smooth scroll always starts from a predictable place.

### Back and forward

`HomeSectionScroller` listens to `popstate` while on `/`. When the new URL has a known
section hash, it calls `scrollToSection(id, { lenis, immediate: true, focus: false })`.
The native jump the browser may already have made and Lenis's internal position then
agree, and there is no smooth scroll on Back, which matches browser conventions. When
the hash is empty, it leaves the browser's own scroll restoration alone.

Leaving `/` for another route and coming back with Back uses Next.js's normal scroll
restoration; the hash handling above applies only to hash-only history entries.

### Active link

`HomeSectionScroller` observes the four sections with one `IntersectionObserver`
(`rootMargin: "-45% 0px -50% 0px"`, a thin band just above the middle of the screen).
The section crossing that band becomes active through `setActiveSection(id)`. When no
section is in the band (hero or collection on screen), it sets `null`. The Navbar
reads `useActiveSection()` only when `pathname === "/"`; on other pages it keeps
`isActivePath()`.

## 3. Contact prefill

The topic is passed as a **query parameter**, `topic`, validated against
`CONTACT_TOPICS` (for example `general`, `private-tasting`, `wine-question`). Unknown
values are ignored and the form falls back to `general`.

- **On the homepage:** the Tastings call to action is a `SectionLink` to
  `/?topic=private-tasting#contact`. The click handler pushes that URL with
  `history.pushState`, which Next.js syncs into `useSearchParams`, then scrolls to
  Contact. `ContactForm` reads `useSearchParams().get("topic")` and selects it.
- **On `/tastings`:** the same button links to `/contact?topic=private-tasting`, so
  visitors stay in the standalone pages. `TastingsSection` chooses the target from its
  `context` prop (`"home"` or `"page"`).
- **Shared links** such as `/contact?topic=private-tasting` or
  `/?topic=private-tasting#contact` prefill the same way.

The topic select stays under the visitor's control: a later URL change updates the
selection, but typing in other fields never resets it. `ContactForm` is wrapped in
`<Suspense>`, because `useSearchParams` in a statically rendered page needs a Suspense
boundary; the fallback is the same form with `general` selected, so there is no
layout shift.

In Phase 1 the submit button is disabled and reads "Sending available soon".

## 4 to 6. Form security, email setup and rate limiting

Deferred to Phase 2, as requested. That design will cover server-only secrets (no
`NEXT_PUBLIC_`), server-side validation, escaping message text, the Resend
`onboarding@resend.dev` testing limitation and verified domains, and the best-effort
in-memory rate limiter with its Upstash Redis replacement point. Phase 1 adds nothing
that sends, stores or exposes data.

## Section content

- **Tastings:** `getUpcomingTastings()` returns `[]`. The section shows "No events
  scheduled yet" and the private-tasting call to action. When real events are added to
  `lib/tastings.ts`, they render as a list with no other changes.
- **Insights:** one short guide per region represented in `lib/wines.ts`, for example:
  - Sancerre: eastern Loire Valley, France; Sauvignon Blanc; dry, high-acid white;
    pairs with goat cheese and seafood.
  - Barolo: Piedmont, Italy; Nebbiolo; firm tannin and high acidity, usually aged
    before release; pairs with braised meats and truffle dishes.
  - Chablis: northern Burgundy, France; Chardonnay; crisp and mineral, typically with
    little or no new oak; pairs with oysters and shellfish.

  Similar guides cover Rioja, Mosel Riesling Kabinett, Douro, Cava, Cremant d'Alsace,
  Central Otago Pinot Noir and Mendoza Malbec. Each links to its wines by slug. No
  producer claims, tasting notes or scores.
- **About:** the three J.E.N. words, each with one neutral line, followed by three
  dashed-border placeholder blocks labelled "Our story (to be filled in)", "Photos (to
  be filled in)" and "Founder (to be filled in)".
- **Contact:** address, phone and hours from `lib/site-info.ts`, each showing "To be
  filled in", plus the Phase 1 form.

Headings: `SectionShell` renders an h2 on the homepage and an h1 on standalone pages.
Each section also gets `aria-labelledby` pointing at its heading.

## Error handling

- Unknown hash or topic values are ignored.
- A missing target element (for example a section removed later) makes
  `scrollToSection` a no-op.
- If the splash never reports done, its 9-second hard cap still unmounts it and flips
  the phase.
- All listeners, observers and timers are cleaned up when `HomeSectionScroller`
  unmounts, so leaving `/` stops the active-link tracking.

## Performance

- The sections are server components; only `ContactForm`, `SectionLink` and
  `HomeSectionScroller` ship JavaScript.
- One `IntersectionObserver` for the active link, alongside Reveal's shared observer.
- No layout shift: every section is server-rendered with its final height, and the
  form's Suspense fallback is identical to the real form.
- The splash, AeroShards and halftone behavior is unchanged.

## Testing

The project has no test runner. Adding one (for example Vitest) would be a new dev
dependency, so it is optional and needs your approval.

### Automated (no new dependencies)

- `tsc --noEmit`, `eslint` and `next build` pass.
- A build check script inspects the generated HTML:
  - The homepage contains the sections in order: `tastings`, `insights`, `about`,
    `contact`.
  - Each standalone page contains exactly one h1, and the homepage none from the
    sections.
  - Each section has the `scroll-mt-24` class.
  - Navbar and footer section links point to `/#id`.
  - The footer contains "Must be 18 or older to purchase alcohol." on every page.
  - No invented dates: the Tastings output contains "No events scheduled yet".

### Automated (optional, with Vitest)

- Topic parsing: known values select, unknown values fall back to `general`.
- `whenSplashDone`: fires immediately when done, fires once later when pending.

### Manual

1. **Hash load:** open `/#contact` in a new tab. The splash plays, then the page
   scrolls smoothly to Contact with the heading below the navbar. The page scrolls
   normally afterward (lock released).
2. **Shared link from another page:** from `/wines`, click Contact in the navbar. You
   land on the homepage at Contact, with no instant jump followed by a second scroll.
3. **Same-page clicks:** on `/`, click each section link. Smooth scroll, correct
   active underline, URL updates, Back and Forward move between sections.
4. **Mobile menu:** at phone width, open the menu and tap About. The menu closes
   first, then the page scrolls, and the heading is not hidden behind the bar.
5. **Reduced motion:** turn on reduced motion and repeat 1 to 4. Jumps are instant and
   still land below the navbar.
6. **Keyboard:** tab to a navbar section link and press Enter. Focus moves into that
   section; the next Tab reaches its first link or field.
7. **Prefill:** click "Ask about a private tasting" on the homepage and on `/tastings`.
   Both preselect the Private tasting topic.
8. **Active link:** scroll slowly from the hero to the footer. The underline moves
   Tastings, Insights, About, Contact, and none is active over the hero and collection.
9. **Standalone pages:** `/tastings`, `/insights`, `/about` and `/contact` each load on
   their own with the same content as the homepage sections.
10. **Form error states:** Phase 2.
