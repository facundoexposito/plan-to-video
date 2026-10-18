---
name: plan-to-video
description: >-
  Turns a plan, research note, proposal, roadmap or decision list into a narrated explainer video (MP4) that walks through why it matters, how it works, and each open decision with its options. A thin wrapper over the HyperFrames /hyperframes and /faceless-explainer workflow that fixes the brief, the story shape and a shared "question stage" layout, and patches the steps that commonly break on a fresh machine (local Kokoro voice, brand fonts, timing). Use it whenever the user wants to explain a plan, a set of decisions, open questions or research findings as a video, even if they do not say "explainer" or name HyperFrames. Triggers: "turn this plan into a video", "explain this as a video", "make a video of this research", "decision video", "walk the team through these options in a video". Not for product promos from a website URL, PR walkthroughs, captions on existing footage, or logo stings.
---

# Plan to video

Turns a written plan into a narrated explainer (about 60 to 90 s for a social post, 2 to 2.5 min for a real plan with several decisions): the hook, the problem, the proposal, the mechanism, then one frame per open decision (question plus 2 to 4 options) and a closing ask.

This skill does not re-implement HyperFrames. It decides the brief, the story shape and the setup, then runs the installed `/faceless-explainer` workflow step by step, adding fixes at the points where the default pipeline tends to break. Read `/hyperframes` and `/faceless-explainer` as they instruct; this file tells you what to answer and what to patch.

**First run on a machine:** read `references/setup.md` and run its preflight. It installs the HyperFrames skills and a local voice if they are missing.

## Configuration

Resolve these once at the start and reuse them in every command. Ask the user only if a value cannot be found.

| Name | How to resolve | Default |
|---|---|---|
| `VIDEOS_DIR` | `$PLAN_TO_VIDEO_DIR` if set | `./videos` under the current working directory (the faceless-explainer convention) |
| `FE_DIR` | the folder holding the installed `faceless-explainer/SKILL.md` | see `references/setup.md` for the lookup |
| `MEDIA_DIR` | the folder holding the installed `media-use/SKILL.md` | same lookup |
| `HYPERFRAMES_PYTHON` | env var if set, else the venv from `references/setup.md` | `~/.hyperframes-venv/bin/python` |
| `VOICE` | the user's ask, else the remembered voice, else | Kokoro `am_michael` (offline) |

## 1. Brief (confirm briefly, do not interrogate)

Read the source first (the plan doc, the research note, the chat). Then propose these defaults in one short message and ask only what the source cannot answer. A fast yes beats a questionnaire.

