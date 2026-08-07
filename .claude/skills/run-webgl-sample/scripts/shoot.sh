#!/usr/bin/env bash
# Screenshot one or more samples from this repo in a real browser.
#
#   scripts/shoot.sh <outdir> <library/sample> [library/sample ...]
#   scripts/shoot.sh --console <outdir> <library/sample>   # also dump page console errors
#
# Starts a static server on the repo root, drives headless Chrome with
# software WebGL2, writes <outdir>/<library>-<sample>.png, then stops the
# server. Reuses an already-running server on the same port if it finds one.
set -euo pipefail

PORT="${PORT:-8899}"
CONSOLE=0
if [ "${1:-}" = "--console" ]; then CONSOLE=1; shift; fi

OUT="${1:?usage: shoot.sh [--console] <outdir> <library/sample>...}"; shift
[ "$#" -gt 0 ] || { echo "no samples given" >&2; exit 2; }

ROOT="$(git rev-parse --show-toplevel)"
mkdir -p "$OUT"

# Chrome must be a real Chromium build: Firefox/Safari can't take --screenshot.
CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for c in \
    "/c/Program Files/Google/Chrome/Application/chrome.exe" \
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
    "/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    google-chrome google-chrome-stable chromium chromium-browser
  do
    if [ -x "$c" ]; then CHROME="$c"; break; fi
    if command -v "$c" > /dev/null 2>&1; then CHROME="$(command -v "$c")"; break; fi
  done
fi
[ -n "$CHROME" ] || { echo "Chrome/Chromium not found; set CHROME=/path/to/chrome" >&2; exit 1; }

# Kill by listening port, not by the pid we recorded. On Windows the pid
# from $! is often a launcher that outlives nothing useful -- the
# python3.exe Store alias, for one, spawns a separate real process, so
# killing the recorded pid leaves the server running.
kill_port() {
  if command -v lsof > /dev/null 2>&1; then
    lsof -ti "tcp:$1" 2>/dev/null | while read -r p; do kill "$p" 2>/dev/null || true; done
  fi
  if command -v taskkill > /dev/null 2>&1; then
    netstat -ano 2>/dev/null | grep -i listening | grep ":$1 " | awk '{print $NF}' | sort -u |
      while read -r p; do taskkill //F //T //PID "$p" > /dev/null 2>&1 || true; done
  fi
}

started=0
if ! curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then
  if command -v python3 > /dev/null 2>&1; then SERVE=(python3 -m http.server "$PORT" --bind 127.0.0.1)
  elif command -v python > /dev/null 2>&1; then SERVE=(python -m http.server "$PORT" --bind 127.0.0.1)
  elif command -v npx > /dev/null 2>&1; then SERVE=(npx --yes http-server -p "$PORT" -a 127.0.0.1 -c-1)
  else echo "need python3, python or npx to serve" >&2; exit 1; fi
  ( cd "$ROOT" && "${SERVE[@]}" > /dev/null 2>&1 & echo $! > "$OUT/.server.pid" )
  started=1
  for _ in $(seq 40); do
    curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null && break
    sleep 0.25
  done
fi
cleanup() {
  if [ "$started" = 1 ]; then
    [ -f "$OUT/.server.pid" ] && kill "$(cat "$OUT/.server.pid")" 2>/dev/null
    kill_port "$PORT"
    rm -f "$OUT/.server.pid"
  fi
}
trap cleanup EXIT

# On Windows, Chrome is a native binary and needs a native path for
# --screenshot; MSYS does not rewrite it for us inside a --flag=value pair.
winpath() { if command -v cygpath > /dev/null 2>&1; then cygpath -w "$1"; else printf '%s' "$1"; fi; }

status=0
for s in "$@"; do
  name="${s//\//-}"
  png="$OUT/$name.png"
  url="http://127.0.0.1:$PORT/examples/$s/index.html"
  code="$(curl -s -o /dev/null -w '%{http_code}' "$url")"
  if [ "$code" != "200" ]; then
    echo "MISSING  $s (HTTP $code)"; status=1; continue
  fi
  logs=()
  [ "$CONSOLE" = 1 ] && logs=(--enable-logging=stderr --log-level=0)
  "$CHROME" --headless=new --disable-gpu-sandbox \
    --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader \
    --hide-scrollbars --window-size=480,480 --virtual-time-budget=8000 \
    "${logs[@]}" --screenshot="$(winpath "$png")" "$url" 2> "$OUT/$name.log" || true
  if [ -s "$png" ]; then
    echo "OK       $s -> $png ($(wc -c < "$png" | tr -d ' ') bytes)"
  else
    echo "FAILED   $s (no image written)"; status=1
  fi
  if [ "$CONSOLE" = 1 ]; then
    grep -E "CONSOLE|ERROR|Refused|MIME" "$OUT/$name.log" || echo "         (no console errors)"
  fi
done

echo
echo "Now LOOK at the PNGs. A blank frame is the standard failure mode and"
echo "is indistinguishable from success unless you view the image."
exit "$status"
