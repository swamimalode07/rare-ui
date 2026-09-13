# Animation

Every motion value in Rare UI, per component, taken from the source. Numbers here must match the code; if you change a constant, change it here too.

Durations are in seconds unless a name ends in `_MS`. Cubic-bezier arrays are Motion `ease` tuples. For tokens, layout, and component rules, see `DESIGN.md`.

## The engine

`motion` v12 (Motion for React) drives everything except three components that run their own loop:

| Component | Technique |
| --- | --- |
| `fluid-orb` | WebGL fragment shader, `lib/webgl.ts` |
| `gravity-letters` | custom physics loop, heightmap collision, WAAPI for landings |
| `grid-reveal` | self-paced progress model, canvas sampling, quadtree splitting |

Motion primitives in use: `motion.*`, `AnimatePresence`, `useSpring`, `useTransform`, `useMotionValue`, `useVelocity`, `useScroll`, `useAnimate`, `animate()`, `layout` and `layoutId`, and `useReducedMotion`.

## Reduced motion is mandatory

Every interactive component honors `prefers-reduced-motion`. This is a shipping requirement, not a nicety.

The standard pattern collapses the transition to zero rather than removing the animation, so state still lands correctly:

```tsx
const reduced = useReducedMotion() ?? false;
const INSTANT = { duration: 0 } as const;

transition={reduced ? INSTANT : SPRING}
```

Three variants appear in the codebase:

- `useReducedMotion()` from Motion, used by 15 components.
- `window.matchMedia("(prefers-reduced-motion: reduce)")`, used by `fluid-orb` and `gravity-letters` because they run outside React's render cycle.
- A short fade instead of a spring, used by `code-block` (`{ duration: 0.15 }`), where an instant swap read as a glitch.

`gravity-letters` checks the query with a live listener and returns early from its physics loop, so no simulation runs at all.

## Shared easing curves

Four curves cover almost the whole library. Reuse one before inventing another.

| Name | Value | Feel | Used by |
| --- | --- | --- | --- |
| `EASE_OUT` | `[0.22, 1, 0.36, 1]` | fast start, long soft settle | `animated-counter`, `github-activity`, `scroll-progress` |
| `EASE` (iOS) | `[0.32, 0.72, 0, 1]` | the Apple swipe curve | `delete-button`, `step-player` |
| `EASE_IN_OUT` | `[0.65, 0, 0.35, 1]` | symmetric, for crossfades | `scroll-progress` |
| Material standard | `[0.4, 0, 0.2, 1]` | neutral | `grid-reveal` |

Others, used once each:

| Value | Where | Why |
| --- | --- | --- |
| `[0.34, 1.1, 0.64, 1]` | `delete-button` `EASE_LID` | overshoots past 1, so the lid flicks open |
| `[0.26, 0.08, 0.25, 1]` | `family-drawer` | slow head, matches iOS sheet resize |
| `[0.4, 0.3, 0.5, 1]` | `emoji-reaction` | near-linear drift for floating particles |
| `[0.45, 0, 0.55, 1]` | `grid-reveal` shimmer | symmetric, loops without a seam |
| `cubic-bezier(0.215, 0.61, 0.355, 1)` | `gravity-letters` | WAAPI ease-out-cubic for landings |

## Spring vocabulary

Springs cluster into five families. Pick the family that matches the physical intent.

| Family | Typical values | Character | Examples |
| --- | --- | --- | --- |
| Layout | `stiffness 200-320`, `damping 24-34` | no overshoot, moves geometry | `gooey-nav`, `duration-picker`, sidebars |
| Snappy UI | `stiffness 400-600`, `damping 30-40` | quick, tight | `otp-input`, `code-block`, `notification-bell` |
| Playful pop | `stiffness 120-320`, `damping 13-22` | visible overshoot | `folder-component`, `GooeyNavbar` |
| Physical swing | `stiffness 220`, `damping 10` | keeps oscillating | `notification-bell` |
| Error shake | `stiffness 700`, `damping 9` | violent, brief | `duration-picker` |

