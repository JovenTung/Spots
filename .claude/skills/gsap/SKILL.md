---
name: gsap
description: "GSAP (GreenSock Animation Platform) usage guide for pure HTML/CSS/JS projects. CDN links, API reference, ScrollTrigger, timelines, and best practices. Activate for any complex animation, scroll-driven effect, or sequenced transition."
---

# GSAP — Animation Skill

GSAP is the primary animation library for this template. Use it for scroll-driven reveals, hero entrances, timelines, and sequenced animations.

## CDN — Always Load in This Order

```html
<!-- Core (required) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>

<!-- ScrollTrigger (add when using scroll animations) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js"></script>
```

Load before `script.js`. No npm, no build step.

## Plugin Registration

Always register plugins before using them:

```js
gsap.registerPlugin(ScrollTrigger);
```

## Core API

```js
// Animate TO final values
gsap.to(".element", { x: 100, opacity: 1, duration: 0.8, ease: "power2.out" });

// Animate FROM starting values (element is already at final position in CSS)
gsap.from(".element", { opacity: 0, y: 30, duration: 0.7 });

// Animate FROM → TO (full control)
gsap.fromTo(".element", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 });
```

## Timeline — Sequencing Animations

```js
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });

tl.to(".hero__title",   { opacity: 1, y: 0 })
  .to(".hero__sub",     { opacity: 1, y: 0 }, "-=0.4")  // overlap by 0.4s
  .to(".hero__actions", { opacity: 1, y: 0 }, "-=0.4");
```

## ScrollTrigger — Scroll-Driven Animations

```js
// Simple scroll reveal
gsap.to(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 85%",        // when top of element hits 85% down the viewport
    toggleActions: "play none none reverse"
  },
  opacity: 1,
  y: 0,
  duration: 0.6
});

// Staggered cards on scroll
gsap.utils.toArray(".card").forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: { trigger: card, start: "top 88%" },
    opacity: 1,
    y: 0,
    duration: 0.5,
    delay: (i % 4) * 0.1,
    ease: "power2.out"
  });
});

// Run once only
ScrollTrigger.create({
  trigger: ".section",
  start: "top 80%",
  once: true,
  onEnter: () => { /* callback */ }
});
```

## Easing Reference

| Ease | Feel |
|------|------|
| `power2.out` | Smooth deceleration — default for most UI |
| `power3.out` | Slightly snappier deceleration |
| `back.out(1.7)` | Slight overshoot — playful |
| `elastic.out(1, 0.5)` | Springy — use sparingly |
| `none` | Linear — for progress bars |

## Common Patterns for Business Sites

```js
// Hero entrance sequence
const heroTl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });
heroTl
  .to(".hero__title",   { opacity: 1, y: 0, delay: 0.2 })
  .to(".hero__sub",     { opacity: 1, y: 0 }, "-=0.4")
  .to(".hero__actions", { opacity: 1, y: 0 }, "-=0.4");

// Section fade-up (apply to all .section elements)
gsap.utils.toArray(".section").forEach(section => {
  gsap.from(section.querySelectorAll("h2, p, .card"), {
    scrollTrigger: { trigger: section, start: "top 80%" },
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  });
});
```

## Initial CSS State

Elements that animate IN must start hidden in CSS:

```css
.hero__title,
.hero__sub,
.hero__actions,
.card,
.about__stat {
  opacity: 0;
  transform: translateY(24px);
}
```

GSAP then animates them to `opacity: 1, y: 0`.

## Accessibility

Always respect `prefers-reduced-motion`:

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // all GSAP animations go here
});
```

## Rules for This Template

- GSAP = primary library for all scroll reveals, hero animations, and timelines
- ScrollTrigger = mandatory for any scroll-driven effect (not IntersectionObserver)
- Animate only `opacity`, `transform` (x, y, scale, rotate) — never `width`, `height`, `top`, `left`
- Duration: 0.5–0.8s for most UI; never exceed 1.2s
- Always use `ease: "power2.out"` as default unless a different feel is intentional
