# Question stage: shared spec for decision and step frames

Every "one question per frame" frame uses this exact layout so the run reads as one continuous list instead of separate slides. Workers build frames independently, so if each one gets only the storyboard prose they drift (different headline sizes, cards at different heights). Paste the block below, with the brand values filled in, into the dispatch context of every question-stage worker.

Values shown are from a dark-brand build. Swap colors and fonts for the project's tokens; keep the geometry.

```
Shared question-stage spec (all of frames NN to MM follow it exactly):
- ground #0c0c0d with a 1px hairline grid at ~4% light, as its own full-duration clip layer (not on #root)
- kicker top-left at 80px pad: "✱ NN / TT" in Geist Mono 28px uppercase, tracking 0.16em; the ✱ in the accent #f0832c
- progress rail top-right: TT circles of 14px, 18px apart; outline rgba(236,236,237,0.25); the current one filled with the accent; earlier ones filled #ececed at 40%
- question headline: Geist 400, 88px, line-height 1.06, tracking -0.018em, #ececed, left aligned at x=80, top at 210px, max-width 1500px; reveals per word as the voice asks it
- option cards: one row starting at y=520 (2x2 grid at y=470 when there are 4 options), gap 28px, background #151517, 1px border rgba(236,236,237,0.09), radius 12px, padding 36px, label Geist 44px #ececed
- the recommended ("lean") card, if any, gets a 2px accent left edge instead of the hairline; never more than one accent moment besides the kicker and the rail dot
- optional note line: Geist 30px #9b9ba3 under the cards at y=800, for a caveat the voice adds
- each card enters only on its spoken cue (use the word timings in the packet): fromTo y+20 opacity 0 → y 0 opacity 1, 0.6s power3.out; nothing enters before the voice names it; the final window holds still
- nothing important below y≈900 (bottom ~17% stays clear)
```

## Variations that worked

- Two pairs ("team or person", then "everyone or only me"): two rows of two cards with a mono "or" between each pair.
- A number decision (budget 60 or 80): a horizontal bar under the cards that fills to the first value, then extends with the extra segment in the accent.
- A threshold recheck: a 0 to 100 gauge with a marker line, cards in a sequence joined by mono arrows.
- A concept that needs a picture (an embedding as a "fingerprint"): a small visual card top-right next to the headline; cap the headline at ~1200px to make room.
