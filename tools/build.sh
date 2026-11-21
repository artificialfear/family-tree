#!/bin/sh
# Rebuild index.html from the source page. The Apps Script /exec URL lives in tools/api.txt.
cd "$(dirname "$0")/.." && python3 tools/make_gh.py tools/source.html tools/mapdata.json "$(cat tools/api.txt | tr -d '[:space:]')" index.html
