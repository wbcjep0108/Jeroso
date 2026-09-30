# Halftone Cursor Reveal Fix Bugfix Design

## Overview

The homepage hero (`components/effects/HalftoneHero.tsx`) picks a halftone variant from a one-shot device-tier check. `readDeviceTier()` returns `"lite"` when the viewport is narrower than 768px, `navigator.hardwareConcurrency <= 4`, or `(pointer: coarse)` matches. `"lite"` maps to `LITE_PROPS`, whose `trigger: "off"` disables the cursor-following reveal. Because the tier is read through `useSyncExternalStore` with a no-op subscribe, it is never re-evaluated.

The fix separates two concerns that the current check conflates:

- Hover capability decides the trigger. It is read from `matchMedia("(any-hover: hover) and (any-pointer: fine)")` and subscribed to, so it updates when a mouse is attached or removed.
- Device weakness (`hardwareConcurrency <= 4` or narrow viewport) only lowers `dotDensity` to 55. It never turns the hover reveal off.

Touch-only devices keep `LITE_PROPS`, reduced motion keeps `REDUCED_MOTION_PROPS`, and all mounting, gating and fade-in logic is untouched. Only `HalftoneHero.tsx` changes.

## Glossary

- **Bug_Condition (C)**: A fine, hover-capable pointer is available, reduced motion is not requested, and the old tier check would have classified the device as lite (cores <= 4, coarse primary pointer, or width < 768 at load, or any later window state after such a load).
- **Property (P)**: The rendered variant has `trigger: "hover"` and `follow: 0.37`, so a sharp circle follows the cursor. `dotDensity` may be 55 or 80.
- **Preservation**: Behavior for reduced-motion users, touch-only devices, capable fine-pointer devices, and all mounting/gating/fade/style logic must remain identical.
- **readDeviceTier**: Function in `components/effects/HalftoneHero.tsx` that classifies the device; the source of the defect.
- **useDeviceTier**: Hook wrapping `readDeviceTier` in `useSyncExternalStore` with `noopSubscribe`.
- **variantProps**: The prop set (`LITE_PROPS`, `FULL_PROPS`, `REDUCED_MOTION_PROPS`) spread onto `HalftoneReveal` after `FIXED_PROPS`.
- **Hover-capable**: `matchMedia("(any-hover: hover) and (any-pointer: fine)").matches` is true, meaning at least one input can hover with fine precision (mouse, trackpad, pen with hover).
- **Weak device**: `(navigator.hardwareConcurrency ?? 8) <= 4` or viewport width < 768px.

## Bug Details

### Bug Condition

The bug manifests when a mouse or trackpad user views the hero without reduced motion on a device that the current check treats as lite. `readDeviceTier` uses the weakness signals and the primary-pointer signal to decide the trigger, so hover is disabled for users who can hover. The no-op subscription also means a narrow-at-load window never recovers.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { anyHoverFine: boolean, primaryCoarse: boolean,
                         cores: number | undefined, widthAtLoad: number,
                         widthNow: number, reducedMotion: boolean }
  OUTPUT: boolean

  oldLite := input.widthAtLoad < 768
             OR (input.cores ?? 8) <= 4
             OR input.primaryCoarse

  RETURN input.anyHoverFine
         AND NOT input.reducedMotion
         AND oldLite
         AND renderedVariant(input).trigger = "off"
