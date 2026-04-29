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

Each chapter page uses a fixed two-column layout:

```
.header (40% wide, position: fixed, z-index: 1000)
.col-left (40% wide)           .col-right (60% wide, position: absolute, right: 0)
  └─ .col-left-wrapper           ├─ .nav-section (#section-0) ← chapter tile nav
      ├─ #section0 (intro)       ├─ .visualization-section (#section-1) ← fixed viz
      ├─ #section1 (topic 1)     ├─ .visualization-section (#section-2)
      ├─ #section2 (topic 2)     └─ .visualization-section (#section-3)
      └─ #section3 (topic 3)
```

The `#section-1/2/3` visualization divs are `position: fixed; visibility: hidden`. As the user scrolls through `.col-left`, `chapter.js` compares `$(window).scrollTop()` against section offsets and calls `moveToMiddle(el)` or `hideDiv(el)` to show the right visualization.

## Mobile Layout (≤749px)

Added in the mobile PWA adaptation. The two-column layout collapses to single-column:

- `.header` → full width, compact (4em tall)
- `.col-right` → `position: fixed; top: 4em; width: 100%; height: 45vh` — visualization panel pinned at top
- `.col-left` → `width: 100%; margin-top: calc(4em + 45vh)` — scrolls below the viz panel
- `#section-1/2/3` → inherit full width and 45vh height from `.col-right`
- The JS scroll behavior is unchanged — `moveToMiddle`/`hideDiv` still work

**Mobile breakpoint:** `749px` (matches the existing `750px` check in `chapter.js` for click navigation behavior).

## D3 Visualization Height Pattern

Each chapter's draw functions use dynamic width but used to hard-code height. After the mobile adaptation, the pattern should be:

```javascript
// Width: always dynamic (unchanged)
var width = d3.select('#containerId').node().clientWidth;

// Height: read from container, fall back to desktop default
var height = d3.select('#containerId').node().clientHeight || 550;
```

The CSS sets the container to `45vh` on mobile, so `clientHeight` returns the correct mobile height. On desktop the container has no explicit height, so `clientHeight` returns 0 → the fallback kicks in.

## PWA Setup
- **Manifest:** `/manifest.json` — display: standalone, theme: #1d3557
- **Service worker:** `/sw.js` — cache-first strategy, caches all local static assets
- **Icons:** `/img/icons/icon-192.png`, `/img/icons/icon-512.png`
- **Injection:** PWA `<link>` and Apple meta tags are injected via `chapter.js` (for chapters) and directly in `index.html` (for home). This avoids editing all 21 HTML files.
- **SW scope:** The SW is registered at `/sw.js` (root scope), covering all pages.

## Collapsible Text (Mobile Only)
Added via `chapter.js` at page load when `window.innerWidth < 750`. Each section's explanatory text gets a "Hide/Show explanation" toggle button. The visualization panel (`.col-right`, pinned at top) is always visible. Implementation uses jQuery `slideToggle`.

## Common Gotchas
- D3 v3: `d3.scale.linear()`, `d3.svg.line()`, `d3.behavior.drag()`, `d3.scale.ordinal()`
- jQuery 1.11.0: no `$.fn.on` chaining from `$.ajax`, use `$.ajax().done()`
- MathJax: loaded async from CDN; equations may not render if CDN fails offline
- SVG `position: absolute` centering: `.visualization-wrapper svg { position: absolute; top: 0; bottom: 0; margin: auto; }` — do not change this
- The `body { display: none }` in CSS + jQuery `$('body').fadeIn(1000)` on load is intentional (prevents FOUC)
- `#barDie` is a D3 visualization placed inside `.col-left` (not `.col-right`) — it's both control and visualization
