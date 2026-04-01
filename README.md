### Name: Rishit Nanda
### Roll No: 2025111008
### URL: [Click Here]()

# How It Started

The idea was to shape the website like a terminal or a futuristic dashboard. I started with the grid background. I knew I wanted a blueprint/engineering-paper feel, so I layered two perpendicular CSS linear gradients. Then I added radial gradient glows at specific viewport positions to solve the boring monocolor vibe. Getting the grid to stay fixed while content scrolled over it was just `background-attachment: fixed`, but it took me a while to realize why it was misbehaving on mobile, turns out, mobile browsers handle fixed backgrounds differently.

---

## D2 — Visual Design System

### 1. Typography choices

- **Progress** is this aggressive, display font that I use on all headings. It looks incredible for uppercase text, but it doesn't work well with digits, the numbers are illegible. My fix was to use `unicode-range` in the `@font-face` declaration to explicitly exclude the digit character range (U+0030 through U+0039). This way, any time a number appears inside a Progress-styled element, the browser uses Fira Code.

- **Fira Code** handles all the technical/monospace stuff — the typewriter text, the JSON block on the contact page, the status indicators.

- **Handmade** is the body font. It's a softer font to make give that human vibe to the site. Without it, the site felt too cold and robotic.

### 2. The CSS Custom Property System

I named all CSS variables semantically rather than visually. For example, `--glass-bg` instead of `--white-70-opacity`. This matters because in dark mode, `--glass-bg` changes from `rgba(255,255,255,0.7)` to `rgba(18,18,18,0.8)` — a completely different color. If I had named it `--white-70`, switching themes would make the variable name a lie. Semantic names let me swap entire palettes by only redeclaring the values in the `[data-theme="dark"]` block.

The `--warning-color` variable was added to the design system and is applied to the contact form's error state, keeping error styling consistent without hardcoding colors.

### 3. The Background Blobs

The site uses ambient background blobs created with CSS. Two large blurred circles are positioned at the viewport edges and animated to drift slowly. They create organic color washes behind the content, enhancing the "anti-gravity" theme.

---

## D3 — Motion & Animation

### 1. Hero Entrance Sequence
Three elements (name, subtitle, social links) fade up in staggered sequence on page load using CSS @keyframes. The stagger guides your eye: name first, then context, then action links. The `animation-fill-mode: forwards` keyword is critical here — without it, elements snap back to `opacity: 0` after the animation ends because that's their initial CSS state. `forwards` tells the browser "keep the final keyframe values."

The easing curve `cubic-bezier(0.16, 1, 0.3, 1)` creates an overshoot effect where elements slide slightly past their resting position before settling. The values chosen were by trial and error.

### 2. Scroll-Triggered Sections
Below-the-fold content starts invisible with a slight downward offset and a 1-degree skew. When the Intersection Observer detects them entering the viewport, a CSS class is toggled that transitions them to full visibility. The subtle skew during entry makes elements feel like they're physically "swinging" into place under gravity.

### 3. Magnetic Button Micro-Interaction
Navigation links and buttons use `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — a curve where the second control point exceeds 1.0, creating a spring-like "bounce back" effect. This specific easing suits buttons because it feels like physical elasticity and responsiveness. When you move your mouse over a nav link, it follows your cursor with a magnetic pull (30% of the offset distance), then springs back to center when you leave. The bounce-back curve makes this feel tactile rather than mechanical.

### 4. Reduced Motion Handling
The `@media (prefers-reduced-motion: reduce)` query respects the user's OS-level accessibility setting. When enabled, it forces all animation and transition durations to near-zero (0.01ms, not 0, so animation-end events still run). There's also a manual toggle in the nav bar that applies the same rules via a CSS class, giving users control even if their OS setting is off. Both approaches are commented directly in the CSS explaining what they do and why.

---

## D4 — JavaScript

I chose to do all 4 features as they were all very interesting and elevated the site's functionality and user experience.

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

The expand/collapse animation uses the `max-height` CSS transition technique. The problem it solves: CSS cannot transition `height: auto` because the browser doesn't know the target pixel value at transition start. The workaround is to transition `max-height` from `0` to some large-enough value like `500px`. The tradeoff is that if content is shorter than 500px (which it always is in my case), the transition timing is slightly off — the animation technically runs for the full 500px worth of time, but most of that time is invisible because the content has already finished expanding. I chose 500px as a safe ceiling that makes the timing feel natural for my content lengths.

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
- **Problem (Bug)**: Previously, a "dead zone" existed at . CSS thought it was mobile (hiding the hover sidebar), but JS thought it was desktop (failing to inject inline images).
- **Solution**: Synchronized all breakpoints (CSS and JS) to **1023px**. 
- **Structural Fix**: Redesigned the About page timeline to wrap descriptions in `.timeline-content`. This enables the CSS `max-height` transition and provides a dedicated container for injected inline images on mobile/tablet devices.

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