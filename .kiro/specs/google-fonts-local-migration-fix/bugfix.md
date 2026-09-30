# Bugfix Requirements Document

## Introduction

The root layout loads Cormorant Garamond and Inter from Google Fonts at build and dev time. On the user's network the font download fails, which breaks both `next build` and `next dev`. The site cannot be built or previewed until the fonts are served from files inside the project. The fix must keep the same CSS variable names, class usage, font weights and styles, `display: "swap"` behavior, and fallback fonts, so no other file needs to change.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the project is built or the dev server is started on a network that cannot reach Google Fonts THEN the system fails to download Cormorant Garamond and the build or dev server errors out

1.2 WHEN the project is built or the dev server is started on a network that cannot reach Google Fonts THEN the system fails to download Inter and the build or dev server errors out

1.3 WHEN the project is built or the dev server is started THEN the system depends on an external network request for font files that are not stored in the repository

### Expected Behavior (Correct)

2.1 WHEN the project is built or the dev server is started with no access to Google Fonts THEN the system SHALL load Cormorant Garamond from local woff2 files in the project (weights 400, 500, 600, each in normal and italic, 6 files) and complete without font download errors

2.2 WHEN the project is built or the dev server is started with no access to Google Fonts THEN the system SHALL load Inter from a local woff2 variable font file in the project covering weights 100 to 900 (normal style; italic optional) and complete without font download errors

2.3 WHEN the project is built or the dev server is started THEN the system SHALL NOT make any network request to Google Fonts for these two typefaces

2.4 WHEN the local font files cannot be downloaded automatically THEN the task list SHALL state the exact file names, source, and destination folder for each required woff2 file so the user can add them manually

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the root layout renders THEN the system SHALL CONTINUE TO expose Cormorant Garamond through the `--font-cormorant` CSS variable and Inter through the `--font-inter` CSS variable

3.2 WHEN the root layout renders THEN the system SHALL CONTINUE TO apply `${cormorant.variable} ${inter.variable} h-full antialiased` as the `<html>` className

3.3 WHEN `globals.css` maps `--font-sans` to `var(--font-inter)` and `--font-serif` to `var(--font-cormorant)` THEN the system SHALL CONTINUE TO resolve the Tailwind `font-sans` and `font-serif` utilities to Inter and Cormorant Garamond without edits to `globals.css`

3.4 WHEN text uses Cormorant Garamond at weights 400, 500, or 600 in normal or italic style THEN the system SHALL CONTINUE TO render the matching real face rather than a synthesized weight or slant

3.5 WHEN text uses Inter at any weight from 100 to 900 THEN the system SHALL CONTINUE TO render the matching weight

3.6 WHEN the font files have not yet loaded THEN the system SHALL CONTINUE TO use `font-display: swap` and show a fallback font (serif for Cormorant Garamond, a system sans-serif for Inter) until the web font is ready

3.7 WHEN any component other than the root layout is rendered THEN the system SHALL CONTINUE TO behave exactly as before, with no changes required in those files

3.8 WHEN `npx tsc --noEmit` and `npm run lint` are run after the fix THEN the system SHALL CONTINUE TO pass both with no new errors