Two ways to write a spring appear in the code, both valid in Motion v12:

```ts
// physical: solved from stiffness, damping, mass
{ type: "spring", stiffness: 200, damping: 28, mass: 1 }

// perceptual: you state the time and the overshoot
{ type: "spring", duration: 0.62, bounce: 0.2 }
```

Newer components prefer the perceptual form because the duration is legible at a glance.

## Per-component values

### animated-counter

Odometer digit wheels.

```ts
EASE     = [0.22, 1, 0.36, 1]
BOUNCE   = 0.18
LEAVE    = { duration: 0.18, ease: EASE }
INSTANT  = { duration: 0 }
spring   = (duration) => ({ type: "spring", duration, bounce: BOUNCE })
LINE     = 1.5           // line height, one digit face
```

Duration is a prop, clamped to `MIN_DURATION 0.01` and `MAX_DURATION 60`. Limits: `MAX_DECIMALS 15`, `MAX_PAD 24`. The wheel is `FACES 0-9` plus a repeated `0` so it can roll past nine into the next place. A vertical gradient (`FADE`) masks the top and bottom so digits fade rather than clip.

### bounce-sidebar

Indicator dot that arcs between items.

```ts
duration = 0.25
ease     = "easeOut"
path     = arc({ strength: min(0.8, 14 / distance), direction: delta > 0 ? "ccw" : "cw" })
```

The dot follows a curved path, not a straight line. Arc strength is inverse to travel distance and capped at `0.8`, so short hops bow noticeably while long ones stay nearly straight. Direction flips with travel direction, so the dot always bulges outward.

Initial placement uses `{ duration: 0 }` so the dot never animates in from the origin. Position is snapped to the device pixel grid (`Math.round(v * dpr) / dpr`) and re-snapped on `document.fonts.ready`, because a late font swap moves the items underneath it.

### code-block

```ts
TAP_SPRING    = { type: "spring", stiffness: 500, damping: 30 }
SWAP_SPRING   = { type: "spring", duration: 0.3, bounce: 0 }
CHECK_SPRING  = { type: "spring", duration: 0.4, bounce: 0.35 }
COPY_RESET_MS = 1800
label fade    = { duration: 0.2, ease: "easeOut", delay: 0.05 }
reduced       = { duration: 0.15 }
```

The check mark gets `bounce: 0.35` while the icon swap gets `bounce: 0`, so the success beat pops and the mechanical swap does not. The copied state resets after 1800 ms.

### delete-button

The most choreographed component. A lidded bin opens, a panel expands, the choice settles.

```ts
EASE     = [0.32, 0.72, 0, 1]
EASE_LID = [0.34, 1.1, 0.64, 1]

WIDTH  = { duration: 0.62, ease: EASE }
LID    = { duration: 0.60, ease: EASE_LID }
WALL   = { duration: 0.56, ease: EASE }
IN     = { duration: 0.44, ease: EASE, delay: 0.14 }
OUT    = { duration: 0.30, ease: EASE }
TAP    = { duration: 0.20, ease: EASE }
SWAP   = { duration: 0.22, ease: EASE }
SETTLE = { duration: 0.45, ease: EASE }
PRESS  = { type: "spring", stiffness: 520, damping: 18, mass: 0.5 }
INSTANT = { duration: 0 }

staggerChildren = 0.07
```

Geometry: `TILE 48`, `PANEL 84`, `LID_OPEN -35deg`, hinge at `3px 6px`, walls `WALL_TOP 6` to `WALL_TOP_OPEN 13.5`, `WALL_BASE 20`.

The ordering is the point. The container widens over 0.62 s, the lid lifts over 0.60 s on an overshooting curve, and the labels wait `0.14` s before fading in over 0.44 s with a 0.07 s stagger. Exit is uniformly faster (`OUT` 0.30 s) so dismissal never feels sticky.

