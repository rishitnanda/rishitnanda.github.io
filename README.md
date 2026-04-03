### Name: Rishit Nanda
### Roll No: 2025111008
### URL: [Click Here]()

# How It Started

The idea was to shape the website like a terminal or a futuristic dashboard. I started with the grid background. I knew I wanted a blueprint/engineering-paper feel, so I layered two perpendicular CSS linear gradients. Then I added radial gradient glows at specific viewport positions to solve the boring monocolor vibe. Getting the grid to stay fixed while content scrolled over it was just `background-attachment: fixed`, but it took me a while to realize why it was misbehaving on mobile, turns out, mobile browsers handle fixed backgrounds differently.

---

## D2 — Visual Design System

### 1. Typography choices

- **Flashstrike (Progress)**: This aggressive, industrial display font is used for headers to convey **authority and system-level hierarchy**. It mirrors the "boot sequence" of a high-end interface. 
    - *Justification*: To maintain legibility despite its futuristic style, I used `unicode-range` in the `@font-face` declaration to explicitly exclude the digit character range (U+0030 through U+0039). This ensures that while headers remain bold and thematic, all numerical data is rendered in a clear, monospaced alternative.

- **Fira Code**: Used for all technical/monospace elements like the typewriter text, JSON blocks, and status indicators.
    - *Justification*: It acts as the **"technical anchor"** for the site, validating the developer persona and bridging the gap between a standard UI and a terminal environment.

- **Handmade**: The primary body font. 
    - *Justification*: It was chosen specifically to provide a **human/organic contrast** to the otherwise "cold" and robotic system aesthetic. This duality represents the core of *Interface Design*: making rigid systems accessible and warm for human users.

### 2. The CSS Custom Property System

I named all CSS variables semantically rather than visually (e.g., `--glass-bg` vs. `--white-70`).
    - *Justification*: This ensures **architectural scalability**. By decoupling name from value, swapping entire palettes (Light to Dark) only requires redeclaring values in a single block without making the variable names obsolete or misleading.

### 3. The Anti-Gravity Ambience (Background Blobs)

- **Justification**: Soft, drifting background blobs (blurred circles) were added to **break the rigidity** of the engineering grid. They convey a sense of fluidity and depth, justifying the project's "anti-gravity" theme and providing a premium visual polish that simple solid backgrounds lack.

---

## D3 — Motion & Animation

### 1. Hero Entrance: The "System Boot" Sequence
Three elements (name, subtitle, social links) fade up in a staggered sequence.
    - *Conveyance*: This mimics a **system initialization** or software loading process. The stagger guides the user's focus from identity (name) to purpose (subtitle) to action (links).
    - *Justification*: Using `cubic-bezier(0.16, 1, 0.3, 1)` creates a slight "overshoot" effect, making the UI feel **fluid and dynamic** rather than linear and mechanical.

### 2. Scroll-Triggered Physics
Below-the-fold content enters with a slight downward offset and a 1-degree skew.
    - *Conveyance*: The skew simulates **physical weight and gravity**.
    - *Justification*: It creates a sense of **depth and tactility**, as if the cards are physically sliding into a frame or rack as the user "pulls" the content up.

