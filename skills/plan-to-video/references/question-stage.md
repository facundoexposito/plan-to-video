# Question stage: shared spec for decision and step frames

Every "one question per frame" frame uses this exact layout so the run reads as one continuous list instead of separate slides. Workers build frames independently; with only the storyboard prose they drift (different headline sizes, cards at different heights). Fill in the tokens below from `frame.md` and paste the block into the dispatch context of every question-stage worker.

The geometry is tuned for 1920x1080. For 1080x1920 or 1080x1080, keep the proportions and stack the cards in one column.

Tokens to fill: `{GROUND}` base ground, `{CARD}` raised card, `{TEXT}` primary text, `{MUTED}` secondary text, `{ACCENT}` the single accent, `{SANS}` and `{MONO}` the font families (with the exact files in `assets/fonts/` if staged), `NN` this frame's index in the list, `TT` the list length.

```
Shared question-stage spec (frames NN to MM all follow it exactly):
- ground {GROUND} with a 1px hairline grid at about 4% of {TEXT}, as its own full-duration clip layer (never on #root)
- kicker top-left at 80px padding: "NN / TT" in {MONO} 28px uppercase, tracking 0.16em, with one small accent glyph (an inline SVG mark, not an emoji) in {ACCENT}
- progress rail top-right: TT circles of 14px, 18px apart; outline {TEXT} at 25%; the current one filled {ACCENT}; earlier ones filled {TEXT} at 40%
- question headline: {SANS} 400, 88px, line-height 1.06, tracking -0.018em, {TEXT}, left aligned at x=80, top at 210px, max-width 1500px; reveals word by word as the voice asks it
- option cards: one row starting at y=520 (a 2x2 grid at y=470 for 4 options), gap 28px, background {CARD}, 1px border {TEXT} at 9%, radius 12px, padding 36px, label {SANS} 44px {TEXT}
- the recommended ("lean") card, if any, gets a 2px {ACCENT} left edge instead of the hairline; no other accent besides the kicker glyph and the rail dot
- optional note line: {SANS} 30px {MUTED} under the cards at y=800, for a caveat the voice adds
- each card enters only on its spoken cue (use the word timings in the packet): fromTo y+20 opacity 0 to y 0 opacity 1, 0.6s power3.out; nothing enters before the voice names it; the final window holds still
- nothing important below y=900 (the bottom ~17% stays clear for captions)
```

## Variations that worked

- **Two linked choices** ("who decides", then "for whom"): two rows of two cards with a mono "or" between each pair.
- **A number decision** (budget A or B): a horizontal bar under the cards that fills to the first value, then extends with the extra segment in the accent.
- **A threshold**: a 0 to 100 gauge with a marker line, cards in sequence joined by mono arrows.
- **A concept that needs a picture**: a small visual card top-right next to the headline; cap the headline at about 1200px to make room.
