# plan-to-video

A Claude Code skill that turns a written plan into a narrated explainer video (MP4).

Give it a plan doc, a research note, a proposal or a list of open decisions. It writes a short story (hook, problem, proposal, how it works, one frame per decision with its options, closing ask), generates a local voiceover, builds each frame as an animated HTML composition, and renders a 1 to 3 minute 1920x1080 video.

<!-- Demo: replace this block once the demo is recorded.
[![plan-to-video demo](demo/preview.gif)](demo/plan-to-video-demo.mp4)
-->
**Demo:** coming soon, see [`demo/`](demo/).

It is a thin layer on top of [HyperFrames](https://github.com/heygen-com/hyperframes) by HeyGen and its `faceless-explainer` workflow. HyperFrames does the rendering; this skill adds:

- a brief with sensible defaults for plans, so it asks one or two questions instead of ten
- a story shape built for decisions, where each option appears on screen as the voice names it
- a shared "question stage" layout so every decision frame lines up as one list
- fixes for the steps that tend to break on a fresh machine: local voice setup, brand fonts, reveal timing, seek bugs

## Requirements

- [Claude Code](https://claude.com/claude-code) (or another agent that runs Agent Skills and sub-agents)
- The HyperFrames skills, including `faceless-explainer` (step 1 below)
- Node.js 20+, `ffmpeg` / `ffprobe`, Chrome
- Python 3.10+ for the local voice (a venv is set up for you, see below)
- No accounts. Everything runs locally by default.

Tested with `hyperframes` 0.8.171.

## Install

### 1. Install HyperFrames and the workflow this skill drives

```bash
npx skills add heygen-com/hyperframes          # pick "Core Skills"
npx hyperframes skills update faceless-explainer
```

### 2. Install this skill (pick one)

**Claude Code plugin marketplace**

```
/plugin marketplace add facundoexposito/plan-to-video
/plugin install plan-to-video@plan-to-video
```

As a plugin, the skill is namespaced: it triggers on its own from the description, or run it by hand as `/plan-to-video:plan-to-video`.

**skills CLI** ([vercel-labs/skills](https://github.com/vercel-labs/skills), works for Claude Code and other agents)

```bash
npx skills add facundoexposito/plan-to-video            # into the current project
npx skills add facundoexposito/plan-to-video -g -a claude-code   # for your user, Claude Code only
```

**Manual copy**

```bash
git clone https://github.com/facundoexposito/plan-to-video
cp -R plan-to-video/skills/plan-to-video ~/.claude/skills/
```

Installed this way it runs as `/plan-to-video`.

### 3. First run

Start a new Claude Code session so the skills load. On the first run the skill checks for the local voice and creates a Python venv at `~/.hyperframes-venv` with `kokoro-onnx` if it is missing (details in [`skills/plan-to-video/references/setup.md`](skills/plan-to-video/references/setup.md)). The first voice run downloads the Kokoro model, about 300 MB.

Optional settings:

| Variable | Default | What it does |
|---|---|---|
| `PLAN_TO_VIDEO_DIR` | `./videos` | where video projects are created |
| `HYPERFRAMES_VENV` | `~/.hyperframes-venv` | where the voice venv lives |
| `HYPERFRAMES_PYTHON` | the venv's python | use an existing Python that already has `kokoro-onnx` |

## Usage

Point it at a source and say who will watch:

- "Turn `docs/ROADMAP.md` into a video for the team."
- "Explain this research note as a 2 minute video. Audience: a non-technical client."
- "Make a decision video from these five open questions, mark the option we lean to on each."
- "Video of this migration plan, in our app's brand (colors and fonts from this repo)."

It confirms the defaults in one message (16:9, about 2 minutes, English male voice, no music, autonomous), builds everything, shows you the preview and asks "render now, or what changes?". You get `videos/<topic>/renders/video.mp4`, a contact sheet, and a list of frame files so you can ask for one frame to be fixed.

A run takes a while: frames are built in parallel by sub-agents, and the local render takes roughly 1.5x the video length.

Rules it follows: every number on screen must come from your source; nothing is invented. Anything in the source can end up on screen, so remove private data first.

The triggers are in English. To trigger it in another language, add your own phrases to the `description` in `SKILL.md`.

## How it works

1. **Brief.** Reads the source and proposes defaults (angle, aspect, length, voice, look) in one message. It asks at most who will watch and whether to mark a recommended option.
2. **Story.** Hook with a real number from the source, the problem, the proposal, the mechanism, a signpost, one frame per decision, a closing ask.
3. **Workflow.** Runs HyperFrames `faceless-explainer` Steps 0 to 6, applying the fixes in [`references/gotchas.md`](skills/plan-to-video/references/gotchas.md) at each step: init order, brand tokens, Kokoro via a venv, real word timings before scene design, staged fonts, one worker per frame.
4. **Quality gates.** `lint`, `check`, a contact sheet of every frame midpoint, and an optional house-style check on the spoken and on-screen text.
5. **Render.** After you approve the preview, a local MP4 render plus a hand-off with the duration and frame ids.

Repo layout:

```
.claude-plugin/
  plugin.json          plugin manifest
  marketplace.json     single-plugin marketplace (source "./")
skills/plan-to-video/
  SKILL.md             the skill
  references/          setup, question-stage layout, gotchas
scripts/validate.mjs   frontmatter and manifest checks
demo/                  demo video slot
```

## Validate

No CI and no dependencies. From the repo root:

```bash
node scripts/validate.mjs
```

It checks the `SKILL.md` frontmatter (`name` format and length, matches its folder, `description` present and at most 1024 characters), that every linked `references/` file exists, that both manifests parse and agree, and that no em dash slipped into the text. If you have Claude Code, `claude plugin validate .` checks the manifests too.

## Privacy and telemetry

- Voice and render run on your machine. Signing in to HeyGen (`npx hyperframes auth login`) is optional and enables HeyGen voices, music and cloud render under HeyGen's own terms.
- The HyperFrames CLI sends anonymous usage telemetry by default. Turn it off with `npx hyperframes telemetry disable` or `HYPERFRAMES_NO_TELEMETRY=1`.

## Credits and licenses

- **HyperFrames** by HeyGen: rendering, workflows, presets. Apache-2.0. https://github.com/heygen-com/hyperframes
- **Kokoro-82M** by hexgrad: the local voice model. Apache-2.0. https://huggingface.co/hexgrad/Kokoro-82M
- **kokoro-onnx** by thewh1teagle: the Python runtime for Kokoro. MIT. https://github.com/thewh1teagle/kokoro-onnx
- **GSAP**: the animation library inside the compositions. GSAP Standard License (free, including commercial use). https://gsap.com/standard-license/
- **Geist** and **Geist Mono** by Vercel: SIL Open Font License 1.1. https://github.com/vercel/geist-font. Not bundled here; listed because they are a common brand-font choice and OFL allows embedding them in renders. HyperFrames preset fonts ship with HyperFrames under OFL too. If you use other brand fonts, check that their license allows embedding.

This project is not affiliated with or endorsed by HeyGen. HyperFrames and HeyGen are their owners' names and marks.

This skill: MIT, see [`LICENSE`](LICENSE).
