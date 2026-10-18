# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-10-18

### Added

- `plan-to-video` skill: brief defaults for plans, a story shape built around open decisions, and step-by-step patches for the HyperFrames `faceless-explainer` workflow.
- `references/setup.md`: fresh-machine install and preflight (HyperFrames skills, Kokoro voice venv, ffmpeg, Chrome).
- `references/question-stage.md`: shared layout spec for decision and step frames.
- `references/gotchas.md`: pipeline fixes by workflow step.
- Plugin marketplace manifests, so the repo installs with `/plugin marketplace add`, `npx skills add`, or a manual copy.
- `scripts/validate.mjs`: dependency-free check of the SKILL.md frontmatter and manifests.

Tested with `hyperframes` 0.8.171.
