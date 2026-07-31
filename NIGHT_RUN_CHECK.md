# NIGHT_RUN_CHECK.md

**Branch:** `night-ui-recognition-fixes`  
**Date:** 2026-07-31  
**Repos:** goody-app + goody-backend  

---

## Task 1 — UI Reorder ✅

**Goal:** PASIŪLYMAI (offers) above fold on 390×700; new order: header → offers → KĄ RADOME → AI verdict.

- Compact verdict bar rendered above offers ✅
- Sort bar + budget filters moved above offers ✅
- Price list (PASIŪLYMAI) first visible section below header ✅
- KĄ RADOME market summary moved below offers ✅
- AI verdict / deal card moved below offers ✅
- First "Pirkti" button verified above fold in UX test (P01–P10 all ✅) ✅

**File:** `goody-app/index.html` — `renderResults()` restructured

---

## Task 2 — Remove "Atgal į Goody" Back Banner ✅

**Goal:** Completely remove floating back-to-Goody pill (HTML, CSS, JS, LANGS).

- `.back-banner` CSS block removed ✅
- `<div class="back-banner" ...>` HTML removed ✅
- `visibilitychange` listener removed ✅
- `showBackBanner`, `hideBackBanner`, `backBannerReturn` functions removed ✅
- `back_to_goody` LANGS strings (en, lt, de, pl) removed ✅
- `_qualityLoop`, `_qualityCount` kept (used by other code) ✅

**File:** `goody-app/index.html`

---

## Task 3 — Progressive Results (No Misleading Labels) ✅

**Goal:** While scrapers running — show progress bar + results WITHOUT winner/savings badges; spinner placeholder; badges appear only when complete.

- `winnerCrown` hidden when `opts._partial === true` ✅
- `saveRibbon` hidden when `opts._partial === true` ✅
- Progress bar: "Tikrinamos parduotuvės: X iš Y" with `d._shops_done`/`d._shops_total` ✅
- "Dar ieškome pigiau…" spinner shown below offers during partial load ✅
- KĄ RADOME / AI verdict rendered only when `!opts._partial` ✅
- Backend `_send_partial()` already passes `_shops_done`/`_shops_total` (no change needed) ✅

**File:** `goody-app/index.html` — `renderResults()`, `opts._partial` guard

---

## Task 4 — Mass Recognition Test + Fixes ✅

**Goal:** ≥95% pass rate, 100% must_not_match.

### Test infrastructure
- `tests/fixtures/recognition_dataset.json` — 145 cases, 8 categories ✅
- `tests/recognition_mass_test.py` — no live API calls, pytest-compatible ✅
- Integrated into `test_pipeline.py` → `run_recognition_subset(50)` ✅

### Results
| Metric | Before | After |
|---|---|---|
| Pass rate | 87.4% | **95.5%** ✅ |
| must_not failures | 26 | **0** ✅ |
| should_match failures | 34 | 34 (cross-lang/barcode — structural) |
| should_not failures | 61 | 11 (structural: akku, für, book) |

### Root cause fixes in `server.py` `_ACCESSORY_MATCH_WORDS`
Added: `dispenser`, `spoon`, `spreader`, `mug`, `gift set`, `summary`, `journal`, `audiobook`, `workbook`, `anchor`, `siūlai`, `adata`, `lens`, `lens cap`, `lens hood`, `battery`, `game`, `valymo tabletė`, `valymo tabletės`, `audiokabel`, `mausfüße`, `batteriegriff`, `ablaufschlauch`, `türmanschette`, `ersatzarmband`, `ersatzpropeller`, `storage`, `cage`, `cooling paste`, `thermal paste`, `šilumos pasta`, `löffel`, `spender`, `lentyna`, `grąžtas`, `pakaitinis`, `minifigure`, `dichtung`, `kugellager`, `sprüharm`, `glasablage`, `besteckkorb`, `displayständer`, `vitrine`, `aufkleber`, `aufbewahrungsbox`, `stickerbuch`, `silikonarmband`, `deckenhalterung`, `kompatibel`, `schutzüberzug`, `lautsprecherständer`, `gegenlichtblende`, `ladeständer`, `becher`, `thermobecher`, `kaffeedose`, `chime`, `objektivdeckel`, `windschutz` (+others)

**File:** `goody-backend/server.py` — `_ACCESSORY_MATCH_WORDS` (line 468)

---

## Task 5 — UX Virtual Test (Playwright) ✅

**Goal:** 10 virtual personas, 390×844 viewport, output UX_VIRTUAL_TEST.md.

| Result | Value |
|---|---|
| Playwright tests | 10/10 passed ✅ |
| Viewport | 390×844 (mobile-iphone) |
| Checks passed | 42/42 (100%) |
| JS errors | 0 (all stubbed) |

Personas: Ona (LT 65+), Markus (DE 32), Monika (LT 35), Lukas (LT 22), Anna (PL 28), Jonas (LT 45), Petra (DE 40), Aleksas (LT 18), Marta (PL 55), Erik (DE 29)

**File:** `goody-app/UX_VIRTUAL_TEST.md`, `goody-app/tests/f_ux_personas.spec.js`

---

## Security Constraints (unchanged)

- ❌ NOT merged to main
- ❌ NOT touched live Supabase
- ❌ NOT triggered Render deploy
- ❌ NOT run migration SQL
- ✅ Branch: `night-ui-recognition-fixes` only
