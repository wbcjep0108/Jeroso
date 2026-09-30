# Google Fonts Local Migration Bugfix Design

## Overview

`app/layout.tsx` loads Cormorant Garamond and Inter through `next/font/google`. That loader fetches font CSS and files from `fonts.googleapis.com` / `fonts.gstatic.com` during `next dev` and `next build`. On the user's network those requests fail, so both commands error out.

The fix swaps the two `next/font/google` calls for `next/font/local`, pointing at woff2 files committed under `app/fonts/`. Everything the rest of the app depends on stays the same: the `--font-cormorant` and `--font-inter` variables, the `<html>` className, `display: "swap"`, the available weights and styles, and a metric-adjusted fallback font. No other source file changes.

## Glossary

- **Bug_Condition (C)**: A dev or build run where fonts are resolved through `next/font/google`, which requires a network request to Google Fonts. On the user's network that request fails.
- **Property (P)**: The run completes with both typefaces loaded from local files, with no request to Google Fonts.
- **Preservation**: The CSS variables, `<html>` className, weights, styles, `font-display`, fallback behavior, and every other file must stay as they are.
- **F**: The current `app/layout.tsx` using `Cormorant_Garamond` and `Inter` from `next/font/google`.
- **F'**: The fixed `app/layout.tsx` using `localFont` from `next/font/local`.
- **localFont**: The default export of `next/font/local`. Its options (confirmed in `node_modules/next/dist/compiled/@next/font/dist/local/index.d.ts`) are `src` (string or `{ path, weight?, style? }[]`), `display`, `weight`, `style`, `adjustFontFallback` (`"Arial" | "Times New Roman" | false`), `fallback` (`string[]`), `preload`, `variable`, `declarations`.
- **adjustFontFallback**: Generates a `"<Family> Fallback"` `@font-face` built on a local system font, with size-adjust/ascent/descent overrides so layout shift on swap stays small. `next/font/google` does this automatically: Times New Roman for serif families, Arial for sans-serif families.

## Bug Details

### Bug Condition

The bug shows up on any `next dev` or `next build` run where the network can't reach Google Fonts. `next/font/google` has to download the font CSS and files when it compiles `app/layout.tsx`. If that download fails, the font loader throws and compilation stops. The project has no local copy to fall back on.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type BuildRun { command: "dev" | "build", googleFontsReachable: boolean, fontLoader: "google" | "local" }
  OUTPUT: boolean

  RETURN input.command IN ["dev", "build"]
         AND input.fontLoader = "google"
         AND input.googleFontsReachable = false
END FUNCTION
```

A wider condition (req 1.3) also holds: whenever `fontLoader = "google"`, the build needs an external request, even when the network works. The fix removes that dependency completely.

### Examples

- `npm run dev` on the user's network: expected, the dev server starts and pages render in Cormorant/Inter. Actual: a "Failed to fetch font `Cormorant Garamond`" error, and the layout won't compile.
- `npm run build` on the user's network: expected, the build succeeds. Actual: the build fails in `app/layout.tsx` while fetching `Inter`.
- `npm run build` on a network that can reach Google: it succeeds, but it still sends requests to Google Fonts (req 1.3 / 2.3).
- Edge case: a woff2 file is missing from `app/fonts/` after the fix. Expected: `next/font/local` fails with a clear "file not found" error that names the path, not a network error. That's why the tasks list the exact file names.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `cormorant.variable` sets `--font-cormorant` and `inter.variable` sets `--font-inter` (req 3.1).
- `<html className>` stays `${cormorant.variable} ${inter.variable} h-full antialiased` (req 3.2).
- `app/globals.css` keeps `--font-sans: var(--font-inter)` and `--font-serif: var(--font-cormorant)`, unedited. The `font-sans` / `font-serif` utilities used across `app/` and `components/` keep resolving to the same families (req 3.3).
- Cormorant Garamond has real faces for 400/500/600, normal and italic. Many headings use `font-serif italic`, so the italic files are required to avoid a synthesized slant (req 3.4).
- Inter covers weights 100 to 900 through one variable file (req 3.5).
- `font-display: swap`, plus a serif fallback for Cormorant and a system sans-serif fallback for Inter (req 3.6).
- The `metadata` export, `RootLayout` body, and all other components stay unchanged (req 3.7).
- `npx tsc --noEmit` and `npm run lint` still pass (req 3.8).

**Scope:**
Only the font import and the two font constructors in `app/layout.tsx` change. This doesn't affect:
- Any component or page markup and its Tailwind classes
- `globals.css` theme tokens and animations
- Routing, metadata, splash screen, smooth scroll, navbar, footer

## Hypothesized Root Cause

1. **Build-time network dependency in `next/font/google`**: The loader fetches `https://fonts.googleapis.com/css2?...` and then the referenced woff2 files, so it can self-host them. That happens during compilation. It isn't a runtime `<link>`, which is why both `dev` and `build` fail.
2. **Blocked or filtered network**: A firewall, proxy, DNS filter, or TLS interception on the user's network blocks `fonts.googleapis.com` / `fonts.gstatic.com`. It can't be fixed from inside the repo.
3. **No local font assets**: `public/` and `app/` hold no font files, so a local loader has nothing to point at yet.
4. **No offline fallback in the loader**: Retries in `next/font/google` still need the network. Nothing in config makes it work offline, so switching loaders is the only in-repo fix.

