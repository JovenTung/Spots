---
name: frontend-design
description: "Enables creation of distinctive, production-grade frontend interfaces that prioritize intentional aesthetic direction over generic AI-generated design. Works with vanilla HTML/CSS/JS, React, and Vue. Activates on any frontend build, component creation, or visual design task."
---

# Frontend Design Skill

This skill enables creation of distinctive, production-grade frontend interfaces that prioritize design quality and avoid generic aesthetics.

## When to Apply

Activate this skill when:
- Building any new page, section, or UI component
- Choosing typography, color, layout, or animation approach
- The result risks looking generic or "AI-made"
- Client expects a visually distinctive, memorable site

## Design Foundation — Before Writing Any Code

Establish these four things first:

1. **Purpose** — Who uses this interface and why?
2. **Tone** — Pick a bold, specific direction: brutally minimal, maximalist, retro-futuristic, brutalist, art deco, soft/pastel, editorial, organic. Commit to it.
3. **Constraints** — Stack (HTML/CSS/JS), performance needs, accessibility requirements.
4. **Differentiation** — What makes this interface unforgettable?

> Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

## Design Guidelines

### Typography
- Choose beautiful, unique font pairings — a distinctive display/heading font paired with a refined body font
- **Banned**: Inter, Roboto, Arial, system fonts, Space Grotesk (overused by AI tools)
- Explore: DM Serif Display, Cormorant Garamond, Syne, Cabinet Grotesk, Fraunces, Instrument Serif, Plus Jakarta Sans, Outfit

### Color
- Dominant colors with sharp, deliberate accents — not timid evenly-distributed palettes
- Always use CSS variables (`--color-primary`, `--color-accent`, etc.) — never hardcode hex values in components
- Avoid: purple gradients on white, safe blue + white combos, generic neutral palettes with no personality

### Motion & Animation
- Prioritize CSS-only animations for HTML projects — `@keyframes`, `transition`, `animation-delay`
- One well-orchestrated page load: staggered reveals using `animation-delay`
- Scroll-triggered effects: use `IntersectionObserver` or GSAP ScrollTrigger
- Hover states that surprise — not just `opacity: 0.8`
- Match animation complexity to aesthetic: maximalist = elaborate; minimalist = subtle precision

### Spatial Composition
- Unexpected layouts: asymmetry, overlapping elements, diagonal flow, grid-breaking
- Generous negative space OR controlled density — commit to one
- Avoid: predictable 3-column grids, centered everything, safe boxed layouts

### Backgrounds & Atmosphere
- Gradient meshes, noise textures, geometric patterns, layered transparencies
- Dramatic shadows, decorative borders, grain overlays
- Custom cursors where appropriate
- Avoid: plain white or plain grey backgrounds with no texture or depth

## Anti-Patterns — Never Do These

- Overused font families: Inter, Roboto, Arial, system fonts, Space Grotesk
- Purple gradient on white as a "modern" default
- Predictable 3-column card grid for everything
- Cookie-cutter components with no context-specific character
- Centering everything with equal spacing
- Converging on the same choices as other AI-generated sites

## Execution Rule

> Match implementation complexity to the aesthetic vision.
> Maximalist design = elaborate code, extensive animations, layered effects.
> Minimalist design = restrained precision in spacing, typography, and subtle refinement.

Never hold back on creative execution. Distinctive, memorable interfaces are achievable — they just require committing fully to a direction.

## Stack Notes (for this template)

- **Primary stack**: Pure HTML5 / CSS3 / Vanilla JS
- Use CSS `@keyframes` + `transition` as the first option for animation
- Use GSAP + ScrollTrigger for complex scroll-driven sequences
- Use Anime.js for micro-interactions and number counters
- No React, no build tools — all output must work as static files on Plesk/Exabyte