`HOLD = { deleted: 1400, kept: 600 }` is how long each result stays on screen. Deletion holds more than twice as long, because it is the consequential outcome.

### duration-picker

```ts
GAP_SPRING   = { stiffness: 200, damping: 28, mass: 1 }
ICON_SPRING  = { stiffness: 200, damping: 28 }
WIDTH_SPRING = { stiffness: 250, damping: 31 }
SWAY_SPRING  = { stiffness: 200, damping: 24 }
ERROR_SPRING = { stiffness: 700, damping: 9 }

OPEN_GAP      = 8
CORNER_RADIUS = 12
```

Five springs on one control, each tuned to its job. `ERROR_SPRING` is the outlier at `stiffness 700, damping 9`: extremely stiff and barely damped, which reads as a sharp shake. `SWAY_SPRING` is driven by `useVelocity`, so the icon leans into fast drags. The pen and tick glyphs are morphed between two SVG paths (`PEN_PATH`, `TICK_PATH`).

### emoji-reaction

Particle burst on hold.

```ts
BURST_COUNT   = 5      // particles per burst
HOLD_INTERVAL = 550    // ms between bursts while held
MAX_PARTICLES = 60     // hard ceiling
RISE          = 450    // px travelled
LAUNCH_SPREAD = 6      // px horizontal jitter at launch
CLIMB_SPREAD  = 78     // px horizontal drift during climb

EASE = [0.4, 0.3, 0.5, 1]
SWAY = [0, 0.3, 0.65, 1]

duration = rand(1.4, 1.8)
delay    = i * 0.25
```

Per-particle transitions are split by property, which is what makes it read as physical rather than uniform:

```ts
rotate:  { inherit: true, times: SWAY, ease: "easeInOut" }
scale:   { inherit: true, times: [0, 0.1, 0.22, 1], ease: "easeOut" }
opacity: { ease: "linear" }
```

Scale front-loads: the particle reaches full size in the first 22 percent of its life, then only drifts. Randomized duration keeps a burst from looking like a single rigid object.

Picker springs: `{ type: "spring", stiffness: 520, damping: 30 }` for the tray, and `{ type: "spring", stiffness: 800, damping: 25 }` for each emoji with `delay: 0.04 + i * 0.035`. `MAX_PARTICLES 60` is the performance guard on a held press.

### family-drawer

```ts
transition = { duration: opacityDuration, ease: [0.26, 0.08, 0.25, 1] }

MIN_DURATION = 0.15
MAX_DURATION = 0.27
opacityDuration = clamp(heightDifference / 500, MIN, MAX)
```

The only distance-derived duration in the library. Height is measured with `react-use-measure`; the crossfade between views is timed from how far the drawer actually has to travel, so a small view change is quick and a large one is not. Both bounds are tight, so it never drags.

The `vaul` drawer itself is styled in `globals.css`:

```css
[vaul-drawer]  { transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1); }
[vaul-overlay] { transition: opacity   0.2s cubic-bezier(0.165, 0.84, 0.44, 1); }
```

### fluid-orb

WebGL. A vertex and fragment shader pair (`VERT`, `FRAG`) animate on the GPU with no Motion involvement. Reduced motion is read once with `matchMedia` and freezes the render loop.

### folder-component

```ts
card spring = { type: "spring", stiffness: 120, damping: 13 }
flap spring = { type: "spring", stiffness: 120, damping: 14 }

delays, per card:
  card 1: isOpen ? 0.10 : isHovered ? 0.12 : 0
  card 2: isOpen ? 0.05 : isHovered ? 0.06 : 0
  card 3: 0

BASE_WIDTH  = 321
BASE_HEIGHT = 270
```

`damping: 13` against `stiffness: 120` is deliberately underdamped, so cards overshoot and settle back. Delays run in reverse index order and the hover delays are slightly longer than the open delays, so hovering feels like a tease and clicking feels decisive. The flap is one damping step tighter (`14`) so it does not wobble behind the cards.

### github-activity

