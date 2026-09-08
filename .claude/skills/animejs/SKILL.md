---
name: animejs
description: "Anime.js v4 usage guide for pure HTML/CSS/JS projects. CDN link, API reference, and best practices. Activate for micro-interactions, number counters, icon animations, and lightweight UI transitions. Use GSAP for scroll reveals and complex sequences."
---

# Anime.js — Animation Skill

Anime.js is the secondary animation library for this template. Use it for micro-interactions, number counters, lightweight UI effects, and small element animations. Use GSAP for scroll reveals and complex sequences.

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4.3.6/dist/bundles/anime.umd.min.js"></script>
```

Load before `script.js`. No npm, no build step.

## Core API (v4)

```js
// Basic animation
anime.animate(".element", {
  translateX: 100,
  opacity: 1,
  duration: 600,
  easing: "easeOutExpo"
});

// With delay
anime.animate(".element", {
  scale: [0.8, 1],
  opacity: [0, 1],
  duration: 400,
  delay: 200,
  easing: "easeOutBack"
});
```

> Note: v4 uses `anime.animate()` — not `anime({ targets })` (that was v3 syntax).

## Stagger — Multiple Elements

```js
anime.animate(".card", {
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 500,
  delay: anime.stagger(80),       // 80ms between each element
  easing: "easeOutExpo"
});

// Stagger from center outward
anime.animate(".dot", {
  scale: [0, 1],
  duration: 400,
  delay: anime.stagger(60, { from: "center" }),
  easing: "easeOutBack"
});
```

## Number Counter — Key Use Case

```js
// Animate a stat number from 0 to target value
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  anime.animate(el, {
    innerHTML: [0, target],
    round: 1,
    duration: 1800,
    easing: "easeInOutExpo"
  });
}

// Trigger when section enters view (use GSAP ScrollTrigger)
ScrollTrigger.create({
  trigger: ".about",
  start: "top 80%",
  once: true,
  onEnter: () => {
    document.querySelectorAll(".stat__number").forEach(animateCounter);
  }
});
```

## Button / Hover Micro-interactions

```js
document.querySelectorAll(".btn--primary").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    anime.animate(btn, {
      scale: 1.04,
      duration: 200,
      easing: "easeOutQuad"
    });
  });
  btn.addEventListener("mouseleave", () => {
    anime.animate(btn, {
      scale: 1,
      duration: 200,
      easing: "easeOutQuad"
    });
  });
});
```

## Icon Pop Animation

```js
anime.animate(".icon", {
  scale: [0, 1],
  opacity: [0, 1],
  duration: 400,
  delay: anime.stagger(60),
  easing: "easeOutBack"
});
```

## Easing Reference

| Easing | Feel |
|--------|------|
| `easeOutExpo` | Fast start, smooth stop — default for most |
| `easeInOutExpo` | Slow → fast → slow — good for counters |
| `easeOutBack` | Slight overshoot — good for icons, badges |
| `easeOutQuad` | Gentle deceleration — subtle UI |
| `easeInOutQuad` | Balanced — form elements |
| `spring(1, 80, 10, 0)` | Physics spring — playful elements |

## When to Use Anime.js vs GSAP

| Use Anime.js | Use GSAP |
|---|---|
| Number counters | Hero entrance sequence |
| Icon pop / scale animations | Scroll-triggered section reveals |
| Button hover micro-interactions | Staggered card reveals on scroll |
| Small element transitions | Complex timelines |
| Lightweight one-off animations | Parallax effects |

## Rules for This Template

- Anime.js = secondary library — micro-interactions and counters only
- Never use Anime.js for scroll reveals — that's GSAP's job
- Always use v4 syntax: `anime.animate()` not `anime({ targets })`
- Duration: 200–600ms for micro-interactions; 1200–2000ms for counters
- Default easing: `easeOutExpo` for most; `easeInOutExpo` for counters
