import test from "node:test"; import assert from "node:assert/strict"; import {loadMine} from "./harness.mjs";
test("strict mode: makers/query helpers run without implicit globals",()=>{ const m=loadMine(); m.make_ore(0,0); m.make_ship(1,1); assert.equal(m.count_entities_with(m.CT.IsOre),1); });
test("past mistake reproduces under strict: undeclared assignment throws",async()=>{ const vm=await import("node:vm"); const ctx={}; vm.createContext(ctx); assert.throws(()=>vm.runInContext('"use strict"; e = 1',ctx),/e is not defined/); });
