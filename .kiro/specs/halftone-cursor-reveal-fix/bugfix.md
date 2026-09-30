# Bugfix Requirements Document

## Introduction

The homepage hero renders a halftone WebGL background. Moving a mouse over it should show a sharp, un-halftoned circle (the reveal "loupe") that follows the cursor. For many mouse users the circle never appears: the hero looks like a static halftone with a faint uniform partial reveal and no response to the pointer.

The cause is the device-tier check that picks the hero variant. It classifies a device as "lite" when the viewport is narrower than 768px at load, when the browser reports 4 or fewer CPU cores, or when the primary pointer is coarse. The "lite" variant turns the hover reveal off entirely. As a result, mouse users on common 4-core laptops, on touchscreen laptops whose primary pointer reports coarse, or who loaded the page in a narrow window, never get the cursor circle. The tier is evaluated once and never re-evaluated, so resizing the window does not recover it either.

Other candidate causes were checked and ruled out: the scrims, text container and floating card in the hero are all `pointer-events-none` (links re-enabled only on themselves), the fixed navbar only covers the top bar, the splash overlay unmounts after it finishes and the halftone waits for it, Lenis smooth scroll does not intercept pointer events, and the pointer-to-UV mapping and activity smoothing in the renderer are correct when the hover trigger is enabled.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user with a fine, hover-capable pointer (mouse or trackpad) views the homepage hero on a device reporting 4 or fewer CPU cores and does not prefer reduced motion THEN the system renders the lite variant with the hover reveal disabled, and no circle follows the cursor

1.2 WHEN a user with a fine, hover-capable pointer available views the homepage hero on a device whose primary pointer is reported as coarse (for example a touchscreen laptop) and does not prefer reduced motion THEN the system renders the lite variant with the hover reveal disabled, and no circle follows the cursor

1.3 WHEN a user with a fine, hover-capable pointer loads the homepage while the viewport is narrower than 768px and does not prefer reduced motion THEN the system renders the lite variant with the hover reveal disabled, and no circle follows the cursor

1.4 WHEN a user with a fine, hover-capable pointer loads the homepage in a narrow viewport and then widens the window THEN the system keeps the lite variant with the hover reveal disabled, because the device tier is never re-evaluated

### Expected Behavior (Correct)

2.1 WHEN a user with a fine, hover-capable pointer views the homepage hero on a device reporting 4 or fewer CPU cores and does not prefer reduced motion THEN the system SHALL enable the hover reveal so a sharp circle follows the cursor over the hero (a lower dot density for performance is acceptable)

2.2 WHEN a user with a fine, hover-capable pointer available views the homepage hero on a device whose primary pointer is reported as coarse and does not prefer reduced motion THEN the system SHALL enable the hover reveal so a sharp circle follows the mouse cursor over the hero

2.3 WHEN a user with a fine, hover-capable pointer loads the homepage while the viewport is narrower than 768px and does not prefer reduced motion THEN the system SHALL enable the hover reveal so a sharp circle follows the cursor over the hero

2.4 WHEN a user with a fine, hover-capable pointer loads the homepage in a narrow viewport and then widens the window THEN the system SHALL keep the hover reveal enabled, so the circle follows the cursor at every window size

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user prefers reduced motion (including the Windows "Animation effects" off setting) THEN the system SHALL CONTINUE TO render the reduced-motion variant with no cursor-following circle and the full idle reveal

3.2 WHEN the device has no fine, hover-capable pointer at all (touch-only phones and tablets) THEN the system SHALL CONTINUE TO render the lite variant with the hover reveal off and the partial idle reveal, and vertical page scrolling over the hero SHALL CONTINUE TO work (touch-action pan-y)

3.3 WHEN a user with a fine, hover-capable pointer on a capable device (more than 4 cores, fine primary pointer, wide viewport) views the hero THEN the system SHALL CONTINUE TO render the full variant with the hover reveal, dot density 80 and follow 0.37

3.4 WHEN the cursor leaves the hero THEN the system SHALL CONTINUE TO fade the circle out, and WHEN it re-enters THEN the system SHALL CONTINUE TO fade it back in at the cursor position

3.5 WHEN the splash screen is active, the hero is out of view, or the tab is hidden THEN the system SHALL CONTINUE TO not mount the WebGL canvas, and SHALL CONTINUE TO show the static image underneath

3.6 WHEN the WebGL canvas mounts THEN the system SHALL CONTINUE TO stay transparent until the first frame with the loaded texture and then fade in over the static image

3.7 WHEN the hero renders in any variant THEN the system SHALL CONTINUE TO use the fixed look (ink and paper colors, mono mode, angle 28, reveal radius 0.3, no border radius) and the default cursor style

3.8 WHEN the user hovers or clicks the hero links ("Start Your Journey" and the weekly pick card) THEN the system SHALL CONTINUE TO make them clickable while the rest of the hero passes pointer events through to the canvas