```ts
EASE_OUT      = [0.22, 1, 0.36, 1]
SPRING        = { type: "spring", bounce: 0.20, duration: 0.62 }
HEADER_SPRING = { ...SPRING, bounce: 0.45 }
ROW_SPRING    = { ...SPRING, bounce: 0.26, delay: 0.08 }

CELL_FADE      = { duration: 0.20, ease: EASE_OUT }
TOOLTIP_FADE   = { duration: 0.14, ease: EASE_OUT }
LABEL_REVEAL   = { duration: 0.45, ease: EASE_OUT }
COLUMN_STAGGER = 0.012
LABEL_BLUR     = 6
ROW_OFFSET     = 16
```

One base spring with three bounce values, so the whole card shares a rhythm while the header pops hardest. `COLUMN_STAGGER 0.012` is the key number: multiplied by week index across roughly 52 columns it produces about a 0.62 s sweep, which matches `SPRING.duration` exactly. The grid fills in as fast as the card settles.

The label reveals from `blur(6px)` over 0.45 s, delayed until the sweep ends. Tooltips use the shortest duration in the file (0.14 s) because a tooltip that animates is a tooltip that feels slow.

Layout: `DEFAULT_CELL_SIZE 11`, `CARD_PADDING 32`, `MIN_CARD_WIDTH 320`, `STACK_LIMIT 3`, `TOOLTIP_EDGE 8`, `LEVELS 0-4`, `DEFAULT_ACCENT #39d353`.

### gooey-nav

```ts
SPRING     = { type: "spring", stiffness: 200, damping: 28, mass: 1 }
NECK_BREAK = 0.22
NECK_H     = 100
FADE_IN    = "transition-colors duration-[400ms]"
FADE_OUT   = "transition-colors duration-0"
```

Borrows the duration picker's spring so the two feel related. The gooey effect is an SVG neck that thins as the gap opens and is gone by `NECK_BREAK 0.22`, before the pill fully separates.

The asymmetric color fade is intentional: `400ms` in, `0ms` out. Color arrives gradually on the tile you move to and leaves instantly from the one you left, so the two never look active at once.

### gravity-letters

Custom physics, not Motion.

```ts
COL       = 8      // heightmap column width, px
CLEARANCE = 24     // min air above the landing spot at spawn
SLOPE     = 0.35   // slide on when a neighbor sits this fraction lower
LEAVE_MS  = 350
TILT      = 26     // max rest tilt, deg
BOUNCE    = 0.22   // restitution of the first touch
HOLD_MS   = 300    // hold this long to start pouring
POUR_MS   = 120    // pour cadence while held
TILT_ON   = 10     // device tilt (deg) that starts an avalanche
SHAKE_MS  = 350    // min gap between tilt avalanches
EAGER     = 0.45   // slide-threshold factor while tilted
```

Collision is a heightmap of 8 px columns rather than true body-to-body physics, which is what keeps it cheap with many glyphs. `BOUNCE 0.22` means a letter keeps 22 percent of its speed on first contact, so it hops once and stops.

Landings hand off to WAAPI:

```
{ duration: 160, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" }
{ duration: 150, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" }
```

Device tilt beyond `TILT_ON 10` degrees triggers an avalanche, rate-limited to one per `SHAKE_MS 350`, with the slide threshold loosened by `EAGER 0.45` while tilted. Reduced motion returns before the loop starts.

### grid-reveal

A progress-driven quadtree that splits into an image.

```ts
CELLS         = 180     // target cell count
OPENING_CELLS = 4
HOLD          = 0.90    // stop short so the run cannot outpace the image
WAIT_CAP      = 0.72    // splitting pauses here while waiting
LAST_SPLIT    = 0.92
MORPH         = 0.055   // how long one cell takes to separate, in progress units
SAMPLE        = 128     // canvas sampling resolution
COLOR_MS      = 420
GUTTER_FROM   = 0.35
GUTTER_TO     = 0.75
PHOTO_FROM    = 0.93

easeOut = (t) => 1 - (1 - t) ** 3

opacity = { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
layout  = { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
shimmer = { duration: 1.6, ease: [0.45, 0, 0.55, 1] }
```

