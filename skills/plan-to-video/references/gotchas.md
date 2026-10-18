# Gotchas and fixes, by workflow step

Each of these broke, or nearly broke, a real run of the `/faceless-explainer` pipeline. They are ordered by the step where they apply. `$FE_DIR`, `$MEDIA_DIR`, `$VIDEOS_DIR` and `$HYPERFRAMES_PYTHON` are resolved as in `SKILL.md` and `setup.md`.

## Step 0: setup

- `init` takes a path relative to the current folder and refuses a non-empty target. Run it from the parent of `$VIDEOS_DIR` so the project lands where you expect:
  `npx hyperframes init "videos/<topic>" --non-interactive --example=blank --skill=faceless-explainer`
  (with a custom `$VIDEOS_DIR`, `cd` to its parent and pass `<basename>/<topic>`).
- Write `BRIEF.md` right after init, never before.
- Run `HYPERFRAMES_PYTHON="$HYPERFRAMES_PYTHON" npx hyperframes auth status` (and `doctor`) with the prefix: without it both report Kokoro missing even when the venv works. "Not signed in" is fine: voice runs on Kokoro locally. Say so and continue.
- Record preferences one key per command: `node "$MEDIA_DIR/scripts/prefs.mjs" record --hyperframes . --key <k> --value <v>`. A shell loop that rebuilt the argument list failed silently under zsh. Only `destination`, `aspect`, `language`, `flow`, `storyboard`, `voice` and `style_preset` (with `--workflow faceless-explainer`) are accepted.

## Step 1: brief and source

- Copy the source text verbatim into `capture/extracted/visible-text.txt`, then append a short "Hard facts" block (every number, every real example, the exact list of questions and options). Workers and the script then cannot drift from them.
- For a repo, put its brand in `capture/extracted/tokens.json`: `colors` from the CSS custom properties (for example `:root` in the global stylesheet), `fonts` from the app's font setup.
- Strip anything that should not be in a video file (customer names, private numbers, credentials) before it lands in `visible-text.txt`. Everything there can end up on screen or in the voiceover.

## Step 2: design system

- `build-frame.mjs` maps brand colors onto the preset by role. A dark brand on a light preset still yields a light ground. Fix it in `frame.md`: set the preset's ground color key to the dark ground, its ink key to the light text, its tile keys to the raised dark card steps, add a `muted` secondary text color, set panel keys to dark surfaces, and add one line at the top of the brand section explaining the inversion. The assembler paints the canvas from the ground key, so this is what makes the base dark. (Key names differ per preset; read the preset's `FRAME.md`.)
- **Fonts go in first.** Stage the real `.woff2` files in `assets/fonts/` before running `build-frame.mjs`; it then writes the `@font-face` block into `frame.md` itself. Sources: the brand's own site files (for example `public/fonts`), a Google Fonts download, or a font package in `node_modules/<font-package>`. Check the license allows embedding (SIL OFL fonts do). Staged after the build, the fonts are missing from `frame.md`, workers guess a path, and the render falls back to a serif.
- **When inverting, also check glyphs and accent.** Replace preset glyphs the embedded font may not contain (the `code-editorial` ✱ spike dingbat can render as a box; use an inline SVG mark), and replace a preset accent that belongs to another brand with the user's own accent.
- `code-editorial` remixes well for product and engineering plans (mono kickers, one accent, hairline cards). Browse the rest with each preset's `frame-showcase.html`.

## Step 3.1: audio (Kokoro)

Prefix every audio command with the venv interpreter:

```bash
HYPERFRAMES_PYTHON="$HYPERFRAMES_PYTHON" node "$FE_DIR/scripts/audio.mjs" \
  --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice am_michael
```

