# Homepage Nav Hover Effect — Design Spec
**Date:** 2026-05-11

## Overview
Redesign the homepage (`src/pages/index.astro`) so the navigation is centered on screen with center-aligned text. On hover, a random image from the corresponding category folder appears behind the nav and follows the cursor with lerp-based smooth tracking and opacity crossfade between images.

## Layout & Nav

- The page body uses a full-viewport flex container: `min-h-screen flex items-center justify-center`
- The `<nav>` and its `<ul>` use `text-center`
- Each `<li>` wraps an `<a href="/{slug}">` link
- Existing styles retained: `font-mono uppercase text-lg leading-16`
- `Header.astro` and its nav links are untouched — this only affects the home page body content

## Image Hover System

### Image Resolution (Build Time)
`import.meta.glob` collects all images from each category at build time. The resolved public URLs are serialized into a JSON object embedded in a `<script>` tag on the page.

| Nav Item      | Asset Folder                        |
|---------------|-------------------------------------|
| Abstract      | `src/assets/abstract/`              |
| Brand         | `src/assets/brand/**/*` (recursive) |
| Digital Collage | `src/assets/digitalcollage/`      |
| Editorial     | `src/assets/illustration/`          |
| Generative    | `src/assets/generative/`            |
| Motion        | `src/assets/motion/`                |

### DOM Structure
Two `<div>` elements (`.img-layer-a`, `.img-layer-b`) are placed in the page with:
- `position: fixed`
- `width: 700px`, `height: 700px` (aspect-ratio preserved via `background-size: cover`)
- `background-position: center`
- `pointer-events: none`
- `z-index: -1` (behind nav text, above page background)
- `opacity: 0` by default
- `transition: opacity 400ms ease`
- Transform-based positioning via JS

### Cursor Tracking (Lerp Loop)
A `requestAnimationFrame` loop runs continuously while any nav item is hovered:
- Target: actual cursor `(mouseX, mouseY)`
- Current: displayed `(lerpX, lerpY)`
- Each frame: `lerpX += (mouseX - lerpX) * 0.12`, same for Y
- `transform: translate(lerpX - 350px, lerpY - 350px)` applied to both layers (centering the 700px div on cursor)

### Image Crossfade
Two layers alternate as "active" and "outgoing":
- On nav item `mouseenter`: pick a **new** random image URL from the item's pool (re-picked every time, even when re-entering the same item), set it as `background-image` on the inactive layer, fade inactive to `opacity: 1`, fade active to `opacity: 0`, swap roles
- On nav `mouseleave`: fade both layers to `opacity: 0`, stop the lerp loop

### Image Filtering
Only `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` files are included. Subfolders in `brand/` are handled transparently by the recursive glob pattern.

## Files Changed
- `src/pages/index.astro` — only file modified; all logic is self-contained in this file