Time is not the driver here; progress is. `MORPH 0.055` is measured in progress units, not seconds, so the reveal is honest about how far along the real work is.

The three caps solve one problem. `HOLD 0.90` and `LAST_SPLIT 0.92` keep the animation from finishing before the image arrives, and `WAIT_CAP 0.72` freezes splitting during a wait so the grid still has somewhere to go when data lands. Gutters open between `0.35` and `0.75`; the photo crossfades in only after `0.93`.

The shimmer is a 250 percent wide gradient swept on a symmetric curve so the loop has no visible seam.

### hook-sidebar

```ts
spring  = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
fade    = { duration: 0.2 }
reduced = { duration: 0 }
```

`mass: 0.7` is below the default `1`, which makes the panel feel light and quick.

### notification-bell

The most physical component in the library.

```ts
SWING_SPRING   = { type: "spring", stiffness: 220, damping: 10, mass: 1, restDelta: 0.01 }
CLAPPER_SPRING = { stiffness: 300, damping: 14, mass: 1 }
COLUMN_SPRING  = { stiffness: 400, damping: 30, mass: 0.9 }
ENTER_SPRING   = { type: "spring", stiffness: 600, damping: 20 }
FADE           = { duration: 0.15 }

IMPULSE          = 500   // deg/sec applied per ring
MAX_VELOCITY     = 900   // deg/sec ceiling
BURST            = 5
CLAPPER_SWEEP    = 13    // deg
CLAPPER_VELOCITY = 450   // deg/sec
```

`damping: 10` against `stiffness: 220` is the lowest damping ratio in the codebase, and that is the whole trick: the bell keeps swinging for several visible oscillations instead of settling. `restDelta: 0.01` lets it run to a genuinely small amplitude before Motion cuts it off.

Velocity is additive, so rapid rings compound up to `MAX_VELOCITY 900`. The clapper is a separate, stiffer spring (`300 / 14`) with its own `13` degree sweep, so it lags the bell body the way a real clapper does. The digit column is stiffer and heavier-damped (`400 / 30`) because a count must land, not wobble.

All sizes are fractions of the `size` prop, so the bell scales as one object: `ICON 0.56`, `BADGE 0.38`, `DOT 0.22`, `FONT 0.21`, `PAD 0.09`, `ORBIT 0.9`.

### otp-input

```ts
ROLL_SPRING  = { type: "spring", stiffness: 500, damping: 34 }
CARET_SPRING = { type: "spring", stiffness: 500, damping: 40 }
BLINK        = { duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }
SHAKE        = [0, -5, 4, -2, 0]

ROLL = { initial: { y: "110%" }, exit: (cleared) => ({ y: cleared ? "110%" : "-110%" }) }

success ring   = { duration: 0.32, ease: "easeOut" }
digit reveal   = { duration: 0.45, ease: "easeOut", delay: 0.15 + index * 0.05 }
slot fade      = { duration: 0.15 }
slot shadow    = transition-shadow duration-200
```

Both springs share `stiffness: 500`; the caret is damped harder (`40` against `34`) so it never overshoots its slot while digits still roll.

`BLINK` uses a duplicated keyframe time (`0.5, 0.5`) to produce a hard on-off cursor rather than a fade, which is what a real caret does.

The exit direction is state-dependent: a cleared field rolls digits back down (`110%`), a replaced digit rolls up and out (`-110%`), so backspace and overtype look different. `SHAKE` is a decaying keyframe array rather than a spring, giving an exactly repeatable error.

### proximity-sidebar

```ts
scaleX spring = { stiffness: 320, damping: 34, mass: 0.7 }
color         = transition-colors duration-150 ease-out
```

Dash width is a `useTransform` over pointer distance mapped `[-RADIUS, 0, RADIUS]` with `clamp: true`, fed into a spring. The transform gives the shape of the falloff and the spring gives it inertia, so the dashes lag the cursor slightly instead of tracking it rigidly.

