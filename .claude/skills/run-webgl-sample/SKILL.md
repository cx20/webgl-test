---
name: run-webgl-sample
description: Launch any sample in this repo in a real browser and screenshot it to confirm it actually renders. Use when asked to run, open, verify, or screenshot a sample, when checking that a change or a library version bump still draws correctly, or when a sample is reported broken/blank. Covers all examples/<library>/<sample>/ directories.
---

# Running a WebGL sample from this repo

This repo is a **pure static site** — no `package.json`, no build step, no
dev server of its own. Every sample is `examples/<library>/<sample>/`
containing `index.html` + `index.js` + `style.css`, sharing `libs/` and
`assets/` at the repo root.

## Quick start

```bash
scripts/shoot.sh <outdir> <library/sample> [library/sample ...]
```

From the repo root, e.g.:

```bash
.claude/skills/run-webgl-sample/scripts/shoot.sh /tmp/shots \
  babylon-lite-gl/triangle babylon-lite-gl/teapot threejs/teapot
```

It serves the repo, screenshots each sample in headless Chrome with
software WebGL2, writes `<outdir>/<library>-<sample>.png`, and stops the
server again. Add `--console` as the first argument to also dump the
page's console errors — do that when a frame comes out blank.

Then **read the PNGs and look at them** — see "Judging the result" below.

## Why a plain `open index.html` does not work

- **`file://` fails.** Most samples use `<script type="module">` plus an
  `importmap` pointing at esm.sh. Module loading over `file://` fails on
  CORS and the page silently renders nothing. A static HTTP server is
  mandatory — and it must serve the **repo root**, not the sample
  directory, since samples reference `../../../libs/` and
  `../../../assets/`.
- **Headless Chrome has no GPU by default.** Without the ANGLE/SwiftShader
  flags, `getContext("webgl2")` returns null and you screenshot a blank
  canvas — which looks exactly like a broken sample.

## What the script does, and why

If you drive Chrome by hand instead of using the script, these are the
parts that matter:

- `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` —
  software WebGL2. Chrome refuses SwiftShader for WebGL without the
  `--enable-unsafe-swiftshader` opt-in; drop it and you get a blank canvas.
- `--virtual-time-budget=8000` — samples gate their first draw on async
  work: shader programs compile asynchronously (the babylon-lite-gl ones
  poll `isEffectReady` before building the VAO), textures load over HTTP,
  and animated samples need a few frames. A short budget screenshots an
  empty canvas.
- `--window-size=480,480` — canvases in this repo are `465x465`.
- On Windows, `--screenshot=` needs a **native** path. MSYS/Git Bash does
  not rewrite paths inside a `--flag=value` pair, so the script pipes it
  through `cygpath -w`.
- Stopping the server must be done **by listening port**, not by the pid
  from `$!`. On Windows the `python3.exe` Store alias spawns a separate
  real process, so killing the recorded pid leaves the server running and
  the next run silently reuses a stale server.

## Judging the result

Read each PNG with the Read tool and **look at it**. A blank canvas is the
standard failure mode and is indistinguishable from success unless you
view the image — the script prints `OK` for any sample that produced a
file, including a blank one. File size is a useful smoke signal (a solid
frame compresses to ~1-2 KB) but not a substitute for viewing.

Background color varies by sample — some clear to white, some to black
(`examples/threejs/teapot` is black). Both are correct; a *blank* frame
means no geometry, not a particular background. Animated samples (cube,
texture, teapot) are mid-rotation at capture time, so the exact angle
differs run to run — judge the shape and shading, not the orientation.

Reference for what the babylon-lite-gl set should look like:

| sample | expected |
|---|---|
| triangle | solid blue triangle on white |
| square | red/green/blue/yellow interpolated gradient quad |
| cube | solid red rotating cube |
| texture | rotating cube mapped with the tree-frog photo |
| teapot | Utah teapot with the gray `arroway.de_metal+structure` texture |

## Diagnosing a blank frame

Re-run with `--console`. Known causes, in rough order of likelihood:

- **`raw.githubusercontent.com` import.** Several older samples import a
  library straight from a raw GitHub URL. That host serves
  `Content-Type: text/plain` with `X-Content-Type-Options: nosniff`, so
  strict MIME checking refuses to execute it as a module and the page
  renders nothing:

  > Failed to load module script: Expected a JavaScript-or-Wasm module
  > script but the server responded with a MIME type of "text/plain".

  This breaks in **every** modern browser, not just headless —
  `examples/ogl/cube` is a confirmed instance. It is a pre-existing repo
  issue; do not attribute it to whatever you just changed. Fixing it means
  repointing the import at a proper CDN (esm.sh / jsDelivr / unpkg).
- **Missing SwiftShader flags**, if you are driving Chrome by hand.
- **Budget too short** — raise `--virtual-time-budget`.
- **A dead CDN version** in the `importmap`; the console shows a 404.

## Verifying a library version bump

When the change is a version bump in an `importmap` (e.g.
`@babylonjs/lite-gl@0.2.0` → `@1.4.0`), diff the published type
declarations *before* rendering — it tells you in seconds whether any API
the sample uses was removed or changed shape, and it explains any
breakage the screenshots reveal.

```bash
for v in 0.2.0 1.4.0; do
  curl -sL "https://registry.npmjs.org/@babylonjs/lite-gl/-/lite-gl-$v.tgz" -o "lg-$v.tgz"
  mkdir -p "v$v" && tar -xzf "lg-$v.tgz" -C "v$v"
done
```

Then compare the `export declare function` signatures across every
`*.d.ts` in `v<ver>/package/`, and intersect the removed/changed set with
the names the samples actually import (the `import { ... } from "<pkg>"`
list in each `index.js`). Only overlap matters — an upstream removal of
something no sample imports is a non-event.

Screenshots stay mandatory regardless: matching signatures do not prove
matching runtime behavior.

## Requirements

- Chrome, Chromium, or Edge. Auto-detected on Windows/macOS/Linux;
  override with `CHROME=/path/to/chrome`.
- `python3`, `python`, or `npx` to serve. Override the port with
  `PORT=9000`.
