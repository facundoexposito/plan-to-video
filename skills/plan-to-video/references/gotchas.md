# Gotchas and fixes, by workflow step

Each of these broke or nearly broke a real run of the pipeline. They are ordered by the `/faceless-explainer` step where they apply.

## Step 0: setup

- Init from the home directory so the project lands in `~/videos/<topic>`: `cd ~ && npx hyperframes init "videos/<topic>" --non-interactive --example=blank --skill=faceless-explainer`.
- `npx hyperframes auth status` will say not signed in to HeyGen. That's fine: voice runs on Kokoro locally. Say so and continue.
- Recording prefs: run `node ~/.claude/skills/media-use/scripts/prefs.mjs record --hyperframes . --key <k> --value <v>` once per key. A shell loop with `set --` silently failed in zsh; run them one by one.

## Step 1: brief / source

- Copy the source text into `capture/extracted/visible-text.txt`, then append the hard facts the video will use (numbers, real examples, the exact list of questions) so workers and the script can't drift from them.
- For a repo, put its brand into `capture/extracted/tokens.json` (`colors` from `globals.css` `:root`, `fonts` from the app's font setup).

## Step 2: design system

- `build-frame.mjs` maps brand colors onto the preset by role. With a dark brand on a light preset (code-editorial is light paper) the result is still a light ground. Fix it in `frame.md`: set `cream` to the dark ground, `ink` to the light text, `tile`/`tile-strong` to the raised dark card steps, add a `muted` secondary text color, set `navy*` to dark panel surfaces, and add a "Dark ground" line at the top of the Brand adaptation section explaining the inversion. The assembler paints the canvas from the cream-named color, so this is what makes the base dark.
- `code-editorial` remixed well for a product/tech plan (mono kickers, one accent, hairline cards).

## Step 3.1: audio (Kokoro)

System Python is 3.15 and `kokoro-onnx` won't resolve on it; pip also refuses system installs (PEP 668). Use a dedicated 3.12 venv, created once:

```bash
test -x ~/.hyperframes-venv/bin/python && ~/.hyperframes-venv/bin/python -c "import kokoro_onnx, soundfile" \
  || { rm -rf ~/.hyperframes-venv && uv venv -q --python 3.12 ~/.hyperframes-venv \
       && VIRTUAL_ENV=~/.hyperframes-venv uv pip install -q kokoro-onnx soundfile; }
```

Prefix every audio command with it:

```bash
HYPERFRAMES_PYTHON=~/.hyperframes-venv/bin/python node ~/.claude/skills/faceless-explainer/scripts/audio.mjs \
  --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json --voice am_michael
```

- Set `music: none` in the storyboard frontmatter (MusicGen needs torch, not installed).
- Kokoro reads faster than the 2.5 words/s estimate: 364 words came out at 133 s, not 150. Plan about 2.7 words/s, or accept the shorter cut.
- Kokoro may mishear homophones ("Whose" came out as "Who's"). Mention it in the hand-off; rephrasing the line is the only fix.

## Step 4: visual design

- Run `audio.mjs sync-durations` first, then print the word timings (`audio_meta.json` → `voices[].words[]` with `start`) and write each Scene window against them. Estimated timings put reveals before the voice reached them.
- Write the `## Video direction` block once at the top of `STORYBOARD.md` (palette roles, VO-paced reveals, the question stage, held frames, negative list including "no em dashes" and "one accent moment per frame").

## Step 5: frame workers

- **Fonts first.** Workers find no font files and guess paths (`Geist-400.woff2`, `../../assets/fonts/...`), so the render falls back to a serif. Before dispatch, copy real woff2 files into `assets/fonts/` (Geist lives in `node_modules/geist/dist/fonts/geist-sans/` and `geist-mono/` of a project that uses it; otherwise look in `node_modules`, `public/fonts` or the font package). Tell every worker the exact filenames.
- **Paths are project-root relative**: `assets/fonts/Geist-Regular.woff2`, `public/cover.jpg`. After workers finish, normalize anyway: `sed -i '' 's#\.\./\.\./assets/fonts/#assets/fonts/#g' compositions/frames/*.html`.
- **No emoji.** The headless render has no emoji font, so 👍 renders as tofu. Tell workers to use inline SVG or words; after they finish, `grep -l "👍\|👎\|♥\|🧺" compositions/frames/*.html` and replace any that slipped through.
- **Real images** (covers, screenshots) go in `public/` and are listed as `asset_candidates` on the frame. The assembler warns "not found under capture/"; that warning is harmless when the file exists in `public/`.
- Dispatch one worker per frame in a single message, `model: sonnet`, background. Prompt: read `_role.md`, the frame's packet and `frame.md`; dispatch context with PROJECT_DIR, frame_id, canvas, captions status, the font filenames, the question-stage spec for those frames, "write only your file, never edit STORYBOARD.md, no em dashes".
- Mark every frame `status: animated` in `STORYBOARD.md` once its file exists, then `assemble-index.mjs`.

## Step 6: finalize

- `transitions.mjs inject` then `verify`, then `npx hyperframes lint`.
- `gsap_repeated_fromto_without_baseline`: a second `fromTo` on the same target overwrites the resting state for seeks before it. Add `immediateRender: false` to every later `fromTo` on that target (not the earliest one).
- `studio_missing_editable_id` warnings are cosmetic for rendering; leave them.
- `npx hyperframes check` "content_overlap" infos are fine when the overlap is the intended motion (chips merging, a line moving up).
- Snapshot at frame midpoints and read the contact sheets before rendering.
- Render takes about 1.4x the video length on this Mac (2:13 rendered in 3:08). Then `open` the MP4.
