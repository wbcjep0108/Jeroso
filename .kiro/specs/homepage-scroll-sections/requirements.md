# Requirements: Homepage Scroll Sections

## Introduction

Bring Tastings, Insights, About and Contact onto the homepage as scrollable sections
below the wine collection, so visitors can explore the whole site in one continuous
scroll. The standalone pages `/tastings`, `/insights`, `/about` and `/contact` stay as
real pages and render the exact same section components, with no duplicated copy.

The Contact section includes a working contact form backed by a Server Action. No
content may be invented: no fake events, articles, awards, dates or history.

## Scope and phasing

- **Phase 1 (this spec's design and tasks):** Requirements 1 to 7, 9 and 10, plus
  Requirement 8 items 1 and 2 (contact details and the form fields, including topic
  prefill). The form renders but its submit button is disabled and labelled as not
  available yet.
- **Phase 2 (deferred):** Requirement 8 items 3 to 15: honeypot, Server Action,
  validation, rate limiting, email sending, environment variables and form states.

## Glossary

- **Section component**: one React component per topic (Tastings, Insights, About,
  Contact) used by both the homepage and its standalone page.
- **Placeholder slot**: a clearly labelled spot ("To be filled in") where the owner will
  add real content later.
- **Send step**: the single function that delivers a validated contact message, which
  can be swapped between providers without touching the form or the action.

## Requirement 1: Sections on the homepage

**User story:** As a visitor, I want to scroll through all of Jeroso on the homepage,
so that I can explore it without jumping between pages.

1. WHEN the homepage loads THEN it SHALL show, in order: Hero, Wine Collection,
   Tastings, Insights, About, Contact, then the Footer.
2. EACH section SHALL have a stable anchor id: `tastings`, `insights`, `about`, `contact`.
3. EACH section SHALL use `scroll-margin-top` equal to at least the navbar height, so
   the sticky or fixed navbar never covers its heading after a jump.
4. EACH section SHALL use the shared Container, palette and fonts. No section may
   define its own width, horizontal padding or CSS file.
5. EACH section SHALL use the existing Reveal scroll in and out transition.

## Requirement 2: Standalone pages reuse the sections

**User story:** As the owner, I want each topic to also have its own page, so that
links can be shared and indexed by search engines.

1. `/tastings`, `/insights`, `/about` and `/contact` SHALL remain real routes.
2. EACH route SHALL render the same section component as the homepage. Content SHALL
   exist in exactly one place.
3. EACH route SHALL have its own page title and meta description.
4. On a standalone page, the section SHALL render as the page's main heading (h1); on
   the homepage it SHALL render as a section heading (h2).

## Requirement 3: Navbar and footer navigation

**User story:** As a visitor, I want the navbar links to take me to the matching
section, so that navigation feels smooth.

1. WHEN on the homepage AND a visitor clicks Tastings, Insights, About or Contact
   THEN the page SHALL smooth-scroll (through Lenis) to that section.
2. WHEN on any other page AND a visitor clicks one of those links THEN they SHALL
   navigate to the homepage and land on that section.
3. The URL SHALL update to `/#tastings`, `/#insights`, `/#about` or `/#contact`, and
   opening such a URL directly SHALL land on that section.
4. The Wines link SHALL keep going to `/wines`.
5. WHEN a link in the mobile menu is used THEN the menu SHALL close before scrolling.
6. The footer links SHALL follow the same rules as the navbar.
7. Links SHALL remain real anchors, so open-in-new-tab and right-click keep working.

## Requirement 4: Active link follows scroll

1. WHILE on the homepage AND a section is the main one on screen THEN its navbar link
   SHALL show the active underline and `aria-current`.
2. WHILE the hero or wine collection is the main content on screen THEN no section
   link SHALL be active.
3. On all other pages the active state SHALL keep using the current route.

## Requirement 5: Tastings section

1. The section SHALL show a "No events scheduled yet" state. It SHALL NOT show any
   invented date, event, venue or price.
2. The section SHALL offer a way to ask about private tastings that leads to the
   Contact section, with the topic preselected in the form.
3. Event data SHALL live in a data file structured like `lib/wines.ts` (typed, read
   through an async function), starting empty, so real events can be added later and
   render automatically.

## Requirement 6: Insights section

1. The section SHALL show short, factual guides based only on the real wines in
   `lib/wines.ts`, for example Sancerre, Barolo and Chablis.
2. EACH guide SHALL cover only well-established facts: region and country, grape,
   general style, and common food pairings. It SHALL NOT include invented tasting
   notes, scores, awards or producer history.
3. EACH guide SHALL link to the matching wine or wines in the catalog.
4. Guide content SHALL live in a typed data file, so it can move to a CMS later.

## Requirement 7: About section

1. The section SHALL present the J.E.N. idea: Journey, Essence, Nectar.
2. The section SHALL include clearly labelled placeholder slots for the owner's real
   story, photos and founder details.
3. It SHALL NOT include any invented history, dates, people or achievements.

## Requirement 8: Contact section and form

**User story:** As a visitor, I want to send Jeroso a message, so that I can ask about
wines or private tastings.

### Display

1. The section SHALL show address, phone and opening hours as placeholders clearly
   marked "To be filled in", stored in one config file.

### Form fields

2. The form SHALL have name, email, topic and message fields, each with a visible label.
3. The form SHALL include a hidden honeypot field that is invisible to people and
   excluded from the tab order and screen readers.

### Server Action

4. Submitting SHALL call a Server Action that uses async and await.
5. The action SHALL validate on the server:
   - name: required, trimmed, 2 to 100 characters;
   - email: required, valid email format, at most 254 characters;
   - topic: one of a fixed list;
   - message: required, trimmed, 10 to 2000 characters.
6. IF validation fails THEN the action SHALL return per-field error messages, and the
   form SHALL show them next to the fields and keep the visitor's input.
7. IF the honeypot field is filled THEN the action SHALL discard the message and
   return a normal success response, giving bots no signal.
8. The action SHALL rate limit by client IP: at most 3 submissions per 10 minutes.
   IF the limit is exceeded THEN it SHALL return a clear "please try again later" error.

### Sending

9. The send step SHALL be one isolated function. With an email provider configured it
   SHALL deliver the message by email; without one it SHALL return a clear "sending is
   not set up yet" error and SHALL NOT pretend the message was sent.
10. Credentials SHALL come only from environment variables and SHALL NEVER appear in
    the repository. An `.env.example` file SHALL list the variable names with no values.
11. The visitor's email SHALL be used as the reply-to address, never as the sender.

### Form states

12. WHILE sending THEN the submit button SHALL be disabled and show a sending state.
13. On success THEN the form SHALL show a confirmation and clear its fields.
14. On error THEN the form SHALL show the error and keep the visitor's input.
15. State changes SHALL be announced to screen readers.

## Requirement 9: Footer age notice

1. The footer SHALL show "Must be 18 or older to purchase alcohol." on every page,
   replacing the current generic drinking-age line.

## Requirement 10: Keep existing behavior

1. The splash screen SHALL remain the first thing shown on every full page load and
   SHALL NOT replay on client-side navigation.
2. The AeroShards background and the halftone hero SHALL stay paused while the splash
   is visible.
3. Adding sections SHALL NOT cause layout shift or delay the hero's first paint.
4. With reduced motion on, scrolling to a section SHALL jump instantly.
5. After a navbar jump, keyboard focus SHALL move to the target section.

## Constraints

- No new dependencies unless required for email.
- No emojis in code or comments. No `any` types.
- No per-page CSS files; Tailwind utilities and `app/globals.css` only.
