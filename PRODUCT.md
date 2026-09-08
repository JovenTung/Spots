# Product

## Register

product

## Users

One person (the owner), on an iPhone, standing on a street or sitting on a train. Two contexts dominate:

- **Capture**: they just saw a place on Instagram or walked past one, and want it saved in under fifteen seconds before the thought evaporates.
- **Recall**: they are out, deciding where to eat, and need to answer "what did I save near here, and was it any good?" at a glance, often in daylight with the screen at partial brightness.

The job: keep a private, trustworthy list of places worth going, and the record of what happened when they went.

## Product Purpose

Spots replaces the screenshot folder and the half-remembered "that ramen place in Shibuya". Places are saved with a category, a location, and a status (want to go / visited); visits add a rating, notes, and photos. Success is that the owner stops screenshotting, and that opening the map answers "where should we go" faster than opening Google Maps.

## Brand Personality

Quiet, precise, personal. It is a notebook, not a social network. No streaks, no badges, no engagement mechanics. The voice is plain and second-person, the way you would write a note to yourself: "Been somewhere good? Log it before you forget."

## Anti-references

- **Social discovery apps** (Beli, Yelp, Foursquare): leaderboards, follower counts, review-culture chrome. Nothing here is public.
- **The candy-app look**: full-saturation category colors on every chip, bouncy springs on every element, a rounded display face used for data labels. The previous "Soft Pop" pass leaned this way, and it made a list of restaurants feel like a kids' game.
- **Cream / sand / parchment minimalism**: the warm near-white that every generated app currently ships. Restraint should come from hierarchy, not from beige.
- **Dashboard chrome**: stat tiles with big numbers and gradient accents. This app has two numbers and they are not the point.

## Design Principles

1. **The photo is the color.** Chrome stays neutral so the user's own photos and the map carry every bit of saturation on screen.
2. **Color means something or it is not there.** Accent = the one primary action or the current selection. Category hue survives only where it disambiguates (map pins), never as decoration on a list.
3. **Glanceable in daylight.** Contrast is a functional requirement, not a compliance checkbox. Nothing important is set in light gray.
4. **Motion reports state, it does not perform.** Tab changes, tap feedback, and the map preview card animate because something changed. Pages do not make an entrance.
5. **Thumb-first.** Every target is reachable one-handed and at least 44px. The bottom of the screen is prime real estate; the top is for orientation.

## Accessibility & Inclusion

- WCAG 2.2 AA: body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1, verified numerically rather than by eye.
- Light and dark palettes both ship; the theme follows the system so iOS Night Shift / dark mode is respected.
- Every animation has a `prefers-reduced-motion` path, and the app must be fully usable with all motion suppressed.
- Pinch-zoom is never disabled.
- Category is never communicated by color alone: an icon and a text label always accompany it.
