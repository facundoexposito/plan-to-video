# Drawn style (default look for every plan video)

Make this the default: the video explains with drawings, not with text slides. Colors and fonts still come from the project's brand (SKILL.md "look"); this file sets how things are drawn and moved.

Working examples (HyperFrames frames, 1920x1080, dark brand): `drawn-examples/04-shop.html` (a metaphor object built piece by piece), `05-prices-sightings.html` (a card with two drawers, tally marks drawn stroke by stroke), `07-evidence.html` (a stream of sheets feeding a card, a drawer that keeps only some). Read one before writing the storyboard and give it to frame workers as the reference.

## Pick one metaphor and keep it

- Find one everyday metaphor for the whole plan (a shop with a catalogue and cards, a photocopier, a drawer, a tally sheet) and build every frame from it. The story reads as one place, not ten slides.
- Define 2 to 4 **shared objects** in the storyboard with exact sizes and parts, identical in every frame (e.g. "offer card: 340x200, radius 12, hole-punch circle and string at top so it hangs, mono label top-left, a padlock pill top-right"). Workers copy them, never redraw their own version.
- Show the problem as a drawing too: piles of identical sheets stamped "SAME", one object with three ID cards, ten little figures turning into ten boxes.

## How things are drawn

- Every object is inline SVG: 2 to 3px strokes in the ink or muted color, round caps and joins, filled with the brand's tile colors. No stock icons, no emoji, no glyph arrows or checks: draw them.
- Objects appear by **self-drawing their outline** (stroke-dashoffset, 0.6 to 0.9 s, power2.inOut), then the fill fades in.
- Counting is drawn: tally marks one stroke at a time (four verticals and a diagonal, 0.06 to 0.08 s per stroke); stacks of sheets pop out one by one (about 0.12 s apart), slightly rotated (-4 to 4 deg).
- Arrows self-draw, then their head pops in. Dashed outlines mean "suggested, not confirmed".
- Words on screen are short labels (1 to 5 words), never sentences over 8 words. The voice carries the explanation.

## Motion and accent

- Every element enters on the word that names it (times from the real word timings in `audio_meta.json`). After the last reveal, hold still: no drift, no breathing, no bounce or overshoot (power3 settles).
- One accent moment per frame in the brand accent color (the padlock "stable id", the one sheet that is kept). A warning color only for small "repeat" / "wrong" stamps.
- Faint hairline grid as the ground (about 4% ink, 80px cells), on its own full-duration layer.

## Facts in drawings

- Numbers on screen come from the source only. When the source has no figure for a drawing (a tally, a price list), draw it symbolic with no digits rather than inventing one, and say so in the hand-off.
- No real phone numbers or private names, even inside a drawing.
