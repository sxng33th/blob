# Luma Interactive Design Studio Specification

This document details the architectural structure and technical requirements for building a comprehensive generative design studio and flyer creator directly in the browser, without the need for Node.js, Vite, or React. 

## 1. Project Goal
To create a unified "Design Studio" environment where users can independently design abstract assets (Blobs, Fluid Gradients, Shapes) and pipe those assets into an automated **Flyer Compositor**. The compositor will take basic event details and rapidly generate multiple Luma-style event invites by combining the text with the generated assets.

---

## 2. Technical Stack (Advanced Vanilla JS)
Because this environment requires zero server-side dependencies, we will utilize **Modern Native ES Modules**. 
- **HTML5:** We will use `<script type="module" src="app.js"></script>` to enable modern module importing without a bundler.
- **CSS3:** Heavy reliance on Flexbox/Grid for UI layout, CSS variables for theming, and CSS `radial-gradient` strings for the Fluid backgrounds.
- **JavaScript (ES2022+):** Utilizing classes and pure functions for our generators.
- **Third-Party Libraries:** We will rely on a single external script loaded via CDN (`html2canvas` or `dom-to-image`) so users can download their flyers as PNGs.

---

## 3. Application Architecture

To keep the project stable, we must strictly separate the **UI**, the **State**, and the **Generators**.

### Proposed Folder Structure
```text
d:\Dev\Design\blob\
├── index.html               (The Main Studio Dashboard)
├── style.css                (Global styles and UI theming)
│
├── core/                    (The Engine)
│   ├── state.js             (Global object holding all settings and generated assets)
│   └── dom.js               (Helper functions for creating HTML elements)
│
├── generators/              (The Tools)
│   ├── blob.js              (Calculates SVG paths for blobs)
│   ├── fluid-gradient.js    (Generates CSS gradient meshes via JS math)
│   └── shapes.js            (Computes primitive geometry like stars/pills)
│
├── tools/                   (The User Interfaces)
│   ├── blob-editor.js       (The UI controls for editing blobs)
│   ├── gradient-editor.js   (The UI controls for editing gradients)
│   └── compositor.js        (The Flyer Generator layout logic)
│
└── app.js                   (The entry point that ties everything together)
```

---

## 4. The Generators Detail

### A. Blob Generator (Adapted from existing)
- **Input:** Points, Size, Roundness, Colors.
- **Output:** Returns a raw, stringified `<svg>` element. This logic is decoupled from the DOM so it can be called instantly to generate 10 blobs without rendering them to the screen right away.

### B. Fluid Gradient Generator (New)
- **Mechanism:** Builds complex `background-image: radial-gradient(...)` CSS strings. It randomly positions 4-6 colorful circles with massive blur radiuses overlapping each other.
- **Input:** A Color Palette (3-5 colors).
- **Output:** Returns a CSS string that can be applied to any HTML `<div>`.

### C. Basic Shape Generator (New)
- **Mechanism:** Procedurally draws stars, rings, and pill grids as SVG primitives. 
- **Input:** Type (Polygon/Star), Stroke Weight.
- **Output:** Returns an SVG string with transparency.

---

## 5. The Flyer Compositor (The Main Feature)

This is the ultimate tool in the studio, which unifies the outputs of all the generators.

**Data Inputs (Event Details):**
- Event Title
- Subtitle/Description
- Date & Time
- Location
- Host / Group Name

**The Generation Loop Mechanism:**
1. User clicks "Generate Flyer Array".
2. The UI creates a CSS Grid container to display 4 output cards.
3. A `for` loop runs 4 times. In each iteration:
   - A flyer `<div>` template is created.
   - The engine queries the global `state` to get the user's preferred Asset (e.g., "Use Gradients" or "Use Blobs").
   - The engine calls `FluidGradient.randomize()` to fetch a unique, beautiful gradient string and applies it to the flyer's background.
   - The event text is mapped over the layout in a clean, modern font layout.
4. The 4 unique HTML flyers are appended to the DOM for review.

**Export:**
When a user wants to save iteration #3, the app calls `html2canvas(card3Node)`. This library reads the CSS and HTML of that exact card, draws it to a temporary HTML5 `<canvas>`, and converts it to a downloadable DataURL Image.

---

## 6. Execution Plan

If we proceed with this exact specification, the development naturally falls into three phases:
1. **Refactoring:** Moving the existing `js/blob.js` files into the `generators/` structure and converting them to use standard `export const` ES Modules.
2. **Expanding:** Building the CSS Mesh Generator code and UI.
3. **Compositing:** Building the Flyer Data Form and the Layout Engine.