- Set `music: none` in the storyboard frontmatter unless MusicGen's deps are installed or you are signed in to HeyGen.
- Kokoro reads faster than the pipeline's 2.5 words per second estimate. In one run 364 words came out at 133 s, not 150 (about 2.7 words per second). Plan for that, or accept the shorter cut.
- Kokoro can swap homophones (a "Whose" came out as "Who's"). Rephrasing the line is the only fix; mention any you hear in the hand-off.

## Step 4: visual design

- Let audio finish, run `node "$FE_DIR/scripts/audio.mjs" sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`, then print the word timings (`audio_meta.json` at `voices[].words[]`, each with `start` and `end`) and write each Scene window against them. Estimated timings put reveals before the voice reached them.
- **Pad held frames.** sync-durations sets every frame to its exact voice length, so the final frame cuts off the moment the voice stops and the signpost has no pause. Right after sync, edit `- duration:` in `STORYBOARD.md`: final frame +2 to 3 s, signpost and other breather frames +1 s. Do it before `frame-packets.mjs`, because the packets copy each frame's duration and workers time their holds to it.
- **Fix misheard caption words.** When captions are on, `captions.mjs` builds them from the transcribed words in `audio_meta.json`, not from `SCRIPT.md`, so product and brand names come out wrong. Before building captions, compare `voices[].words[].text` with `SCRIPT.md` and correct each misheard word in place, keeping its `start` and `end`.
- Write the `## Video direction` block once at the top of `STORYBOARD.md`: palette roles, VO-paced reveals, the question stage, held frames, and a negative list (for example "one accent moment per frame", "no emoji", plus any house style rules).

## Step 5: frame workers

- **Fonts.** Already staged in Step 2. Give every worker the exact filenames in `assets/fonts/`.
- **Paths are project-root relative** (`assets/fonts/Brand-Regular.woff2`, `public/cover.jpg`). After workers finish, normalize anyway, portably: `perl -pi -e 's#\.\./\.\./assets/#assets/#g' compositions/frames/*.html`.
- **No emoji.** The headless renderer usually has no emoji font, so emoji render as empty boxes. Tell workers to use inline SVG or words; afterwards scan with `perl -CSD -ne 'print "$ARGV: $_" if /[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]/' compositions/frames/*.html` and replace any hits.
- **Real images** (screenshots, covers) go in `public/` and are listed as `asset_candidates` on the frame. The assembler warns "not found under capture/"; that warning is harmless when the file exists in `public/`. Use only images you have the right to publish.
- Dispatch one worker per frame in a single message, in the background when supported. Prompt: read `_role.md`, the frame's packet and `frame.md`; dispatch context with PROJECT_DIR, frame_id, canvas, caption status and keep-out band, the font filenames, the storyboard's `## Video direction` block verbatim, the frame's full word timings from `audio_meta.json` (packets include neither), the question-stage spec for those frames, and "write only your file, never edit STORYBOARD.md".
- Mark every frame `status: animated` in `STORYBOARD.md` once its file exists, then run `assemble-index.mjs`.

## Step 6: finalize

- `transitions.mjs inject`, then `verify`, then `npx hyperframes lint`.
- `gsap_repeated_fromto_without_baseline`: a second `fromTo` on the same target overwrites the resting state for seeks before it, because `fromTo` renders immediately by default. Add `immediateRender: false` to every later `fromTo` on that target (not the earliest one). That is right for repeated tweens on one element. When the tweens target per-word elements (`words[i]` from one selector), give each word its own id and tween it by id instead; `immediateRender: false` there lets words show before their cue.
- `studio_missing_editable_id` warnings are cosmetic for rendering; leave them.
- `npx hyperframes check` "content_overlap" infos are fine when the overlap is the intended motion.
- Small `text_box_overflow` findings on caption words are a known false positive (see faceless-explainer Step 6). Act only on ones that name a frame element.
- Snapshot at frame midpoints and read the contact sheet before rendering.
- Local render took about 1.4x the video length on a recent laptop (2:13 rendered in 3:08). `npx hyperframes cloud` renders on HeyGen's servers instead, under their terms.