Widths are expressed as `scaleX` against a fixed `MAX_DASH_WIDTH` with `transformOrigin` set to the mounted side, so the animation stays on the compositor.

### scroll-progress

```ts
EASE_IN_OUT     = [0.65, 0, 0.35, 1]
EASE_OUT        = [0.22, 1, 0.36, 1]
SIZE_SPRING     = { type: "spring", bounce: 0.16, duration: 0.5 }
LABEL_CROSSFADE = { duration: 0.22, ease: EASE_OUT }
LAYER_FADE      = { duration: 0.24, ease: EASE_IN_OUT }

progress spring = { stiffness: 120, damping: 30, mass: 0.3 }
section stagger = { duration: 0.3, ease: EASE_IN_OUT, delay: 0.04 + i * 0.03 }
```

The progress spring is the softest in the library. `stiffness: 120` with `mass: 0.3` smooths raw scroll input into something that reads as a continuous fill rather than a jittery one. `SIZE_SPRING` uses a small `bounce: 0.16`, enough to feel alive without the container wobbling.

### step-player

```ts
WIDTH_SPRING = { type: "spring", duration: 0.42, bounce: 0.14 }
ICON_SPRING  = { type: "spring", duration: 0.32, bounce: 0.22 }
TAP_SPRING   = { type: "spring", duration: 0.25, bounce: 0.30 }
ICON_FADE    = { duration: 0.26, ease: [0.32, 0.72, 0, 1] }
```

A clean bounce and duration ladder. The larger the moving element, the longer and calmer: the container is 0.42 s at `bounce 0.14`, the icon 0.32 s at `0.22`, the tap 0.25 s at `0.30`. Small things are allowed to be springier than large ones.

## Site chrome

Not shipped in the registry, but it sets the tone of the marketing pages.

### Navbar

```ts
scroll shrink = { type: "spring", stiffness: 320, damping: 24, mass: 0.8 }
menu items    = { type: "spring", stiffness: 400, damping: 30 }
press bump    = scale 1.08, { type: "spring", stiffness: 400, damping: 30 }
```

On scroll the bar goes to `scale: 0.98, y: -4`.

### GooeyNavbar

```ts
morphSpring = { type: "spring", stiffness: 250, damping: 24 }
popSpring   = { type: "spring", stiffness: 320, damping: 15 }
fade        = { duration: 0.3, ease: "easeOut" }
spring      = { type: "spring", stiffness: 300, damping: 30 }

icon delays   = 0.10, then 0.18
link stagger  = 0.06 + i * 0.06
overlay fade  = { duration: 0.25, ease: "easeOut" }
reduced       = { duration: 0 } or { duration: 0.15 }
```

`popSpring` at `damping: 15` is the underdamped one, used for the elements that should feel like they pop rather than slide. Links enter with `y` and `filter: blur()` together, staggered 0.06 s apart.

### HeroIntro and HeroCta

```ts
spring     = { type: "spring", stiffness: 300, damping: 22 }
rise delay = index * STEP
```

Three lines rise in sequence on one shared spring. `HeroCta` uses the same spring for a hover shift, where the two halves push apart by `SIDE_SHIFT` in opposite directions.

### CopyButton

```ts
out = { duration: 0.14, ease: "easeIn" }
in  = { duration: 0.16, ease: "easeOut", delay: copied ? 0.07 : 0 }
```

The outgoing icon leaves on `easeIn` before the incoming one arrives on `easeOut`, with a 0.07 s gap only on the way into the copied state. The two glyphs never overlap.

### Sidebar shells

```ts
DesktopShell   = { type: "spring", stiffness: 300, damping: 30 }
Sidebar panel  = { type: "spring", stiffness: 300, damping: 30 }
MobileSidebar  = { type: "spring", stiffness: 320, damping: 34 }
Mobile overlay = { duration: 0.2, ease: "easeOut" }
```

