# Implementation Plan

Note: This project has no test runner. Do not add a test framework. The "tests" below are static checks run as one-off PowerShell or `node -e` commands, plus `npx tsc --noEmit` and `npm run lint`. Leave no temporary script files behind.

- [ ] 1. Write bug condition exploration check
  - **Property 1: Bug Condition** - Fonts resolve from local files without Google Fonts
  - **CRITICAL**: This check MUST FAIL on unfixed code. The failure confirms the bug exists
  - **DO NOT attempt to fix the check or the code when it fails**
  - **NOTE**: This check encodes the expected behavior. It validates the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that show the build depends on Google Fonts and has no local assets
  - **Scoped Approach**: The bug is deterministic, so scope the check to the concrete failing case: `isBugCondition(input)` where `input.command IN ["dev", "build"] AND input.fontLoader = "google" AND input.googleFontsReachable = false`
  - Assert on `app/layout.tsx` (Expected Behavior from design, Property 1):
    - No import from `next/font/google`
    - Imports `localFont` from `next/font/local`
    - Every `src` path resolves to an existing file under `app/fonts/`
    - Cormorant `src` covers exactly {400, 500, 600} x {normal, italic}, no duplicates
    - Inter `src` is `./fonts/inter-latin-wght-normal.woff2` with `weight: "100 900"`, `style: "normal"`
  - Assert each of the 7 woff2 files in `app/fonts/` exists and its first 4 bytes are `wOF2`
  - Run the check on UNFIXED code
  - **EXPECTED OUTCOME**: Check FAILS (layout imports `next/font/google`; `app/fonts/` is missing)
  - Document counterexamples found (for example: "`app/layout.tsx` imports `Cormorant_Garamond, Inter` from `next/font/google`", "`app/fonts/cormorant-garamond-latin-400-normal.woff2` not found")
  - Mark task complete when the check is written, run, and the failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 2. Write preservation checks (BEFORE implementing fix)
  - **Property 2: Preservation** - Font API surface and fallback behavior unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code and record:
    - `cormorant` uses `variable: "--font-cormorant"`, `inter` uses `variable: "--font-inter"`
    - `<html>` className is `${cormorant.variable} ${inter.variable} h-full antialiased`
    - Both fonts use `display: "swap"`
    - Cormorant weights 400/500/600 with normal and italic styles; Inter covers 100 to 900
    - `app/globals.css` maps `--font-sans: var(--font-inter)` and `--font-serif: var(--font-cormorant)`
    - `git status` / `git diff --stat` baseline (which files are already modified before the fix)
  - Write checks that assert the observed values across the finite option set (non-bug-condition consumers: html className, globals.css, components using `font-sans` / `font-serif`, `metadata` export)
  - Run checks on UNFIXED code
  - **EXPECTED OUTCOME**: Checks PASS (confirms baseline to preserve)
  - Mark task complete when checks are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix for build and dev failing when Google Fonts is unreachable

  - [ ] 3.1 Download the 7 woff2 files into `app/fonts/`
    - Create `app/fonts/` and download with PowerShell `Invoke-WebRequest -Uri <url> -OutFile <dest>`:
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2` -> `app/fonts/cormorant-garamond-latin-400-normal.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2` -> `app/fonts/cormorant-garamond-latin-400-italic.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2` -> `app/fonts/cormorant-garamond-latin-500-normal.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2` -> `app/fonts/cormorant-garamond-latin-500-italic.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2` -> `app/fonts/cormorant-garamond-latin-600-normal.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2` -> `app/fonts/cormorant-garamond-latin-600-italic.woff2`
      - `https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2` -> `app/fonts/inter-latin-wght-normal.woff2`
    - Verify each file starts with the `wOF2` signature and is larger than a few KB (reject saved HTML error pages)
    - If any download fails or a file fails verification: STOP before editing `app/layout.tsx` and give the user the exact file names, URLs, and destination folder (`app/fonts/`) from the list above, plus the alternatives:
      - Alternative A: `npm pack @fontsource/cormorant-garamond @fontsource-variable/inter`, extract, copy the same seven files from `package/files/`, delete the tarballs. Do not add these packages as dependencies
      - Alternative B: download the latest release zip from `https://github.com/rsms/inter/releases`, copy `web/InterVariable.woff2` to `app/fonts/inter-latin-wght-normal.woff2`
    - _Requirements: 2.1, 2.2, 2.4, 3.4, 3.5_

  - [ ] 3.2 Edit `app/layout.tsx` to use `next/font/local`
    - Replace `import { Cormorant_Garamond, Inter } from "next/font/google";` with `import localFont from "next/font/local";`
    - Replace both constructors with the target code from the design: Cormorant `src` array with 6 entries (explicit `weight` and `style` each), Inter single `src` with `weight: "100 900"`, `style: "normal"`
    - Keep constant names `cormorant` and `inter`, `variable` values, `display: "swap"`, and the `<html>` className unchanged
    - Drop `subsets` and top-level `weight` / `style` from Cormorant (not accepted by `localFont` / covered per file)
    - Add `fallback: ["serif"]` and `adjustFontFallback: "Times New Roman"` to Cormorant
    - Add `fallback: ["system-ui", "Arial", "sans-serif"]` and `adjustFontFallback: "Arial"` to Inter
    - Leave `metadata`, `RootLayout` body, and all other files untouched. No emojis in code
    - _Bug_Condition: isBugCondition(input) where input.command IN ["dev", "build"] AND input.fontLoader = "google" AND input.googleFontsReachable = false_
    - _Expected_Behavior: Property 1 from design (fonts load from the 7 local woff2 files, no `next/font/google` import, no font download errors)_
    - _Preservation: Preservation Requirements from design (same CSS variables, className, weights/styles, `display: "swap"`, metric-adjusted fallbacks, no other files changed)_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 3.3 Verify bug condition exploration check now passes
    - **Property 1: Expected Behavior** - Fonts resolve from local files without Google Fonts
    - **IMPORTANT**: Re-run the SAME check from task 1. Do NOT write a new check
    - **EXPECTED OUTCOME**: Check PASSES (confirms the bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Verify preservation checks still pass
    - **Property 2: Preservation** - Font API surface and fallback behavior unchanged
    - **IMPORTANT**: Re-run the SAME checks from task 2. Do NOT write new checks
    - Run `npx tsc --noEmit` and `npm run lint`; both must pass with no new errors
    - Run `git status` / `git diff --stat` and confirm the only changes versus the task 2 baseline are `app/layout.tsx` modified and the 7 new files under `app/fonts/`
    - **EXPECTED OUTCOME**: Checks PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8_

- [ ] 4. Checkpoint - Ensure all checks pass
  - Ensure all checks pass, ask the user if questions arise
  - Remind the user to run `npm run build` (and optionally `npm run dev` for a visual check of italic serif headings and Inter body text) on their own network, since that is the integration check
  - Report the final list of files edited or added: `app/layout.tsx` (edited) and the 7 woff2 files under `app/fonts/` (added)
