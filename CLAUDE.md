# Seeing Theory — Developer Reference

## What This Is
A visual introduction to probability and statistics, originally created at Brown University (2019). Static HTML/CSS/JS site with interactive D3.js visualizations. No backend, no build tools, no npm.

## Tech Stack
- **D3.js v3** (`js/d3.min.js`) — all visualizations. Note: v3 API differs significantly from v4+. Use `d3.scale.linear()` not `d3.scaleLinear()`, `d3.svg.line()` not `d3.line()`, etc.
- **jQuery 1.11.0** — DOM manipulation, events, animations
- **jQuery UI 1.12.1** — sliders in some chapters
- **jstat** (`js/jstat.min.js`) — statistical functions
- **MathJax 2.7.1** — LaTeX equation rendering (CDN)
- **d3.tip v0.6.3** — D3 tooltips
- **jQuery fullPage.js** — home page full-screen scroll sections only (not chapters)

## File Structure
```
/
├── index.html, cn.html, es.html   ← home page (3 languages)
├── manifest.json                   ← PWA manifest
├── sw.js                           ← service worker
├── css/
│   ├── chapter-style.css           ← SHARED layout for all 6 chapters
│   └── home.css                    ← home page only
├── js/
│   ├── chapter.js                  ← SHARED JS for all 6 chapters
│   └── d3.min.js, jstat.min.js, etc.
├── img/
│   ├── favicon.png
│   ├── icons/                      ← PWA icons (192px, 512px)
│   └── share/                      ← OG social share images (1200×630)
└── <chapter-name>/                 ← one directory per chapter
    ├── index.html, cn.html, es.html
    ├── <chapter-name>.css
    └── <chapter-name>.js           ← D3 visualization code
```

**Chapters:** basic-probability, compound-probability, probability-distributions, bayesian-inference, frequentist-inference, regression-analysis

**Language variants:** Each chapter has `index.html` (English), `cn.html` (Chinese), `es.html` (Spanish). Shared CSS/JS covers all three automatically.

## Layout Architecture (Chapters)

The original HTML layout is a **fixed two-column layout** (still in CSS as a fallback):

```
.header (40% wide, position: fixed)
.col-left (40% wide)           .col-right (60% wide, position: absolute, right: 0)
  └─ .col-left-wrapper           ├─ .nav-section (#section-0) ← chapter tile nav
      ├─ #section0 (intro)       ├─ .visualization-section (#section-1)
      ├─ #section1 (topic 1)     ├─ .visualization-section (#section-2)
      ├─ #section2 (topic 2)     └─ .visualization-section (#section-3)
      └─ #section3 (topic 3)
```

`#section-1/2/3` (the visualization divs) used to be `position: fixed; visibility: hidden` and were shown/hidden based on scroll position. **This layout is no longer activated** — `chapter.js` now overrides it with the stepper layout below at all viewport sizes.

## Chapter Flow (Stepper) Layout — current

`chapter.js` adds `body.flow` on chapter pages and runs `setupChapterFlow()`, which:

1. **Moves visualization divs into text sections.** `#section-N` → `#sectionN`, positioned right after the wrapped text (`.unit-text`) and before the controls (`.interactive-wrapper`, `#barDie`, etc.).
2. **Moves `.nav-section` (chapter tile selector) into `#section0`** so the intro section becomes a section picker.
3. **Adds per-section UI**: dot indicators (top), collapse button on sections 1–3, prev/next nav bar (bottom).
4. **Hides all sections except the active one** via the `.flow-active` class. `showSection(idx)` toggles this and triggers `$(window).trigger('resize')` so D3 charts redraw at the now-visible container's real dimensions.
5. **Disables the legacy scroll-driven section-reveal logic** via the `flowScrollDisabled` flag.

Per-section structure inside each `.unit`:

```
[.flow-dots]                  ← dot indicators
  h3 (title)
  .unit-collapse-btn          ← "▲ Hide explanation" toggle
  .unit-text                  ← collapsible text wrapper (max-height + opacity transition)
  .visualization-section      ← moved here from .col-right
  .interactive-wrapper        ← controls (buttons, sliders, etc)
[.flow-section-nav]           ← prev / counter / next
```

When `.unit.unit-collapsed` is set, `.unit-text` collapses (max-height: 0) and `.visualization-section`'s `min-height` grows to 55vh, giving the plot more room.

## Mobile Behaviour

The stepper layout is responsive — it works at all sizes. The `.col-left-wrapper` has a `max-width` that grows on wider screens (760px → 900px at ≥1024px). No separate mobile breakpoint is needed for the layout itself; chapter colors come from each chapter's own `.col-left { background-color: ... }`.

## D3 Visualization Height Pattern

Each chapter's draw functions use dynamic width but used to hard-code height. The pattern is:

```javascript
// Width: always dynamic (unchanged)
var width = d3.select('#containerId').node().clientWidth;

// Height: read from container, fall back to desktop default
var height = d3.select('#containerId').node().clientHeight || 550;
```

In flow mode, `.visualization-section` flexes to fill the section, so `clientHeight` returns the actual rendered height. For sections that aren't `flow-active`, the parent `display: none` makes `clientHeight` 0 — the chart renders at fallback dimensions and re-renders correctly on the resize trigger that fires when the section becomes active. Each chapter's draw function must register a `$(window).on('resize', drawX)` handler so this redraw works.

**Important:** `frequentist-inference.js`'s `estimation()` uses a `<canvas>` (not SVG). It needs an explicit `resizeCanvas()` resize handler — canvases don't auto-scale.

## PWA Setup
- **Manifest:** `/manifest.json` — display: standalone, theme: #1d3557
- **Service worker:** `/sw.js` — cache-first strategy, caches all local static assets
- **Icons:** `/img/icons/icon-192.png`, `/img/icons/icon-512.png`
- **Injection:** PWA `<link>` and Apple meta tags are injected via `chapter.js` (for chapters) and directly in `index.html` (for home). This avoids editing all 21 HTML files.
- **SW path resolution:** registered with a relative URL derived from the page location (`new URL('../../sw.js', location)`) so it works on any subpath host (e.g. GitHub Pages at `/seeing-theory/`).

## Common Gotchas
- D3 v3: `d3.scale.linear()`, `d3.svg.line()`, `d3.behavior.drag()`, `d3.scale.ordinal()`
- jQuery 1.11.0: no `$.fn.on` chaining from `$.ajax`, use `$.ajax().done()`
- MathJax: loaded async from CDN; equations may not render if CDN fails offline
- SVG `position: absolute` centering: `.visualization-wrapper svg { position: absolute; top: 0; bottom: 0; margin: auto; }` — do not change this
- The `body { display: none }` in CSS + jQuery `$('body').fadeIn(1000)` on load is intentional (prevents FOUC)
- `#barDie` is a D3 visualization placed inside `.col-left` (not `.col-right`) — it's both control and visualization