## Correctness Properties

Property 1: Bug Condition - Fonts resolve from local files without Google Fonts

_For any_ dev or build run where Google Fonts is unreachable (isBugCondition returns true for the original code), the fixed `app/layout.tsx` SHALL load Cormorant Garamond from the six local woff2 files (400/500/600 x normal/italic) and Inter from the single local variable woff2 (weight 100 900, normal). It SHALL contain no import from `next/font/google`, and the run SHALL finish without font download errors.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Font API surface and fallback behavior unchanged

_For any_ consumer of the fonts outside the loader call (the `<html>` className, `globals.css` variable mapping, `font-sans` / `font-serif` utilities, weight and style usage, and every other component), the fixed layout SHALL produce the same result as the original. That covers the same CSS variable names, the same className string, the same weight and style coverage, `display: "swap"`, and a metric-adjusted serif fallback (Times New Roman) for Cormorant and sans-serif fallback (Arial) for Inter. `npx tsc --noEmit` and `npm run lint` SHALL keep passing.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

**Files added** (binary, under `app/fonts/`):

| Target path | Family | Weight | Style |
|---|---|---|---|
| `app/fonts/cormorant-garamond-latin-400-normal.woff2` | Cormorant Garamond | 400 | normal |
| `app/fonts/cormorant-garamond-latin-400-italic.woff2` | Cormorant Garamond | 400 | italic |
| `app/fonts/cormorant-garamond-latin-500-normal.woff2` | Cormorant Garamond | 500 | normal |
| `app/fonts/cormorant-garamond-latin-500-italic.woff2` | Cormorant Garamond | 500 | italic |
| `app/fonts/cormorant-garamond-latin-600-normal.woff2` | Cormorant Garamond | 600 | normal |
| `app/fonts/cormorant-garamond-latin-600-italic.woff2` | Cormorant Garamond | 600 | italic |
| `app/fonts/inter-latin-wght-normal.woff2` | Inter (variable) | 100 900 | normal |

These names match Fontsource's naming. Latin subset only, same as the current `subsets: ["latin"]`.

**File edited**: `app/layout.tsx`

**Specific Changes**:
1. **Swap the import**: Replace `import { Cormorant_Garamond, Inter } from "next/font/google";` with `import localFont from "next/font/local";`.
2. **Cormorant constructor**: Pass a `src` array with one entry per file, each with an explicit `weight` and `style`. Keep `variable: "--font-cormorant"` and `display: "swap"`. Add `fallback: ["serif"]` and `adjustFontFallback: "Times New Roman"`. Drop `subsets`, `weight`, and `style` at the top level because `localFont` doesn't accept `subsets`, and the per-file entries cover weight and style.
3. **Inter constructor**: Pass a single `src` path with `weight: "100 900"` and `style: "normal"`. Keep `variable: "--font-inter"` and `display: "swap"`. Add `fallback: ["system-ui", "Arial", "sans-serif"]` and `adjustFontFallback: "Arial"`.
4. **Keep constant names**: Keep `cormorant` and `inter` so the JSX className doesn't change.
5. **Paths**: `localFont` resolves `path` relative to the file that calls it, so use `./fonts/...` from `app/layout.tsx`.

Target code:

```tsx
import localFont from "next/font/local";

// Italic serif for headlines and the logo.
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  display: "swap",
  fallback: ["serif"],
  adjustFontFallback: "Times New Roman",
});

// Clean sans for everything else. Variable font covering weights 100 to 900.
const inter = localFont({
  variable: "--font-inter",
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
```

Note on fallbacks: `next/font/google` emits `font-family: '<Family>', '<Family> Fallback'` with a metric-adjusted fallback built on Times New Roman (serif) or Arial (sans). Setting `adjustFontFallback` the same way reproduces that. The generic `fallback` entries only add a safety net at the end of the stack, since `globals.css` defines none.

### Font Sources (manual fallback, req 2.4)

If the automated download is blocked too, the user can download these in a browser and save them under `app/fonts/` using the exact names above.

**Primary source: Fontsource on jsDelivr** (SIL OFL 1.1, same upstream files Google serves):

- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2`
- `https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`

**Alternative A: npm tarball** (works if the npm registry is reachable but jsDelivr isn't):
`npm pack @fontsource/cormorant-garamond @fontsource-variable/inter`, then extract and copy the same seven files from `package/files/`. Delete the tarballs afterwards. Don't add these packages as dependencies.

**Alternative B: official Inter release**: Download the latest release zip from `https://github.com/rsms/inter/releases`, then copy `web/InterVariable.woff2` to `app/fonts/inter-latin-wght-normal.woff2`. This file includes all subsets, not just latin, so it's larger, but it works the same way.

After download, check each file is a real woff2: it should start with the bytes `wOF2` and be larger than a few KB. An HTML error page saved as `.woff2` is a common failure.

## Testing Strategy

### Validation Approach

First, confirm on the unfixed code that the failure comes from the Google Fonts fetch. Then apply the fix and check that the build no longer touches the network for fonts, and that the font API surface the rest of the app sees hasn't changed. This is a config change with no runtime logic, so most checks are static assertions plus the type-check and lint commands. `next build` is the integration check when the user can run it.

### Exploratory Bug Condition Checking

**Goal**: Confirm the failure is the Google Fonts fetch and not something else in the layout.

**Test Plan**: Inspect the unfixed `app/layout.tsx`, and if possible run the build or read the user's reported error.

**Test Cases**:
1. **Loader import check**: `app/layout.tsx` imports from `next/font/google` (true on unfixed code, which confirms C).
2. **Local asset check**: `app/fonts/` doesn't exist or holds no woff2 files (true on unfixed code).
3. **Build error signature**: The `npm run build` error mentions fetching `Cormorant Garamond` or `Inter` from Google Fonts (will fail on unfixed code on the user's network).

**Expected Counterexamples**:
- The build or dev error comes from `next/font/google` failing to fetch.
- Possible causes: blocked `fonts.googleapis.com`, blocked `fonts.gstatic.com`, proxy or TLS interception.

### Fix Checking

**Goal**: With the fix in place, fonts resolve locally and nothing references Google Fonts.

**Pseudocode:**
```
FOR ALL run WHERE isBugCondition(run with fontLoader = "google") DO
  run' := run with fontLoader = "local"
  ASSERT layout.tsx has no import from "next/font/google"
  ASSERT every src path in layout.tsx exists under app/fonts/ and is a valid woff2
  ASSERT cormorant src covers {400,500,600} x {normal,italic}
  ASSERT inter src has weight "100 900", style "normal"
  ASSERT build(run') completes without font fetch errors
END FOR
```

### Preservation Checking

**Goal**: Everything outside the loader call behaves the same.

**Pseudocode:**
```
FOR ALL consumer IN {html className, globals.css, components using font-sans/font-serif, metadata} DO
  ASSERT F(consumer) = F'(consumer)
END FOR
```

**Testing Approach**: This project has no test runner, and the change is declarative config. Property-based testing doesn't fit well here. Preservation is checked by diffing and static assertions over the finite set of options, then by `tsc` and `lint`. If a test framework is added later, a property test could generate (weight, style) pairs from the Cormorant set and assert each maps to exactly one `src` entry.

**Test Cases**:
1. **Variable name preservation**: `variable` values stay `--font-cormorant` and `--font-inter`.
2. **className preservation**: The `<html>` className template literal is character-for-character the same.
3. **Untouched files**: `git diff --stat` shows only `app/layout.tsx` modified plus seven new files under `app/fonts/`.
4. **Display and fallback**: Both fonts set `display: "swap"`. Cormorant uses `adjustFontFallback: "Times New Roman"` and Inter uses `"Arial"`.

### Unit Tests

- Check that each `src` path in `app/layout.tsx` points to an existing file in `app/fonts/`.
- Check that each woff2 file starts with the `wOF2` signature.
- Check that the Cormorant `src` entries form exactly the 6 (weight, style) combinations, with no duplicates.

### Property-Based Tests

- For any (weight, style) in {400,500,600} x {normal,italic}, exactly one Cormorant `src` entry matches (covers req 3.4).
- For any integer weight in 100 to 900, Inter's declared range `"100 900"` includes it (covers req 3.5).
- For any consumer file other than `app/layout.tsx`, the contents are byte-identical before and after the fix (covers req 3.7).

### Integration Tests

- `npx tsc --noEmit` passes. This confirms the `localFont` options match the type definitions.
- `npm run lint` passes with no new errors.
- `npm run build` (run by the user on their network) completes with no Google Fonts request. `.next` output contains self-hosted font files, and the generated CSS declares a hashed fallback face (for example `__cormorant_Fallback_<hash>`) for each family. The local loader generates hashed family names instead of `'Cormorant Garamond'` / `'Inter'`. That's expected and harmless, since everything consumes the fonts through the CSS variables.
- Manual visual check in `npm run dev`: italic serif headings (Hero, WineCard) and Inter body text look the same as before.
