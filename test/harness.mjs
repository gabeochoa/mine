import fs from "node:fs"; import vm from "node:vm";
export function loadMine(extra=[]){
  const ctx={console,Math,JSON,Object,Array,parseInt};
  ctx.globalThis=ctx; ctx.entities={};
  ctx.createVector=(x=0,y=0)=>({x,y,add(v){this.x+=v.x;this.y+=v.y;return this},mult(){return this},normalize(){return this}});
  ctx.color=(...a)=>({levels:[255]}); ctx.PI=Math.PI; ctx.cos=Math.cos; ctx.sin=Math.sin; ctx.dist=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
  vm.createContext(ctx);
  for(const f of ["ec.js","entity_makers.js","system.js",...extra]) vm.runInContext(fs.readFileSync(new URL("../"+f,import.meta.url),"utf8"),ctx,{filename:f});
  vm.runInContext("globalThis.__mine={EC,CT,remove_entity,find_matching_ids,count_entities_with,make_ore,make_ship}",ctx);
  return ctx.__mine;
}
