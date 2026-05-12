# Homepage Nav Hover Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the homepage category nav on screen and show a cursor-following image (lerp + crossfade) behind it when a nav item is hovered.

**Architecture:** All changes are self-contained in `src/pages/index.astro`. At build time, `import.meta.glob` collects image URLs from each category's asset folder and serializes them via Astro's `define:vars` into a client script. The client script manages two fixed `<div>` elements that crossfade between images and track the cursor via a `requestAnimationFrame` lerp loop.

**Tech Stack:** Astro 5, Vite 6, Tailwind CSS, vanilla JS (no additional dependencies)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/pages/index.astro` | Modify | Entire feature — layout, image globs, CSS, JS |

---

## Task 1: Fix page structure and center the nav

The current `index.astro` has a redundant `<!doctype html>`/`<html>`/`<head>`/`<body>` wrapper around `<Layout>`, which itself renders the full HTML shell. This produces invalid nested HTML. This task removes the redundant wrapper and re-implements the nav with correct centering and linked items.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the entire template section**

The frontmatter imports can stay (they'll be pruned in Task 3). Replace everything below `---` with:

```astro
<Layout>
  <div class="min-h-screen flex items-center justify-center">
    <nav>
      <ul class="text-center text-lg font-mono uppercase leading-16">
        <li><a href="/abstract" data-category="abstract">Abstract</a></li>
        <li><a href="/brand" data-category="brand">Brand</a></li>
        <li><a href="/digitalcollage" data-category="digitalcollage">Digital Collage</a></li>
        <li><a href="/illustration" data-category="editorial">Editorial</a></li>
        <li><a href="/generative" data-category="generative">Generative</a></li>
        <li><a href="/motion" data-category="motion">Motion</a></li>
      </ul>
    </nav>
  </div>
</Layout>
```

Keep only these imports in the frontmatter for now:

```ts
---
import Layout from '../layouts/Layout.astro';
---
```

- [ ] **Step 2: Start the dev server and verify**

```bash
npm run dev
```

Open `http://localhost:4321`. Confirm:
- Nav is vertically and horizontally centered on screen
- All six items are visible, stacked, center-aligned
- Each item is a clickable link (hovering shows cursor: pointer)
- No duplicate `<html>` or `<body>` tags in DevTools Elements panel

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: center homepage nav and add category links"
```

---

## Task 2: Add image layer DOM elements and CSS

Two fixed `<div>` elements sit behind the nav at all times, invisible by default. CSS `transition: opacity` handles the crossfade.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add the two image layer divs and their styles**

Insert the two divs and a `<style>` block inside `<Layout>`, before the centering div:

```astro
<Layout>
  <div class="img-layer img-layer-a"></div>
  <div class="img-layer img-layer-b"></div>

  <style>
    .img-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 700px;
      height: 700px;
      background-size: cover;
      background-position: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity 400ms ease;
      z-index: -1;
      transform: translate(-350px, -350px);
    }
  </style>

  <div class="min-h-screen flex items-center justify-center">
    ...
  </div>
</Layout>
```

- [ ] **Step 2: Verify divs exist in DOM**

With dev server running, open DevTools → Elements. Confirm two `.img-layer` divs are present in the `<body>`, they have `opacity: 0`, `position: fixed`, and `z-index: -1`. They should not be visible on screen.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add hidden image layer divs with crossfade CSS"
```

---

## Task 3: Collect category images at build time

Replace the single `Layout` import in the frontmatter with the full image-gathering logic. `import.meta.glob` runs at build time and produces an array of resolved public URLs for each category.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the frontmatter**

```ts
---
import Layout from '../layouts/Layout.astro';

function globToUrls(glob: Record<string, { default: { src: string } }>) {
  return Object.values(glob).map((m) => m.default.src);
}

const abstractImages = globToUrls(
  import.meta.glob('../assets/abstract/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);
const brandImages = globToUrls(
  import.meta.glob('../assets/brand/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);
const collageImages = globToUrls(
  import.meta.glob('../assets/digitalcollage/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);
const editorialImages = globToUrls(
  import.meta.glob('../assets/illustration/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);
const generativeImages = globToUrls(
  import.meta.glob('../assets/generative/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);
const motionImages = globToUrls(
  import.meta.glob('../assets/motion/**/*.{jpg,jpeg,png,gif,webp}', { eager: true })
);

const imageMap: Record<string, string[]> = {
  abstract: abstractImages,
  brand: brandImages,
  digitalcollage: collageImages,
  editorial: editorialImages,
  generative: generativeImages,
  motion: motionImages,
};
---
```

