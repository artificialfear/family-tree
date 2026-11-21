# Graham & Harper Family Tree — handoff

Live site: https://artificialfear.github.io/family-tree/
A Thanksgiving 2026 gift for Mat's mom, Renee. Interactive illustrated family tree with story mode, map, timeline, sources, music, and shared family memories.

## How it's built
- `tools/source.html` — the full page source (single file, with a `__MAP__` placeholder). **Edit this, not index.html.**
- `tools/mapdata.json` — map shapes, inlined at build.
- `tools/make_gh.py` — turns the source into the GitHub Pages build: swaps the old claude.ai storage for the Apps Script backend, adds the family-passcode dialog and the no-index meta tags.
- `tools/api.txt` — the Apps Script web-app `/exec` URL (empty = memories switched off).
- `tools/build.sh` — rebuilds `index.html`. Run after every change.
- `photos/` — portraits (`p-<id>.jpg`), gallery photos, `drift/` cover photos, `qr.png` (points at the live site).
- `music.mp3` — gapless background loop (loop length is hard-coded in the page: 4,780,696 samples @ 44.1 kHz).

## Shared memories backend
- `backend/Code.gs` — Apps Script bound to a Google Sheet in Mat's **personal** Google account.
  - Sheet tab `Memories`: one row per memory/photo/answer/correction/added relative. Typing anything in `hidden` removes a row from the site.
  - Drive folder `Family Tree Uploads`: uploaded photos, shared "anyone with link, view" so the page can show them (via drive.google.com/thumbnail).
  - Family passcode in Script Properties (`FAMILY_CODE`), set from the sheet menu Family Tree > Set family passcode. Not case-sensitive. The placeholder `change-me` is never accepted.
- Reads (GET) are open; writes (POST, text/plain JSON) need the passcode. The page asks for it once per device and remembers it.
- Each device gets a random id; only that device can remove its own posts. Mat moderates by editing the Sheet.
- The page re-checks for new memories every 90 s and when the tab regains focus.

## Tests
- `node tests/backend.test.js` — Code.gs with Apps Script mocks.
- `python3 tests/page_test.py` — builds against a fake backend (needs `index.html` built with API `https://mock.test/exec`: `python3 tools/make_gh.py tools/source.html tools/mapdata.json https://mock.test/exec index.html`, then rebuild with build.sh before committing).

## Decisions Mat made
- Public site (GitHub Pages) so relatives need no account; family passcode (not per-post approval) for adding memories; noindex tags so search engines skip it.
- Grandkids: photos + first names only, no birth years. Johnny & Annie Mae's great-grandkids (Jacob, Lilly(H), Madison, Lydia(H)) stay off for now.
- No sound effects. "passes away" instead of "dies". Ed and Renee are the largest faces.
- Default sky: automatic (sunset by day, night after dark); sun is fixed in the sky and lights the scene by its height.
- Living people: no birth dates beyond what Mat supplied.

## Open items
- Mat to deploy the Apps Script and paste the /exec URL into tools/api.txt, then rebuild.
- Remaining "died"/"Died" wording not yet changed to "passed away"/"Passed" (Mat hasn't decided).
- Idea offered, not built: hometown markers glow during story chapters.
- The claude.ai artifact version (slug 3be5a35b-…) still exists as a private working copy.