### 3. Magnetic & Spring Micro-Interactions
Navigation and buttons utilize `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
    - *Conveyance*: These curves create a **Spring-loaded "bounce back"** effect, mimicking physical elasticity.
    - *Justification*: Interactive elements "pull" toward the cursor via magnetic logic to increase **user engagement and delight**. It signals that the interface is "alive" and actively responding to user intent.

### 4. 3D Tilt & perspective
Project cards and modals react to mouse movement with a perspective-aware 3D tilt.
    - *Conveyance*: It reinforces the **layered glassmorphism** aesthetic.
    - *Justification*: By allowing the user to "tilt" the panels, it emphasizes that they are objects floating in an anti-gravity 3D space, rather than flat 2D images.

### 5. Typewriter Feedback
- **Conveyance**: Directly simulates a **low-level terminal prompt** or system log.
- **Justification**: It provides **dynamic storytelling** in the hero section, keeping the landing page visually active and reinforcing the "System Node" theme.

### 6. Reduced Motion Handling
The `@media (prefers-reduced-motion: reduce)` query respects OS-level accessibility settings.
    - *Justification*: Ensures that users with vestibular disorders or a preference for **minimalism and speed** can use the site comfortably. It demonstrates a commitment to inclusive, professional-grade interface design.


---

## D4 — JavaScript

I chose to do the first 3 features fully and B4 partially as they were all very interesting and elevated the site's functionality and user experience.

### Group A Features

#### A1 — Filterable & Bookmarkable Project Index

The Projects page lets you filter cards by technology tags (Python, Games, UI/UX, C/C++). You can select multiple tags at once, and the current filter state gets written into the URL as a query string like `?tags=python,games` using the History API. This means if you share that URL with someone, they'll see the exact same filtered view.

The tricky part was the toggle logic. Clicking "Python" when "All" is active needs to deactivate "All" and activate "Python." Clicking "Python" again when it's the only active filter needs to reset back to "All." And the browser's back button needs to undo filter changes. I handle this with a `popstate` listener that re-reads the URL parameters and re-renders. The cards fade out with a CSS opacity transition, then get `display: none` after 400ms. When they come back, I set `display: flex` first, wait 10ms, then set opacity, that tiny delay is essential because without it the browser batches both changes and skips the transition entirely.

#### A2 — Session-Persistent Reading Progress

The About page has a thin progress bar at the top that tracks how far you've scrolled. But the important part is persistence: it saves your exact scroll position to `sessionStorage` on every scroll event. If you refresh the page or navigate away and come back, a toast notification shows up from the right asking if you want to resume where you left off.

I wrote this as `export class ReadingProgress` in its own file (`progress.js`) to keep it isolated from the main script. The toast notification is created entirely in JavaScript, it doesn't exist in the HTML at all, because it should only appear conditionally. The slide-in animation uses a CSS `right` property transition with a cubic-bezier curve that gives it an elastic "pop-in" feel.

### Group B Features

#### B1 — Typed-Text Component

The hero section on the home page has a typewriter effect that cycles through phrases like `> Initializing System_Daemon()`. It's built as a manual state machine tracking a phrase index, character index, a character stack array, and boolean flags for deleting vs. typing vs. waiting.

The cycle goes: type each character forward (randomized 70-120ms per keystroke for realism) → pause for 2 seconds at the end → erase backward (faster, 30-60ms, because humans delete faster than they type) → move to the next phrase → loop forever.

The blinking cursor is purely CSS — a `@keyframes blink` animation using `step-end` timing. I could have done it in JS, but CSS keeps the cursor blinking at 60fps without any JavaScript execution cost.

#### B2 — Collapsible Timeline with Event Delegation

The About page timeline is built as a single `<ul>` with `<li>` items. Instead of binding a click handler to every single list item (which would be 7 separate listeners), I bound exactly one listener to the parent `<ul>`. When any child is clicked, the event bubbles up, and I use `e.target.closest('.timeline-item')` to figure out which item was actually tapped.

---

## Structural & Semantic Notes

- **Standardization**: The page structure has been unified across all HTML files to use the semantic `<header>` tag wrapping the navigation and progress bar.
- **Global Reset (`box-sizing: border-box`)**: This is a standard global reset. It ensures that when you set a width for a card, any padding or borders you add are included **inside** that width. Without this, a card with 300px width + 20px padding would actually be 340px wide, which breaks most layouts.
- **Nested Header Conflict**: To implement a site-wide sticky navigation, the root `<header>` is fixed to the top of the viewport. The CSS selector specifically targets `body > header` to prevent secondary headings (like "Project_Archive") from also becoming sticky.
- **Responsive Heading Scaling**: Used fluid font sizing (`clamp`) for mobile headings to ensure long titles like "TRANSMISSION_LINK" automatically shrink to fit the viewport width instead of wrapping or overflowing.

## Major Issues Encountered

### Responsive Architecture (Centralized vs. Local)
- **Problem**: Some desktop-only styles (like the `cyber-console` layout) are defined locally in `contact.html` to keep that page's specific logic isolated.
- **Solution**: However, **all** mobile-responsive adjustments (`@media` queries) are centralized in **`style.css`**. 
- **The "Why"**: This creates a single "Control Center" for the site's mobile experience. It prevents "Specificity Wars" between files and allows us to use **`!important`** in the global stylesheet to consistently override local desktop styles across the entire mobile site.

### Unified Breakpoint Synchronization (Bug Fix)
- **Problem (Bug)**: Previously, a "dead zone" existed at 1023px. CSS thought it was mobile (hiding the hover sidebar), but JS thought it was desktop (failing to inject inline images).
- **Solution**: Synchronized all breakpoints (CSS and JS) to **1023px**. 
- **Structural Fix**: Redesigned the About page timeline to wrap descriptions in `.timeline-content`. This enables the CSS `max-height` transition and provides a dedicated container for injected inline images on mobile/tablet devices.

### Timeline Image Viewport Constraint (Overlap Fix)
- **Problem**: On large desktop screens, the fixed timeline hover images would sometimes overflow the screen or overlap other UI elements due to original aspect ratio scaling.
- **Solution**: Implemented a `max-height: 75vh` constraint and `object-fit: cover` styling on the `#timeline-img` element. This ensures the preview image remains fully contained within the browser's vertical viewport regardless of its native dimensions.