END FUNCTION
```

### Examples

- 4-core laptop, mouse, 1440px window: expected circle follows cursor (density 55 acceptable); actual `LITE_PROPS`, no circle.
- Touchscreen laptop (primary pointer coarse) with trackpad, 8 cores, 1920px: expected circle follows cursor at density 80; actual no circle.
- Desktop, 8 cores, page loaded at 700px width: expected circle follows cursor; actual no circle.
- Same desktop, loaded at 700px then widened to 1400px: expected circle still follows cursor; actual still no circle because the tier never re-reads.
- Edge case: `hardwareConcurrency` undefined, mouse, wide window: treated as 8 cores, full variant (unchanged).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Reduced motion always yields `REDUCED_MOTION_PROPS` (`trigger: "off"`, `idleReveal: 1`, `dotDensity: 55`), and `HalftoneReveal`'s internal reduced-motion check stays as is.
- Touch-only devices (no hover-capable fine pointer) yield `LITE_PROPS` (`trigger: "off"`, `idleReveal: 0.35`, `dotDensity: 55`), and the layer style keeps `touchAction: "pan-y"`.
- Capable fine-pointer devices (more than 4 cores, width >= 768) yield `FULL_PROPS` (`trigger: "hover"`, `dotDensity: 80`, `follow: 0.37`).
- Pointer leave/enter fade of the circle (handled inside `HalftoneReveal`) is not touched.
- The SSR snapshot stays `"unknown"`, so nothing mounts before the client check. `shouldRender` still requires `inView && tabVisible && !splashActive`.
- `HalftoneLayer` still starts at opacity 0 and fades in on `onReady`.
- `FIXED_PROPS` and the inline style (`touchAction: "pan-y"`, `cursor: "default"`) are unchanged.
- Hero markup, `pointer-events-none` overlays and link clickability are outside this file's scope and unchanged.

**Scope:**
All inputs where the bug condition does not hold should be unaffected. This includes:
- Any input with reduced motion enabled
- Any device with no hover-capable fine pointer
- Fine-pointer devices with more than 4 cores and width >= 768

## Hypothesized Root Cause

1. **Trigger tied to weakness signals**: `readDeviceTier` returns one boolean `weak` and the variant switch maps it straight to `trigger: "off"`. Core count and width are performance signals and should only affect density.
2. **Primary pointer instead of any pointer**: `(pointer: coarse)` reports only the primary input. Touchscreen laptops report coarse even with a trackpad attached, so hover-capable users are classified as touch.
3. **No subscription**: `useDeviceTier` passes `noopSubscribe`, so the snapshot is computed once. Width changes and input device changes are never picked up.
4. **Ruled out (per requirements)**: overlays, navbar, splash, Lenis and the renderer's pointer mapping. `HalftoneReveal` correctly drives the circle when `trigger` is `"hover"`.

## Correctness Properties

Property 1: Bug Condition - Hover reveal enabled for hover-capable pointers

_For any_ input where the bug condition holds (a hover-capable fine pointer is available, reduced motion is off, and the old check would classify the device as lite), the fixed variant selection SHALL produce `trigger: "hover"` with `follow: 0.37`, with `dotDensity` 55 when the device is weak (cores <= 4 or width < 768) and 80 otherwise, and SHALL keep `trigger: "hover"` after any change of viewport width.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Reduced motion, touch-only and capable devices unchanged

_For any_ input where the bug condition does NOT hold, the fixed variant selection SHALL produce the same props as the original: `REDUCED_MOTION_PROPS` whenever reduced motion is requested, `LITE_PROPS` whenever no hover-capable fine pointer exists, and `FULL_PROPS` for hover-capable devices with more than 4 cores and width >= 768; and the SSR `"unknown"` gating, splash/inView/tabVisible gating, fade-in, `FIXED_PROPS` and inline style SHALL be unchanged.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

**File**: `components/effects/HalftoneHero.tsx`

**Functions**: `readDeviceTier`, `useDeviceTier`, variant selection in `HalftoneHero`, `VariantProps` type

**Specific Changes**:
1. **New prop set**: Add `HOVER_LITE_PROPS = { trigger: "hover", dotDensity: 55, follow: 0.37 } as const`. Leave `LITE_PROPS`, `FULL_PROPS`, `REDUCED_MOTION_PROPS` as they are. Add it to the `VariantProps` union.

2. **New tier values**: Change `DeviceTier` to `"touch" | "hover-lite" | "full" | "unknown"`. Snapshots stay primitive strings so `useSyncExternalStore` compares them with `Object.is` and does not loop.

3. **Rewrite readDeviceTier**:
   ```
   HOVER_QUERY  = "(any-hover: hover) and (any-pointer: fine)"
   NARROW_QUERY = "(max-width: 767px)"

   readDeviceTier():
     if NOT matchMedia(HOVER_QUERY).matches -> "touch"
     weak := (navigator.hardwareConcurrency ?? 8) <= 4 OR matchMedia(NARROW_QUERY).matches
     return weak ? "hover-lite" : "full"
   ```
   The primary-pointer `(pointer: coarse)` check is dropped; `any-hover`/`any-pointer` replaces it.

4. **Real subscription**: Replace `noopSubscribe` in `useDeviceTier` with `subscribeDeviceTier`, which adds `change` listeners to both media query lists and removes them on cleanup (same pattern as `subscribeReducedMotion`). A media query for width is used instead of a `resize` listener so the callback fires only when the 768px threshold is crossed. Remove `noopSubscribe` if unused. Server snapshot stays `() => "unknown"`.

5. **Variant selection**: 
   ```
   reducedMotion        -> REDUCED_MOTION_PROPS
   tier === "touch"     -> LITE_PROPS
   tier === "hover-lite"-> HOVER_LITE_PROPS
   otherwise            -> FULL_PROPS
   ```
   `shouldRender` keeps `tier !== "unknown"`. Update the header comment and the `useDeviceTier` doc comment to describe the new behavior.

**Note on live changes**: `HalftoneReveal`'s setup effect is keyed on `src`, so a tier change after mount does not remount the canvas. Its second effect pushes `dotDensity`, `idleReveal` and `trigger` to uniforms, and `follow` is synced through `followRef`. When switching from `LITE_PROPS` to a hover variant, `idleReveal` becomes undefined and falls back to the component default 0, matching `FULL_PROPS` today. This is acceptable and needs no change to `HalftoneReveal.tsx`.

## Testing Strategy

### Validation Approach

The project has no test runner, so validation is static reasoning over the pure selection logic, type checking (`npx tsc --noEmit`), linting (`npm run lint`), and a manual browser check left to the user. The tests below describe what to check; the selection logic (inputs -> tier -> props) is pure and can be exercised by hand or by a future test harness.

### Exploratory Bug Condition Checking

**Goal**: Confirm the root cause on unfixed code before the change.

**Test Plan**: Trace `readDeviceTier` and the variant ternary for bug-condition inputs, and reproduce in the browser using DevTools overrides on the unfixed build.

**Test Cases**:
1. **4-core mouse user**: In DevTools console before load, or on a 4-core machine, `hardwareConcurrency = 4`, wide window: no circle (fails on unfixed code).
2. **Coarse primary with trackpad**: Touchscreen laptop, or emulate coarse primary pointer: no circle (fails on unfixed code).
3. **Narrow load**: Load at 700px width with a mouse: no circle (fails on unfixed code).
4. **Narrow then widen**: Load at 700px, widen to 1400px: still no circle (fails on unfixed code).

**Expected Counterexamples**:
- `variantProps === LITE_PROPS` (trigger `"off"`) for hover-capable users.
- Cause: weakness and primary-pointer signals drive the trigger, and the snapshot is never re-read.

### Fix Checking

**Goal**: For all bug-condition inputs, the fixed selection yields a hover variant.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  props := selectVariant_fixed(input)
  ASSERT props.trigger = "hover" AND props.follow = 0.37
  ASSERT props.dotDensity = (isWeak(input) ? 55 : 80)
END FOR
```

