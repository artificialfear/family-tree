# Graham & Harper Family Tree — handoff

Live site: https://artificialfear.github.io/family-tree/
A Thanksgiving 2026 gift for Mat's mom, Renee. Interactive illustrated family tree with story mode, map, timeline, sources, music, and shared family memories.

## How it's built
- `src/` is the source. **Edit these, never index.html.**
  - `src/index.html` — page shell with `<!--CSS-->` and `<!--JS-->` slots.
  - `src/css/*.css` — joined in name order (`main.css`, `tree-art.css`).
  - `src/js/*.js` — joined in name order inside one `{ … }` block: `00-family-data` (people, photos, events, story text), `01-core` (helpers, state), `02-chart`, `03-tree` (illustrated tree, sky, gestures, memory stars), `04-panel` (person panel, forms, help, poster), `05-music`, `06-story`, `07-cover`, `08-map-timeline`, `09-memories` (backend, passcode, voice recording/playback).
  - `src/mapdata.json` — map shapes (fills `__MAP__`). `src/api.txt` — Apps Script `/exec` URL (fills `__API__`; empty = memories off).
- `python3 build.py` rebuilds `index.html`. Run it after every change and commit the result. `--api URL --out FILE` builds a variant (tests use this).
- `photos/` — portraits (`p-<id>.jpg`), gallery photos, `drift/` cover photos, `qr.png` (points at the live site).
- `music.mp3` — background music (new track 2026-11-21, leading silence trimmed, fade-out ending removed). Plays an 18.2 s intro once, then loops samples 803,636–4,914,827 (93.2 s) counted from the first sound; `LOOP_START`/`LOOP_END` in `src/js/05-music.js`. The song has no exact repeat, so the loop point was chosen where harmony and texture match (≈18.6 s ↔ 111.8 s in the original) and a 2 s equal-power crossfade is baked into the file before the loop end, plus 2 s of post-loop audio as a safety tail.
- The old claude.ai artifact copy is retired; GitHub is the only source.

## Shared memories backend
- `backend/Code.gs` — Apps Script bound to a Google Sheet in Mat's **personal** Google account (mathew.t.graham@gmail.com).
  - Sheet tab `Memories`: one row per memory/photo/answer/correction/added relative/voice memory. Typing anything in `hidden` removes a row from the site. Missing header columns (e.g. `audio`) are appended automatically.
  - Drive folder `Family Tree Uploads`: photos are shared "anyone with link, view" (shown via drive.google.com/thumbnail). Voice recordings are **not** shared; the page fetches them through the script (`GET ?audio=<fileId>` → `{ok,mime,b64}`), which only serves files inside that folder. Max 6 MB per recording; the page caps recordings at 2 minutes.
  - Family passcode in Script Properties (`FAMILY_CODE`), set from the sheet menu Family Tree > Set family passcode. Not case-sensitive. `change-me` is never accepted.
- Reads (GET) are open; writes (POST, text/plain JSON, actions `check`/`add`/`del`) need the passcode. The page asks once per device and remembers it.
- Lockout: 5 wrong passcodes from one device, or 25 from everyone combined, locks writes for 15 minutes (CacheService). The page shows a "wait 15 minutes" message.
- Each device has a random id kept in its browser; the Sheet's `by` column stores only its SHA-256 hash, so the public hash can't be used to delete posts. Only the device holding the original id can remove its own posts. Mat moderates by editing the Sheet.
- The page re-checks for new memories every 90 s and when the tab regains focus.

## Tests
- `node tests/backend.test.js` — Code.gs with Apps Script mocks (incl. CacheService, computeDigest, Drive parents).
- `python3 tests/page_test.py` — builds `mock.html` against a fake backend and runs Playwright (Chrome with fake mic for voice recording). Doesn't touch index.html.

## Tree art
- Default look (2026-11-21): the **painted tree** on the original sky and planet — dense hand-painted leaf canopy (baked into the background picture), a broad shaded trunk that meets the planet, and names on small paper scroll banners. `painted()` in `03-tree.js` builds it; `?tree=classic` brings back the older ink-line tree; `?style=parch` is a parchment-paper variant Mat tried (not used).
- Leaf density: canopy loop skips 50% of candidate spots (`rnd()<.5`) — Mat asked for it thinner than the first mockup so memory stars show.
- Scroll labels that would overlap are nudged sideways (`LDX` in `drawLeafTree`).
- Grow animation: the baked canopy picture (`#tbackimg`) is revealed with a CSS `clip-path` circle that tracks the same radius as the SVG grow clip (`growTree`), and `#tback` stays visible during `.intro.growing`. Growth waits for the bake (`lastBake`, max 1.2 s).
- Memory stars sit inside the tree beside the person each memory is about (`#tmstars`, placed around the photo avoiding faces and labels), and grow when zoomed out (`--msk`) so they stay visible. If no free spot exists, the star falls back to the sky.

## Decisions Mat made
- Public site (GitHub Pages) so relatives need no account; family passcode (not per-post approval) for adding memories; noindex tags so search engines skip it.
- Grandkids and minors: photos + first names only, no birth years. Jacob (Jeff & David's son) added 2026-11-21 as a cousin. Other great-grandkids of Johnny & Annie Mae (Lilly(H), Madison, Lydia(H)) stay off for now.
- No sound effects. "passes away" instead of "dies". Ed and Renee are the largest faces.
- Default sky: automatic (sunset by day, night after dark); sun is fixed in the sky and lights the scene by its height.
- Living people: no birth dates beyond what Mat supplied.

## Open items
- Apps Script deployed (personal Gmail, project "Family Tree Memories Backend", bound to Sheet "Family Tree Memories" 1HkfTGciP1XuJdExkbUpby_ip1TJzKUZnhXYrVG5cml4). URL in src/api.txt. To update the backend: paste backend/Code.gs, then Deploy > Manage deployments > edit > New version (never "New deployment"). Version 2 (2026-11-21): hashed device ids, lockout, voice memories.
- Remaining "died"/"Died" wording not yet changed to "passed away"/"Passed" (Mat hasn't decided).
- Idea offered, not built: hometown markers glow during story chapters.
- The claude.ai artifact version (slug 3be5a35b-…) is retired and no longer updated.
- Mat to do a real end-to-end test with the passcode (memory, photo, voice) on iPhone and Android.
- Ideas offered, not built: email alert to Mat on new posts; a simple mode for older relatives.
