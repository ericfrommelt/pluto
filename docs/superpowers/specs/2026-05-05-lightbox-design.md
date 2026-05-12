# Lightbox Feature Design

**Date:** 2026-05-05  
**Status:** Approved

## Summary

Add a lightbox to the portfolio site so visitors can click any image to view it enlarged, navigate through all images on the page, and close the overlay. Applies sitewide with a per-page opt-out.

## Architecture

A single `Lightbox.astro` component is added to `src/components/` and imported once in `src/layouts/Layout.astro`. It renders the overlay HTML and an inline `<script>`. No external dependencies.

**Opt-out mechanism:** Add `data-no-lightbox` to the `<body>` element of any page to disable the lightbox on that page. The script checks for this attribute on `DOMContentLoaded` and exits early if present.

## Component: `Lightbox.astro`

Renders into the DOM:
- A fixed full-screen overlay (`position: fixed`, `inset: 0`)
- A centered `<img>` element displaying the active image
- Left/right arrow buttons for navigation
- A close button (top-right)
- An image counter (bottom-center)

Hidden by default via CSS (`display: none` or `opacity: 0 / pointer-events: none`). Opened/closed by toggling a class or attribute.

## Overlay Appearance

- Backdrop: `bg-black/80` (Tailwind) — dark semi-transparent
- Image: centered, `max-width: 90vw`, `max-height: 90vh`, `object-fit: contain`
- Counter: IBM Plex Mono, small, bottom-center, e.g. `3 / 12`
- Controls minimal — no heavy chrome

## State & Data Flow

The script runs once on `DOMContentLoaded`:

1. Check `document.body.dataset.noLightbox` — exit if present
2. Collect all `<img>` elements on the page into an ordered array
3. Attach `click` handlers to each; each handler opens the overlay at that image's index
4. Set cursor `pointer` on all collected images

**State:** two variables — `images` (array) and `currentIndex` (integer).

**Opening:** set overlay `<img> src` to the clicked image's `src`, show overlay, update counter.

**Navigation:** increment/decrement `currentIndex` with wraparound (last → first, first → last). Update `src` and counter.

**Closing:** hide overlay, clear `src`.

## Controls

| Action | Trigger |
|---|---|
| Open | Click any gallery image |
| Close | Click backdrop, `×` button, or `Escape` key |
| Next | Right arrow button or `→` key |
| Previous | Left arrow button or `←` key |

Keyboard listeners are added on overlay open and removed on close to avoid leaking.

## Integration

- Import `Lightbox.astro` in `src/layouts/Layout.astro` — renders on every page automatically
- To disable on a page: `<body data-no-lightbox>`

## Out of Scope

- Touch/swipe (can be added later)
- Captions or titles (images have no alt text beyond "Untitled")
- Animations/transitions (can be added later)
- Thumbnail strip