| Field | Default | Why |
|---|---|---|
| `angle` | `listicle` (one of the route's values: concept, how-to, listicle, narrative) | a plan is "why it matters, how it works, N decisions" |
| storyboard `arc` | `concept-explainer with listicle` | free text in `STORYBOARD.md`, not a brief enum |
| `aspect` | `1920x1080` | watched on a laptop or in a call; option cards need width |
| `length` | 2 to 2.5 min for a real plan with several decisions; about 60 to 90 s for a social post. Hard cap 180 s | faceless-explainer's sweet spot is 30 to 90 s; a plan with many decisions runs longer. About 10 s per decision plus intro and close |
| `language` / voice | the source's language; Kokoro `am_michael` for English | local and free. Non-English Kokoro voices need `espeak-ng` |
| `flow` / `storyboard` | `automation` / `no` (autonomous) | offer the storyboard review when the plan is high stakes |
| look | the project's own brand when the video is about a repo, else a fitting preset | the video should look like the thing it explains |
| `music` | `none` | local MusicGen needs torch; HeyGen music needs sign-in |
| project | `$VIDEOS_DIR/<kebab-topic>/` | one folder per video |

Ask, at most: who will watch it (it sets how technical the copy gets), and whether a recommended option should be marked on each decision (the accent "lean" edge).

Recommended option rule: mark the option the source recommends. When no single option wins, mark nothing; when the decision is "support several", mark every option that is part of that answer. When the source does not say, recommend this skill's own defaults (the values in the table above) instead of inventing a preference.

`BRIEF.md` is written in Step 0, **after** `npx hyperframes init` (init refuses a non-empty folder), in the shape `/hyperframes` `references/brief-format.md` describes, with what the user said and what you inferred kept apart.

## 2. Story shape

Default arc, adapt to the source:

1. **Hook with a real number** from the source ("N of M items are X"). Every figure must trace to a line of the source; never invent stats, prices or counts. If the source has no number, open on the concrete pain instead.
2. **The problem in 2 or 3 named causes**, with real examples from the source.
3. **The thesis or proposal** by frame 3 (value before evidence).
4. **The mechanism** in one diagram frame.
5. **A signpost** ("Five decisions before we build it") as a short breather.
6. **One frame per open question or step**, all on the same question stage (`references/question-stage.md`). Each frame shows the question and its 2 to 4 options; options enter as the voice names them.
7. **A closing ask** that calls back to the signpost ("Answer these five and step one ships this week").

Write the voiceover as short cue phrases (6 to 25 words per frame) so each option has a word to reveal on. If a decision is already answered in the source, show the chosen answer in the accent instead of asking.

## 3. Run the workflow, with these patches

Follow `/faceless-explainer` Steps 0 to 6 in order. At each step apply the matching patch from `references/gotchas.md`. The ones that bite when skipped:

- **Step 0:** init inside `$VIDEOS_DIR`'s parent so the project lands at `$VIDEOS_DIR/<topic>`, then write `BRIEF.md`. Signed out of HeyGen is fine: voice runs on Kokoro locally.
- **Step 2 design:** for a repo, put its colors and fonts in `capture/extracted/tokens.json` and stage the real `.woff2` files in `assets/fonts/` **before** `build-frame.mjs` (it then writes the `@font-face` block itself). Get fonts from the brand's own site files, a Google Fonts download, or a font package in `node_modules`. If the brand is dark and the preset is light, invert the roles in `frame.md`, replace preset glyphs the embedded font may lack, and swap a preset accent that belongs to another brand for the user's own (`references/gotchas.md`, Step 2).
- **Step 3.1 audio:** pass `HYPERFRAMES_PYTHON` on every audio command unless the default `python3` already imports `kokoro_onnx`.
- **Timings:** let audio finish and run `audio.mjs sync-durations` before you write Step 4's Scene windows, then pace every reveal from the real word timings in `audio_meta.json`. (faceless-explainer runs sync-durations at Step 5; moving it earlier is deliberate.)
- **Breathing room:** sync-durations sets each frame to its exact voice length, so the last frame and the signpost end abruptly. Right after sync, edit `- duration:` in `STORYBOARD.md`: final frame +2 to 3 s, signpost and other breather frames +1 s. Do it before building packets so workers animate against the padded windows.
- **Caption words:** captions come from a transcription of the audio, not from `SCRIPT.md`, so product names get misheard. Before captions are built, compare the word list in `audio_meta.json` (`voices[].words[].text`) against `SCRIPT.md` and correct misheard words in place, keeping their timings.
- **Before Step 5 dispatch:** give every worker the exact font filenames staged in Step 2. Packets omit the storyboard's `## Video direction` block and the full word timings, so paste both into each worker's dispatch context. Give the question-stage frames the shared spec verbatim. Ban emoji.
- **Step 5:** one worker per frame, in parallel when your agent supports sub-agents (a faster model is fine for workers), each with `_role.md`, its packet and the dispatch context.
- **After workers:** normalize asset paths, fix lint warnings that are real seek bugs, run `check`, snapshot, look at the contact sheet.

## 4. Quality gates (all before render)

- `npx hyperframes lint` with 0 errors. `studio_missing_editable_id` warnings are cosmetic; `gsap_repeated_fromto_without_baseline` is a real bug, fix it (`references/gotchas.md`, Step 6).
- `npx hyperframes check` passes.
- `npx hyperframes snapshot --at <each frame's midpoint>` and actually look at the contact sheet: dark text on a dark ground, missing fonts (serif fallback), clipped cards and emoji tofu all show up there.
- If the user has a house style (for example "no em dashes"), check every string: the `- voiceover:` lines, the SCRIPT.md lines, the text in `compositions/frames/*.html`, and the headings too. Write headings with a colon (`## Frame 1: Hook`, `## Line 1: Hook (Frame 1)`); the storyboard and script parsers accept it, so no dash is ever needed.

## 5. Review, render, hand off

faceless-explainer's Step 6 keeps one question even in autonomous mode: open `npx hyperframes preview --background` and ask "render now, or what changes?". Skip that question when the user asked for a one-shot render. Then:

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4` (`--skill` only tags anonymous render telemetry; `high` is an alias of `delivery`)

Open the MP4 only if the user wants that (`open` on macOS, `xdg-open` on Linux, `start` on Windows). Report: the MP4 path, its real duration (`ffprobe -v error -show_entries format=duration -of csv=p=0 renders/video.mp4`), the frame list with ids (`compositions/frames/NN-*.html`) so single frames can be revised, the contact sheet path, and anything skipped (no music, a mispronounced word, a fact left out because the source did not have it).

## Reference files

- `references/setup.md`: fresh-machine install and preflight (HyperFrames skills, Kokoro venv, ffmpeg, Chrome).
- `references/question-stage.md`: the shared layout spec for decision and step frames. Paste it into each of those workers' dispatch context.
- `references/gotchas.md`: environment and pipeline fixes, by workflow step, with commands.
