# Correct rules — mine
| # | Rule | Enforced by |
|---|---|---|
| 1 | EC lists hold ids; only `remove_entity` mutates them, in place | `test/ec.test.mjs` |
| 2 | No implicit globals — every file starts `"use strict";`, declare with const/let | strict runtime + `test/strict.test.mjs` |
| 3 | Prices live only in frozen `CONFIG`; label, validator and deduction all read it, deduction only via `spend_ore` | `test/cost.test.mjs` |
| 4 | `find_*` returns entity-or-null and matches ALL components (AND) | `test/ec.test.mjs` |
Run: `npm test`