The mobile panel is damped harder than the desktop one (`34` against `30`) because an overshooting sheet on touch reads as a missed gesture.

## Error screens

`/400`, `/401`, and `/402`, built from `components/error-pages/`.

Entrances here are CSS keyframes in `app/globals.css`, not Motion. An error page has to stay readable even if its JavaScript never runs, so nothing is gated behind hydration. `[data-error-anim]` is the opt-in hook, and a single `prefers-reduced-motion` block in that file cancels every one of them at once.

```
error-rise     0.85s  cubic-bezier(0.22,1,0.36,1)   bloom entrance
error-copy     0.5s and 0.55s, delayed 0.18s/0.15s  link and numeral
error-fade     0.9s   cubic-bezier(0.22,1,0.36,1)   glow layers
error-breathe  7.5s   cubic-bezier(0.45,0,0.55,1)   scale 1 to 1.022, infinite
```

The glow screen stacks four blurred copies of the bloom, each breathing 0.5 s behind the one outside it, so the mass never pulses as a single object.

### Drifting logo

```
SPEED            = 104   px per second
CORNER           = 120   px; a bounce landing this close to a wall end counts as a corner approach
MIN_OFF_DIAGONAL = 0.2   rad the heading is held clear of a 45 degree diagonal
JITTER           = 0.1   rad added to every bounce
```

A perfect diagonal is the only heading that can reach a corner, so each bounce is nudged off it and biased away from whichever end it landed near. Measured across 25 s of drift, the logo's closest corner approach is about 56 px.

### Hanging strings

```
cord 0 (left numeral)   { stiffness: 320, damping: 8   }
cord 1 (flower)         { stiffness: 260, damping: 7   }
cord 2 (right numeral)  { stiffness: 300, damping: 8.5 }

GRAB      = 46    px, how close the pointer must come to catch a cord
PLUCK     = 0.09  rad/s gained per px the pointer travels across a cord
SHOVE     = 30    rad/s^2 that pushes a caught cord out of the way
MAX_SPEED = 15    rad/s ceiling
WHIP      = 5.5   px of trailing curve per rad/s
```

Three pendulums integrated with semi-implicit Euler, detuned so the set never swings in lockstep. The damping ratios land near 0.22, the same underdamped family as the notification bell, so a plucked cord rings through several visible swings before it settles. The quadratic control point trails the angular velocity by `WHIP`, which is what bows a fast cord instead of leaving it rigid, and torque scales with how far down the cord the pointer crosses.

The cords are drawn in their own SVG lanes at one user unit per pixel, so the rest state is authored server side and JavaScript only ever rewrites a path that already looks right.

## House rules

1. **Reuse a curve before adding one.** Four easings cover the library. A new curve needs a reason that the existing four cannot serve.
2. **Exit faster than enter.** `delete-button` enters at 0.44 s and leaves at 0.30 s. Dismissal should never feel sticky.
3. **Small things are springier.** Bounce goes up as element size goes down. See the `step-player` ladder.
4. **Stagger in the 0.03 to 0.07 range.** Below that the sequence is invisible, above it the last item feels forgotten. `github-activity` uses `0.012` only because it multiplies across roughly 52 columns.
5. **Split transitions per property.** Different properties want different timing. `emoji-reaction` and `scroll-progress` both do this.
6. **Match the animation to the work.** If something real is loading, drive progress from the work, not from a timer. See `grid-reveal`.
7. **Prefer transform and opacity.** Animate `scaleX`, `x`, `y`, and `opacity` so work stays on the compositor. `proximity-sidebar` scales a fixed-width element rather than animating `width`.
8. **Cap particle counts.** `emoji-reaction` stops at `MAX_PARTICLES 60`.
9. **Snap to the pixel grid when it matters.** `bounce-sidebar` rounds by `devicePixelRatio` and recomputes after `document.fonts.ready`.
10. **Reduced motion is not optional.** Collapse to `{ duration: 0 }`, or a 0.15 s fade where an instant cut reads as a bug.
