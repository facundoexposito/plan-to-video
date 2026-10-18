# Setup and preflight

Run this once per machine, and the preflight at the start of every run. Nothing here renders anything.

## Requirements

- Node.js 20 or newer (`npx` available).
- `ffmpeg` and `ffprobe` on PATH.
- Chrome for headless rendering. `npx hyperframes browser --help` manages it; `npx hyperframes doctor` reports what is missing.
- Python 3.10 or newer for local Kokoro voice, in a venv (see below).
- Optional: `uv` (faster venv setup), `espeak-ng` (only for non-English Kokoro voices).
- An agent that can run sub-agents in parallel (Claude Code does). Without it, frames build one by one.

## 1. Install the HyperFrames skills

HyperFrames is open source by HeyGen (Apache-2.0): https://github.com/heygen-com/hyperframes, docs https://hyperframes.heygen.com.

```bash
npx skills add heygen-com/hyperframes          # interactive: pick "Core Skills"
npx hyperframes skills update faceless-explainer   # adds the workflow this skill drives
npx hyperframes skills check                   # confirm everything is current
```

Start a new agent session afterwards so the skills are loaded. If you use the HyperFrames plugin instead, follow its own install and update rules.

## 2. Find the installed skill folders

Skills can live in the user folder or the project folder depending on how they were installed. Resolve once:

```bash
for d in ./.claude/skills ~/.claude/skills ./.agents/skills ~/.agents/skills; do
  [ -f "$d/faceless-explainer/SKILL.md" ] && FE_DIR="$d/faceless-explainer" && MEDIA_DIR="$d/media-use" && break
done
echo "FE_DIR=$FE_DIR MEDIA_DIR=$MEDIA_DIR"
```

If nothing is found, step 1 did not finish. Do not guess paths.

## 3. Local voice (Kokoro) in a venv

Kokoro needs `kokoro-onnx` and `soundfile`. Two things commonly block it: the system Python is managed (PEP 668 refuses `pip install`), or it is newer than the versions `kokoro-onnx` and `onnxruntime` publish wheels for. A dedicated venv on a known-good version (3.12 has worked) avoids both. The HyperFrames audio engine reads the `HYPERFRAMES_PYTHON` variable to find it.

```bash
VENV="${HYPERFRAMES_VENV:-$HOME/.hyperframes-venv}"
if ! "$VENV/bin/python" -c "import kokoro_onnx, soundfile" 2>/dev/null; then
  rm -rf "$VENV"
  if command -v uv >/dev/null; then
    uv venv -q --python 3.12 "$VENV" && VIRTUAL_ENV="$VENV" uv pip install -q kokoro-onnx soundfile
  else
    python3.12 -m venv "$VENV" && "$VENV/bin/pip" install -q kokoro-onnx soundfile
  fi
fi
export HYPERFRAMES_PYTHON="$VENV/bin/python"
```

On Windows the interpreter is `$VENV\Scripts\python.exe`.

The first TTS run downloads the Kokoro-82M model (about 300 MB) into `~/.cache/hyperframes/`.

Optional: `npx hyperframes auth login` signs in to HeyGen for its voices and music library. Using it means HeyGen's own terms and usage limits apply. Not needed for this skill.

## 4. Preflight (every run)

```bash
npx hyperframes --version
npx hyperframes doctor
npx hyperframes auth status      # signed out is fine, Kokoro is the fallback
"$HYPERFRAMES_PYTHON" -c "import kokoro_onnx, soundfile; print('kokoro ok')"
```

Telemetry: the CLI sends anonymous usage data by default. `npx hyperframes telemetry disable` (or `HYPERFRAMES_NO_TELEMETRY=1` / `DO_NOT_TRACK=1`) turns it off. Tell the user once if they have not chosen.