- [ ] **Step 2: Verify the build succeeds**

```bash
npm run build
```

Expected: build completes without errors. If Astro complains about TypeScript types on the glob, adjust the type annotation to `Record<string, any>`.

- [ ] **Step 3: Log imageMap in dev to verify URLs are populated**

Temporarily add a `<script>` to the template to check:

```astro
<script define:vars={{ imageMap }}>
  console.log('imageMap', imageMap);
</script>
```

Open the browser console at `http://localhost:4321`. Confirm each category has an array of URL strings (e.g. `/_astro/Field_Series_01b.Bx7abc.jpg`). `digitalcollage` will be an empty array — that is expected and correct. Remove the temporary script before the next step.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: collect category images at build time via import.meta.glob"
```

---

## Task 4: Implement cursor tracking and crossfade

Add the production `<script define:vars={{ imageMap }}>` with the lerp loop and layer-swap logic.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add the client script**

Place this inside `<Layout>`, after the closing `</div>` of the centering wrapper:

```astro
<script define:vars={{ imageMap }}>
  const layerA = document.querySelector('.img-layer-a');
  const layerB = document.querySelector('.img-layer-b');
  const layers = [layerA, layerB];
  let activeIdx = 0; // index of the layer that will receive the NEXT image

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lerpX = mouseX;
  let lerpY = mouseY;
  let rafId = null;

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showImage(url) {
    const incoming = layers[activeIdx];
    const outgoing = layers[1 - activeIdx];
    incoming.style.backgroundImage = `url("${url}")`;
    incoming.style.opacity = '1';
    outgoing.style.opacity = '0';
    activeIdx = 1 - activeIdx;
  }

  function lerpTick() {
    lerpX += (mouseX - lerpX) * 0.12;
    lerpY += (mouseY - lerpY) * 0.12;
    const x = lerpX - 350;
    const y = lerpY - 350;
    layerA.style.transform = `translate(${x}px, ${y}px)`;
    layerB.style.transform = `translate(${x}px, ${y}px)`;
    rafId = requestAnimationFrame(lerpTick);
  }

  function startLerp() {
    if (!rafId) lerpTick();
  }

  function stopLerp() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const nav = document.querySelector('nav');

  nav.querySelectorAll('[data-category]').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const images = imageMap[item.dataset.category];
      if (!images || images.length === 0) return;
      showImage(pickRandom(images));
      startLerp();
    });
  });

  nav.addEventListener('mouseleave', () => {
    layerA.style.opacity = '0';
    layerB.style.opacity = '0';
    stopLerp();
  });
</script>
```

- [ ] **Step 2: Verify hover behavior in browser**

With `npm run dev` running, open `http://localhost:4321`. Check each of the following:

1. Hover "Abstract" — a random abstract image (~700px) appears behind the nav, following the cursor with a smooth lag
2. Move to "Brand" — previous image crossfades out, new brand image crossfades in; cursor following continues
3. Move to "Digital Collage" — no image appears (empty folder), existing image fades out
4. Move to "Editorial" — illustration image appears
5. Move to "Generative" and "Motion" — images from respective folders appear
6. Mouse off the nav entirely — both layers fade to opacity 0

- [ ] **Step 3: Verify production build**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321` in preview mode. Repeat the hover checks from Step 2. Confirm images load correctly from hashed `/_astro/` URLs.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add lerp cursor tracking and crossfade image hover effect"
```

---

## Notes

- `digitalcollage/` has no images yet — the hover handler returns early for empty arrays. No visual error.
- `brand/` and `generative/` have subdirectories; the `**/*` glob pattern handles them recursively.
- The `define:vars` script is not bundled by Astro (by design) — no ES module imports are possible inside it. All logic is self-contained.
- The 700px layer size and 0.12 lerp factor are tuning knobs; adjust in the CSS and JS respectively if the feel needs changing.