### Semantic Conflict (List Item vs. Button Role)
- **Problem**: Assigning `role="button"` to `<li>` elements inside a `<ul>` violates ARIA semantics. An `<li>` tag's implicit role is `listitem`, and changing it breaks the standard structural relation for screen readers.
- **Solution**: Moved all interactive attributes (`tabindex`, `role="button"`, `aria-expanded`, and `aria-label`) from the `<li>` element to the inner `div.timeline-card`. 
- **Logical Mapping**: Updated the event delegation in `script.js` to target the card itself, ensuring the timeline remains fully collapsible and keyboard-navigable while passing formal accessibility validation.

### Latest Fixes (2026-04-03)
- Home: removed invalid `aria-label` on `span.typewriter-text` with `aria-live="polite"` (needed to satisfy specification for non-semantic spans).
- Projects: removed invalid `role="button"` from `article.project-card`; kept keyboard access with `tabindex="0"`.
- Projects: added `aria-label="Projects overview"` and a hidden heading `<h2 class="sr-only">Project Archive</h2>` to satisfy section heading requirement.
- Projects modal: adjusted heading hierarchy from `h4` to `h3` for proper nesting after `<h2>`.

### Visual Feedback (Form Persistence)
- **Problem**: When a user submits an invalid form, it's often unclear exactly which field has failed validation.
- **Solution**: Implemented a **"Shake Animation"** specifically for invalid inputs. When the form is submitted and fails, the problematic fields snap left and right quickly, providing immediate and intuitive visual feedback that complements the text error messages.

---

## Icon Credits

Brand icons (GitHub, LinkedIn) are inline SVGs sourced from **[Simple Icons](https://simpleicons.org/)** — a free, open-source project that provides standardised SVG paths for thousands of brand logos. The paths are embedded directly in the HTML rather than loaded as separate image files, which means zero extra network requests and they scale perfectly at any resolution. They use `fill="currentColor"` so they automatically inherit the text color set by CSS, including on hover and theme changes.

---

## Codepen References

These codepens directly inspired or informed specific implementations:
1. https://codepen.io/santoshban/pen/pvjqqNK — visual inspiration
2. https://codepen.io/rtredes2/pen/QwbNadM — visual inspiration
3. https://codepen.io/milanraring/pen/gOwGpdm — magnetic button effect (the `getBoundingClientRect()` + fractional translate pattern used for nav links and filter buttons)
4. https://codepen.io/arsallanShahab/pen/jOWeBaE — 3D card perspective tilt (the manual `rotateX`/`rotateY` calculation used for project cards and modals)
5. https://codepen.io/cssparadise/pen/LYVybWL — spring effect of modals

---