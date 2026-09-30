# Implementation Plan

The project has no test runner. Do not add a test framework or dependencies. All checks are one-off `node -e` or PowerShell commands run against `components/effects/HalftoneHero.tsx` (static source checks plus a pure trace of the selection logic). They MUST NOT write temp files to the repo.

- [ ] 1. Write bug condition exploration check
  - **Property 1: Bug Condition** - Hover reveal enabled for hover-capable pointers
  - **CRITICAL**: This check MUST FAIL on unfixed code. Failure confirms the bug exists
  - **DO NOT attempt to fix the check or the code when it fails**
  - **NOTE**: This check encodes the expected behavior and validates the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that show hover-capable users get `LITE_PROPS` (`trigger: "off"`)
  - **Scoped PBT Approach**: The bug is deterministic, so scope the property to the concrete failing cases below
  - Bug condition (from design): `isBugCondition(input)` = `anyHoverFine AND NOT reducedMotion AND (widthAtLoad < 768 OR (cores ?? 8) <= 4 OR primaryCoarse) AND renderedVariant(input).trigger = "off"`
  - Write a single `node -e` script that reads `components/effects/HalftoneHero.tsx` with `fs.readFileSync` (read-only) and:
    - Traces the selection logic for these hover-capable, non-reduced-motion inputs and asserts `trigger === "hover"` and `follow === 0.37`, with `dotDensity` 55 when weak and 80 otherwise (Expected Behavior from design):
      - 4 cores, fine primary, 1440px -> expect hover, density 55 (req 2.1)
      - 8 cores, coarse primary with trackpad, 1920px -> expect hover, density 80 (req 2.2)
      - 8 cores, fine primary, 700px -> expect hover, density 55 (req 2.3)
      - 8 cores, fine primary, loaded 700px then 1400px -> expect hover at both widths (req 2.4)
    - The trace models the source as written: on unfixed code, `readDeviceTier` uses `innerWidth < 768 || cores <= 4 || (pointer: coarse)` and maps `"lite"` to `LITE_PROPS`; on fixed code it uses `(any-hover: hover) and (any-pointer: fine)` plus `(max-width: 767px)` and maps `"hover-lite"` to `HOVER_LITE_PROPS`. Detect which logic is present from the source text (for example presence of `any-hover` and `HOVER_LITE_PROPS`) and evaluate accordingly
    - Asserts statically that `useDeviceTier` does not pass `noopSubscribe` to `useSyncExternalStore` (req 2.4)
  - Run the check on UNFIXED code
  - **EXPECTED OUTCOME**: Check FAILS (proves the bug exists)
  - Document counterexamples, for example: "4 cores + mouse + 1440px -> LITE_PROPS, trigger off", "coarse primary + trackpad -> LITE_PROPS", "700px load -> LITE_PROPS", "useDeviceTier uses noopSubscribe, tier never re-read"
  - Mark complete when the check is written, run, and the failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Write preservation checks (BEFORE implementing fix)
  - **Property 2: Preservation** - Reduced motion, touch-only and capable devices unchanged
  - **IMPORTANT**: Follow observation-first methodology. Read the unfixed source and record the current values before writing assertions
  - Observe on unfixed code:
    - `REDUCED_MOTION_PROPS = { trigger: "off", idleReveal: 1, dotDensity: 55 }` and reduced motion overrides every tier
    - `LITE_PROPS = { trigger: "off", idleReveal: 0.35, dotDensity: 55 }` for touch-only devices
    - `FULL_PROPS = { trigger: "hover", dotDensity: 80, follow: 0.37 }` for >4 cores, fine pointer, width >= 768
    - `FIXED_PROPS` (ink `#0b0f0c`, paper `#f5f3ee`, mode `mono`, angle 28, revealRadius 0.3, borderRadius `0px`)
    - Inline style `{ touchAction: "pan-y", cursor: "default" }`, server snapshot `() => "unknown"`, `shouldRender = inView && tabVisible && tier !== "unknown" && !splashActive`, `HalftoneLayer` starts `opacity-0` and sets ready on `onReady`
  - Write a `node -e` script (read-only, no temp files) that:
    - Traces non-bug-condition inputs through the selection logic (same source-detection approach as task 1) and asserts: reduced motion with any combination of pointer/cores/width -> `REDUCED_MOTION_PROPS`; no hover-capable fine pointer (touch-only) with any cores/width -> `LITE_PROPS`; hover-capable, cores in {6, 8, 16, undefined}, width in {768, 1024, 1920} -> `FULL_PROPS`
    - Enumerates the small input domain exhaustively (booleans x cores {2, 4, 6, 8, undefined} x widths {375, 767, 768, 1440}) rather than sampling
    - Asserts statically that the `LITE_PROPS`, `FULL_PROPS`, `REDUCED_MOTION_PROPS` and `FIXED_PROPS` literals, the inline style, the `"unknown"` server snapshot, the `shouldRender` expression and the `opacity-0`/`onReady` fade logic are present verbatim
  - Run on UNFIXED code
  - **EXPECTED OUTCOME**: Check PASSES (confirms baseline behavior)
  - Mark complete when the check is written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3. Fix hover reveal being disabled for hover-capable pointers

  - [ ] 3.1 Implement the fix in `components/effects/HalftoneHero.tsx` only
    - Add `HOVER_LITE_PROPS = { trigger: "hover", dotDensity: 55, follow: 0.37 } as const`; leave `LITE_PROPS`, `FULL_PROPS`, `REDUCED_MOTION_PROPS` unchanged
    - Add `typeof HOVER_LITE_PROPS` to the `VariantProps` union
    - Change `DeviceTier` to `"touch" | "hover-lite" | "full" | "unknown"` (primitive strings so `useSyncExternalStore` does not loop)
    - Add `HOVER_QUERY = "(any-hover: hover) and (any-pointer: fine)"` and `NARROW_QUERY = "(max-width: 767px)"`
    - Rewrite `readDeviceTier`: not `HOVER_QUERY` -> `"touch"`; `weak = (navigator.hardwareConcurrency ?? 8) <= 4 || matchMedia(NARROW_QUERY).matches`; return `weak ? "hover-lite" : "full"`. Drop the `(pointer: coarse)` and `innerWidth` checks
    - Add `subscribeDeviceTier` that adds `change` listeners on both media query lists and removes them on cleanup (same pattern as `subscribeReducedMotion`); use it in `useDeviceTier`, keep server snapshot `() => "unknown"`, remove `noopSubscribe`
    - Variant selection: reduced motion -> `REDUCED_MOTION_PROPS`; `"touch"` -> `LITE_PROPS`; `"hover-lite"` -> `HOVER_LITE_PROPS`; otherwise `FULL_PROPS`. Keep `shouldRender` unchanged
    - Update the header comment, the section comment ("one-shot client checks") and the `useDeviceTier` doc comment to describe the new behavior
    - Minimal changes, no emojis, do not touch `HalftoneReveal.tsx` or other files
    - _Bug_Condition: isBugCondition(input) where anyHoverFine AND NOT reducedMotion AND (widthAtLoad < 768 OR (cores ?? 8) <= 4 OR primaryCoarse) AND trigger = "off"_
    - _Expected_Behavior: trigger "hover", follow 0.37, dotDensity 55 when weak else 80, stays "hover" across width changes (Property 1 in design)_
    - _Preservation: reduced motion -> REDUCED_MOTION_PROPS, touch-only -> LITE_PROPS, capable -> FULL_PROPS; gating, fade-in, FIXED_PROPS and inline style unchanged (Property 2 in design)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ] 3.2 Verify bug condition exploration check now passes
    - **Property 1: Expected Behavior** - Hover reveal enabled for hover-capable pointers
    - **IMPORTANT**: Re-run the SAME `node -e` check from task 1. Do not write a new one
    - **EXPECTED OUTCOME**: Check PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.3 Verify preservation checks still pass
    - **Property 2: Preservation** - Reduced motion, touch-only and capable devices unchanged
    - **IMPORTANT**: Re-run the SAME `node -e` check from task 2. Do not write a new one
    - **EXPECTED OUTCOME**: Check PASSES (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ] 3.4 Run static verification
    - Run `npx tsc --noEmit` and `npm run lint`; fix any errors introduced in `HalftoneHero.tsx`
    - Run `git status --porcelain` and `git diff --stat` to confirm only `components/effects/HalftoneHero.tsx` changed (besides spec files) and no temp files were left behind
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.7_

- [ ] 4. Checkpoint - Ensure all checks pass and hand off browser verification
  - Confirm checks from tasks 1 and 2, `tsc` and lint all pass
  - Remind the user to verify in the browser (`npm run dev`, run manually):
    - Mouse on a 4-core machine, or DevTools with `navigator.hardwareConcurrency` overridden to 4: circle follows the cursor and fades on leave/re-enter
    - Load at a narrow width (< 768px) with a mouse, then widen past 768px and narrow again: circle persists, density switches with no canvas flash
    - DevTools touch emulation: partial idle reveal, no circle, vertical scroll over the hero works
    - OS reduced motion on: full idle reveal, no circle
  - List the files edited (`components/effects/HalftoneHero.tsx`)
  - Ask the user if questions arise