### Preservation Checking

**Goal**: For all non-bug inputs, the fixed selection matches the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT selectVariant_original(input) = selectVariant_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

The input domain is small (booleans, core count, width), so it can also be enumerated by hand for this change.

**Test Plan**: Observe on unfixed code that reduced motion, touch-only and capable devices produce their current variants, then confirm the fixed code produces the same.

**Test Cases**:
1. **Reduced motion**: With OS reduced motion on, both versions render `REDUCED_MOTION_PROPS` regardless of other inputs.
2. **Touch-only**: With touch emulation (no hover-capable pointer), both versions render `LITE_PROPS` and vertical scroll over the hero still works.
3. **Capable desktop**: 8+ cores, mouse, wide window: both versions render `FULL_PROPS`.
4. **Gating and fade**: Splash, out-of-view and hidden-tab states still keep the canvas unmounted; the canvas still fades in over the static image.

### Unit Tests

- Tier selection for each combination: touch-only, hover + weak cores, hover + narrow, hover + capable.
- Variant selection with reduced motion overriding every tier.
- Edge case: `hardwareConcurrency` undefined treated as 8.

### Property-Based Tests

- Generate random `{ anyHoverFine, primaryCoarse, cores, width, reducedMotion }` and assert Property 1 for bug-condition inputs.
- Generate random non-bug inputs and assert the fixed selection equals the original (Property 2).
- Generate random width sequences for a hover-capable device and assert `trigger` stays `"hover"` at every step.

### Integration Tests

- Manual: mouse on a 4-core machine or with `hardwareConcurrency` overridden, circle follows cursor and fades on leave/re-enter.
- Manual: load narrow, widen and narrow again; circle persists and density switches at 768px without a canvas remount or flash.
- Manual: DevTools touch emulation shows the lite partial reveal with no circle and page scroll works; reduced motion shows the full idle reveal.
- Static: `npx tsc --noEmit` and `npm run lint` pass.
