Most interface animation is decoration. A card lifts, a button bounces, a gradient drifts. It looks fine in a demo and becomes background noise by the fifth visit. The animation I keep is the kind that answers a question.

## Start with the question

Before adding a transition, I finish this sentence: "This animation tells the user that ___." If the blank is "it looks cool", it has to earn its place somewhere else. If the blank is "the panel came from the right, so it belongs on the right", I keep it.

Good motion usually does one of three things:

- **Orients.** It shows where something came from and where it went.
- **Acknowledges.** It confirms a tap or a save before the network does.
- **Explains.** It shows a relationship, like a shared element between two states.

Everything else is a candidate for removal.

## Pick a duration and move on

I use three rough bands:

- **100 to 160ms** for feedback on a direct action, like a button press or a toggle.
- **180 to 280ms** for entering elements and small layout changes.
- **300 to 500ms** for a full-screen transition or a deliberate reveal.

Anything longer needs a reason and a way to skip it. Easing matters too. I reach for `cubic-bezier(0.22, 1, 0.36, 1)` on entrances because it starts quickly and settles slowly. Linear feels mechanical. Ease-in-out on an entrance makes the element look like it is hesitating.

```tsx
const panel = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};
```

## Respect the preference

Reduced motion is not an edge case. People turn it on because motion makes them feel unwell, and a portfolio is exactly the kind of site where that matters. I honor the setting in the component, not with a global CSS rule that leaves the page feeling broken.

```tsx
"use client";
import { useReducedMotion, motion } from "motion/react";

export function Reveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.6 }}
    >
      {children}
    </motion.div>
  );
}
```

I still put a `prefers-reduced-motion` rule in the base stylesheet, so third-party animations cannot sneak through. The hook handles the things I wrote myself.

## Test on a slow phone

A blur is cheap until it covers the viewport. A parallax layer is cheap until there are nine of them. I test on a mid-range Android phone with the CPU throttled, not just on my laptop. If a hero effect drops frames, it gets simpler before it ships.

Three rules keep me honest:

1. Animate `transform` and `opacity`. Everything else is a negotiation.
2. Lazy-load heavy visuals below the fold, and never block the largest contentful paint for an entrance.
3. Pause marquees on hover and when the tab is hidden.

## A short checklist

Before I call a motion pass done:

- Does it survive `prefers-reduced-motion`?
- Does it run at 60fps on a phone from 2022?
- Does anything move that should not, especially while the user is typing?
- Can the user get the same information without waiting for the animation?

That is most of what I know about motion. The rest is taste and testing.
