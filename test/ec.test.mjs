import test from "node:test"; import assert from "node:assert/strict"; import {loadMine} from "./harness.mjs";
test("remove_entity removes id from every EC list (regression d371039/cbfff84)",()=>{
  const m=loadMine(); m.make_ore(0,0); m.make_ore(1,1); const id=Object.keys(globalThis.entities||{}); // entities live in vm global, check via counts
  assert.equal(m.count_entities_with(m.CT.IsOre),2); m.remove_entity(0); assert.equal(m.count_entities_with(m.CT.IsOre),1);
  assert.ok(!m.EC.IsOre.includes(0) && !m.EC.CircleRenderer.includes(0));
});
test("find_matching_ids is AND not OR (regression f3bbca0)",()=>{ const m=loadMine(); m.make_ore(0,0); m.make_ship(5,5); assert.deepEqual(m.find_matching_ids([m.CT.IsOre,m.CT.IsTarget]),[0]); });
