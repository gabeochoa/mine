# /correct — mine
Trivial repo (43 commits, ~600 LOC own JS + vendored p5): honest scope — only 3 classes happened twice; no CI/lint existed at all.

## Classes + evidence
1. **id-vs-entity / broken removal** — `cbfff84` id/ent, `d371039` wrong thing deleted, `f3bbca0` AND-vs-OR, self-check in `setup()`. Root: `remove_entity` filtered `e.id` on number ids and reassigned a local, deleting nothing. Level: architecture (fix the one mutator) + behaviour test. Why not docs: the next agent copies `remove_entity`.
2. **Implicit globals** — `e=` in every maker, `target=`/`i=`/`background_color=` across sketch/system (leaks, cross-call clobber). Level: language (`"use strict";` in all own files) — makes the mistake throw, not a style note.
3. **Price drift** — `8c1e2df` "not using SPAWN COST everywhere" (literal 5), speed button kept literal 15 in label+validator and never deducted. Level: architecture — frozen `CONFIG` + single `spend_ore()`; label/validator/deduction read the same value.

## Commits (local)
- `10854e5` fix remove_entity to mutate EC id lists
- `796ebd2` add strict mode and declare former implicit globals
- 1859fce-era cost commit (this commit) single-source CONFIG + spend_ore

## Proof checks fail on past mistakes
`npm test` (node:test, p5 stubbed): on pre-fix `ec.js` the removal test fails (`EC.IsOre` still contains 0); strict test shows undeclared assignment throws; cost test rejects literal `15`/`(15 iron)` in sketch.js. Vendored `p5*.js` untouched.
