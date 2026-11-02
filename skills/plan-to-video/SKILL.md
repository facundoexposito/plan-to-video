---
name: plan-to-video
description: >-
  Turn a plan, research note, proposal, decision list or chat summary into a narrated explainer video (MP4) so Facu can explain his plans to clients, partners or his team. A thin wrapper over the HyperFrames /hyperframes → /faceless-explainer workflow with Facu's defaults (16:9, English Kokoro voice, about 2 to 2.5 min, autonomous one-shot, the project's own brand look) and the fixes that make it render on this Mac. Use it whenever the user wants to explain a plan, a set of decisions, open questions, a roadmap or research findings as a video, even if they don't say "explainer" or name HyperFrames. Triggers: "turn this plan into a video", "explain this as a video", "make a video of the research", "video de este plan", "explicalo en un video", "plan video", "decision video", "make this a video for the client". NOT for: product launch promos from a website URL (/product-launch-video), PR walkthroughs (/pr-to-video), captions on footage, logo stings, or ad footage (higgsfield).
---

# Plan to video

Facu uses this to explain plans: why something matters, how the proposal works, and which decisions are open, each with its options.

This skill does not re-implement HyperFrames. It decides the brief, the story shape and the setup, then runs the installed `/faceless-explainer` workflow step by step, adding the fixes below at the points where the default pipeline broke on this machine. Read `/hyperframes` and `/faceless-explainer` as they instruct; this file tells you what to answer and what to patch.

## 1. Brief (confirm briefly, don't interrogate)

Read the source first (the plan doc, the research note, the chat). Then propose these defaults in one short message and ask only what the source cannot answer. Facu prefers a fast yes over a questionnaire.

| Field | Default | Why |
|---|---|---|
| angle | `concept-explainer with listicle` | the plan shape: why it matters → how it works → N decisions/steps |
| aspect | 16:9 1920x1080 | watched on a laptop or in a call; option cards and diagrams need width |
| length | about 2 to 2.5 min (hard cap 3) | 9 questions at ~10 s each plus intro and close |
| voice | English, Kokoro `am_michael` | local, free; Spanish only if he asks |
| review | autonomous one-shot (`flow: automation`, `storyboard: no`) | he chose this; offer the storyboard only if the plan is high stakes |
| look | the repo's own brand when the video is about a project, else a fitting preset | the video should look like the thing it explains |
| style | drawn: one metaphor, shared SVG objects that self-draw, tally marks, short labels (`references/drawn-style.md`) | Facu's pick (2026-10-28): drawings explain better than text slides |
| music | `music: none` | MusicGen isn't installed; HeyGen BGM only if signed in |
| project | `~/videos/<kebab-topic>/` | one folder per video |

Ask, at most: who will watch it (it sets how technical the copy gets), and whether a recommended option should be marked on each decision (the coral "lean" edge). Then write `BRIEF.md` exactly as `/hyperframes` describes, with what he said and what you inferred kept apart.

## 2. Story shape

Default arc, adapt to the source:

1. **Hook with a real number** from the source (e.g. "514 videos, 335 have nothing to do with our products"). Every figure must trace to a line of the source; never invent stats, prices or counts. If the source has no number, open on the concrete pain instead.
2. **The problem in 2 or 3 named causes**, with real examples from the source.
3. **The thesis / proposal** by frame 3 (value before evidence).
4. **The mechanism** in one diagram frame.
5. **A signpost** ("Nine decisions before we build it") as a short breather.
6. **One frame per open question or step**, all on the same "question stage" (`references/question-stage.md`). Each frame shows the question and its 2 to 4 options, and the options enter as the voice names them.
7. **A closing ask** that calls back to the signpost ("Answer these nine, and step one ships in a day").

Write the voiceover as short cue phrases (6 to 25 words per frame) so each option has a word to reveal on. If the source has decisions already answered, show the chosen answer in coral instead of asking.

## 3. Run the workflow, with these patches

Follow `/faceless-explainer` Steps 0 to 6 in order. At each step apply the matching patch from `references/gotchas.md`. The ones that will bite you if skipped:

- **Before Step 3.1 audio:** make sure the Kokoro venv exists and pass `HYPERFRAMES_PYTHON` on every audio command (system Python is 3.15, Kokoro needs 3.12).
- **Step 2 design:** for a repo, put its colors and fonts in `capture/extracted/tokens.json` before `build-frame.mjs`. If the brand is dark and the preset is light, invert the roles in `frame.md`.
- **Before Step 4:** run `audio.mjs sync-durations`, then write each frame's Scene timings from the real word timings in `audio_meta.json`, not from estimates.
- **Before Step 5 dispatch:** stage the real font files in `assets/fonts/`, then give every worker the exact font filenames and the project-root path rule. Give the question-stage frames the shared spec verbatim. Ban emoji.
- **Step 5:** dispatch one worker per frame, all in parallel, `model: sonnet`, each with `_role.md` + its packet + the dispatch context.
- **After workers:** normalize paths, fix lint warnings that are real seek bugs, run `check`, snapshot, look at the contact sheet.

## 4. Quality gates (all before render)

- `npx hyperframes lint` with 0 errors. `studio_missing_editable_id` warnings are cosmetic; `gsap_repeated_fromto_without_baseline` is a real bug, fix it.
- `npx hyperframes check` passes (runtime, layout, motion, contrast).
- `npx hyperframes snapshot --at <each frame's midpoint>` and actually look at the contact sheet: dark text on dark ground, missing fonts (serif fallback), clipped cards or emoji tofu all show up there.
- No em dashes anywhere: on-screen text, script, storyboard. `grep -rn $'\u2014' compositions/ SCRIPT.md` must come back empty for on-screen strings.

## 5. Render and hand off

`npx hyperframes render --skill=faceless-explainer --quality high --output renders/video.mp4`, then `open renders/video.mp4` (Facu wants rendered videos opened automatically). Report: the MP4 path, its real duration (`ffprobe`), the frame list with ids (`compositions/frames/NN-*.html`) so he can ask for single-frame fixes, and anything skipped (no music, a voice mispronunciation, a fact that was left out because the source didn't have it).

## Reference files

- `references/drawn-style.md`: the default drawn look (metaphor, shared objects, self-drawing SVG, motion). Put its rules in the storyboard's style block and give workers one of `references/drawn-examples/*.html` as the reference frame.
- `references/drawn-examples/`: three working HyperFrames frames in the drawn style (1920x1080, dark brand), used as reference frames for workers.
- `references/setup.md`: first-run preflight that installs the HyperFrames skills and a local Kokoro voice if missing.
- `references/question-stage.md`: the exact shared spec for decision/step frames. Paste it into each of those workers' dispatch context.
- `references/gotchas.md`: every environment and pipeline fix, by workflow step, with the commands.
