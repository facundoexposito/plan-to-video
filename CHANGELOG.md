# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.1] - 2026-10-18

Fixes found by a real test run (the demo video).

### Added

- Demo video `demo/plan-to-video-demo.mp4` and a 12 s `demo/preview.gif` at the top of the README.
- Breathing room step: after `sync-durations`, pad the final frame (+2 to 3 s) and signpost or breather frames (+1 s) in `STORYBOARD.md` before building packets.
- Caption word check: correct misheard words in `audio_meta.json` against `SCRIPT.md` before captions are built.
- Recommended option rule for decisions with no single winner or several supported options, defaulting to the skill's own defaults when the source is silent.

### Changed

- Default length is now consistent everywhere: about 60 to 90 s for social posts, 2 to 2.5 min for a real plan with several decisions.
- Preflight runs `doctor` and `auth status` with the `HYPERFRAMES_PYTHON=` prefix, so Kokoro is not reported missing.
- Headings use colons (`## Frame 1: Hook`); the long dash exception is gone and the no em dash rule applies everywhere.
- Brand fonts are staged in `assets/fonts/` before `build-frame.mjs`, which then writes the `@font-face` block. Font sources listed generically.
- Worker dispatch context now includes the storyboard's Video direction and the frame's full word timings.
- Dark-ground inversion also replaces glyphs the embedded font may lack and a preset accent that belongs to another brand.
- `gsap_repeated_fromto_without_baseline` fix: per-word tweens get one id per word instead of `immediateRender: false`.
- The Studio preview question is skipped when the user asked for a one-shot render.

## [0.1.0] - 2026-10-18

### Added

- `plan-to-video` skill: brief defaults for plans, a story shape built around open decisions, and step-by-step patches for the HyperFrames `faceless-explainer` workflow.
- `references/setup.md`: fresh-machine install and preflight (HyperFrames skills, Kokoro voice venv, ffmpeg, Chrome).
- `references/question-stage.md`: shared layout spec for decision and step frames.
- `references/gotchas.md`: pipeline fixes by workflow step.
- Plugin marketplace manifests, so the repo installs with `/plugin marketplace add`, `npx skills add`, or a manual copy.
- `scripts/validate.mjs`: dependency-free check of the SKILL.md frontmatter and manifests.

Tested with `hyperframes` 0.8.171.
