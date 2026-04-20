# Nakshatram Design System

A minimal, monochrome pro-tool aesthetic for creative applications.

---

## Philosophy

- **High-contrast** - Pure blacks (#050505) with white accents
- **Geometric precision** - Clean lines, subtle borders
- **Breathing room** - Generous padding, not cramped
- **Technical feel** - Monospace for data, sans-serif for labels

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#050505` | Main background |
| `--surface` | `#0f0f0f` | Cards, inputs |
| `--border` | `#222222` | Dividers, input borders |
| `--border-hover` | `#444444` | Hover states |
| `--text-main` | `#ffffff` | Primary text |
| `--text-dim` | `#666666` | Labels, hints |
| `--accent` | `#ffffff` | Buttons, focus states |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Body/Labels | `Inter` | 0.8rem | 500 |
| Data/Values | `JetBrains Mono` | 0.75rem | 500 |
| Section Headers | `Inter` | 0.65rem | 600, uppercase |
| Buttons | `Inter` | 0.8rem | 600 |

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
```

---

## Layout Patterns

### Desktop (Sidebar + Canvas)
```
┌─────────────┬────────────────────────┐
│   Sidebar   │                        │
│   320px     │       Canvas           │
│   Controls  │       (dot-grid bg)    │
│             │                        │
└─────────────┴────────────────────────┘
```

### Mobile (Stacked)
```
┌────────────────────────┐
│       Canvas 50%       │
├────────────────────────┤
│    Controls 50%        │
│    (scrollable)        │
└────────────────────────┘
```

---

## Component Patterns

### Section Groups
```html
<section class="control-group">
    <label>Section Name</label>
    <!-- controls here -->
</section>
```
- Uppercase label with letter-spacing
- Border-bottom divider
- 2rem margin between groups

### Input Row (Slider)
```html
<div class="input-row">
    <span class="label">Label</span>
    <input type="range">
    <span class="value">50%</span>
</div>
```

### Color Input with Hex
```html
<div class="color-input">
    <span class="label">Fill</span>
    <div class="color-with-hex">
        <input type="color">
        <input type="text" class="hex-input">
    </div>
</div>
```

### Buttons
```html
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary</button>
<button class="btn-reset">Reset link</button>
```
- Primary: White bg, black text
- Secondary: Transparent, white border
- Reset: Text-only, 50% opacity

---

## Interactive Elements

### Range Sliders
- 2px track (#333)
- 12px white circular thumb
- Scale 1.15x on hover, 1.3x on active

### Checkboxes (Toggle)
- 40x20px pill shape
- 14px circular knob
- White bg when checked

### Select Dropdowns
- Surface background
- Border on hover
- Monospace font

### Scrollbars
- 8px width
- Track matches main background (`--bg`)
- Thumb is bright white (`--accent`) with rounded edges

---

## Canvas Area

```css
.canvas-area {
    background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
    background-size: 24px 24px;
}
```
- Subtle dot-grid background
- Drop-shadow on main element: `drop-shadow(0 0 40px rgba(255,255,255,0.08))`

---

## Advanced Panel

Collapsible `<details>` element:
- Triangle indicator (▸) rotates on open
- Contains power-user features
- Separated by border-top

---

## Help Tooltip

Floating `?` icon (bottom-right of canvas):
- 24px circular button
- Tooltip appears on hover
- Contains keyboard shortcuts

---

## Mobile Breakpoint

`@media (max-width: 768px)`:
- Column-reverse layout
- 50/50 canvas/controls split
- Hide logo
- Compact spacing
- Smaller preview size

---

## Best Practices

1. **Monospace for numbers** - All values, percentages, hex codes
2. **Uppercase section labels** - 0.1-0.15rem letter-spacing
3. **Generous padding** - 2rem sidebar padding, 1rem between groups
4. **Subtle animations** - 0.1-0.2s ease transitions
5. **Toast for feedback** - Brief confirmation on actions
6. **Keyboard shortcuts** - Visible via help tooltip
