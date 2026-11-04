The first dark mode I built was an inversion. White became black, black became white, and every color was flipped. It looked like a photo negative. Users hated it, and they were right.

## Do not invert. Decide again.

Light and dark themes are two interpretations of the same system. A blue that feels trustworthy on white can vibrate on near-black. A grey border that is subtle on paper can become a harsh line in the dark.

I define a small set of semantic tokens and give each theme its own values:

```css
:root {
  --background: #f7f3ec;
  --foreground: #2b2822;
  --card: #fdfbf7;
  --muted-foreground: #6e675b;
  --border: #e1dacd;
  --brand: #55663f;
}

.dark {
  --background: #121110;
  --foreground: #ece8df;
  --card: #1a1816;
  --muted-foreground: #aaa297;
  --border: #322e28;
  --brand: #b9cba4;
}
```

Components only use the semantic name. I can tune the dark palette without touching a single component, and new components get both themes for free.

## Elevation without shadow

Shadows barely register on a dark background. Instead, I use lightness. The base is darkest, cards are one step lighter, popovers one step lighter again. The difference is subtle but readable.

```css
.dark {
  --background: #121110;
  --surface: #171512;
  --card: #1a1816;
  --raised: #22201c;
}
```

Borders do a lot of the elevation work too. A one-pixel border at 8% white is often cleaner than a shadow.

## Contrast is not white on black

Pure white on pure black is technically the highest contrast, and it is exhausting to read. I use off-white text on a near-black background and keep body text around 87 to 92% opacity.

The minimum is 4.5:1 for body text and 3:1 for large text. Dark mode makes it easy to overdo contrast on headings and underdo it on muted copy. Test both.

## Images and illustrations

Photographs look brighter on dark backgrounds. I add a slight dimming overlay or reduce the brightness a little. For logos with transparent backgrounds, I keep two variants or put them in a light container. SVG illustrations with black strokes are a common failure. Use `currentColor` and they adapt.

## Accents and focus rings

A lime accent that looks fresh on cream can glow like a neon sign on black. I lower the saturation and reduce the opacity of accent surfaces in dark mode. One focal point per screen is enough.

Focus rings need extra attention. A dark ring on a dark input is invisible. I use the accent in both themes, or a light ring with enough offset.

## Test the boring states

The states people see when something goes wrong are the ones that get forgotten:

- Hover and active states on ghost buttons.
- Disabled inputs, which can disappear into the background.
- Empty states and skeletons.
- Toasts and dialogs, which sit above everything.
- Browser autofill and scrollbars.

I test all of these in both themes before calling the work done.

## Respect the system

Default to the system preference, remember the user's override, and apply the theme before first paint to avoid the white flash. `next-themes` handles most of it. A small inline script handles the rest.

Dark mode is not a filter. It is a second design with the same rules and different decisions. Treat it that way and it stops feeling like extra work.
