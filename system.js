"use strict";
/**
 

*/

function find_matching_ids(cmps) {
  let ids = Object.keys(entities).map((id) => parseInt(id));
  for (let cmp of cmps) {
    ids = ids.filter((id) => EC[cmp.name].includes(id));
  }
  return ids;
}

function has_(id, cmp) {
  return EC[cmp.name].includes(id);
}

function for_components(cmps, cb) {
  let ids = find_matching_ids(cmps);
  for (let id of ids) {
    const e = entities[id];
    if (e == null || e == undefined) {
      // console.warn("Entity ", id, " not found")
      continue;
    }
    let components = cmps.map((cmp) => {
      return e[cmp.name];
    });
    cb(e, ...components);
  }
}

function maybe_ent(entity_id) {
  if (entity_id == null || entity_id == undefined) return null;
  return entities[entity_id];
}

function is_valid_entity(entity_id) {
  const e = maybe_ent(entity_id);
  if (e == null || e == undefined) {
    return false;
  }
  return true;
}

function to_ents(ids) {
  let ents = [];
  for (let id of ids) {
    const e = entities[id];
    if (e == null || e == undefined) {
      // console.warn("Entity ", id, " not found")
      continue;
    }
    ents.push(e);
  }
  return ents;
}

function find_closest_with_all(cmps, position, filter_fn) {
  let ids = find_matching_ids(cmps);
  let closest = null;
  for (let id of ids) {
    const e = entities[id];
    if (e == null || e == undefined) {
      // console.warn("Entity ", id, " not found")
      continue;
    }
    if (filter_fn && !filter_fn(e)) {
      continue;
    }
    if (closest == null) {
      closest = e;
      continue;
    }
    if (distance(position, e.pos) < distance(position, closest.pos)) {
      closest = e;
      continue;
    }
  }
  return closest;
}
function find_closest_with(cmp, position, filter_fn) {
  return find_closest_with_all([cmp], position, filter_fn);
}

function find_all_with(cmps, filter_fn) {
  let ids = find_matching_ids(cmps);
  let closest = null;
  let ents = [];
  for (let id of ids) {
    const e = entities[id];
    if (e == null || e == undefined) {
      // console.warn("Entity ", id, " not found")
      continue;
    }
    if (filter_fn && !filter_fn(e)) {
      continue;
    }
    ents.push(e);
  }
  return ents;
}

function audit_storage() {
  let holders = {};
  for_components([CT.HoldsOre, CT.IsTarget], (entity, ho) => {
    if (ho.type == null) return;
    if (!(ho.type in holders)) holders[ho.type] = 0;
    holders[ho.type] += ho.amount;
  });
  return holders;
}

function count_entities_with(cmp) {
  let ids = to_ents(find_matching_ids([cmp]));
  return ids.length;
}

function mouseInsideRect(pos, rectRenderer) {
  if (mouseX > pos.x && mouseX < pos.x + rectRenderer.w) {
    if (mouseY > pos.y && mouseY < pos.y + rectRenderer.h) {
      return true;
    }
  }
  return false;
}

function amount_in_storage(ore_type) {
  const in_storage = audit_storage();
  if (ore_type in in_storage) return in_storage[ore_type];
  return 0;
}

// Renderer system

function render_circles() {
  for_components([CT.CircleRenderer], (entity) => {
    push();
    if (has_(entity.id, CT.HasAbsolutePosition)) {
      scale(1 / map_info.zoomLevel);
    }
    fill(255, 255, 255, 255);
    translate(entity.pos.x, entity.pos.y);
    circle(0, 0, PSIZE);
    pop();
  });
}

function render_squares() {
  for_components([CT.SquareRenderer], (entity) => {
    push();
    if (has_(entity.id, CT.HasAbsolutePosition)) {
      scale(1 / map_info.zoomLevel);
    }
    fill(255, 255, 255, 255);
    translate(entity.pos.x, entity.pos.y);
    rect(0, 0, PSIZE, PSIZE);
    pop();
  });
}

function get_rect_color(entity) {
  if (
    has_(entity.id, CT.HasClickInteraction) &&
    entity.HasClickInteraction.validator
  ) {
    if (!entity.HasClickInteraction.validator(entity)) {
      return color(100, 100, 100, 255);
    }
  }

  // TODO move hover color into here

  if (has_(entity.id, CT.RectRenderer)) {
    return entity.RectRenderer.color;
  }

  return color(0, 0, 0, 255);
}

function render_rect() {
  for_components([CT.RectRenderer], (entity, rr) => {
    push();
    if (has_(entity.id, CT.HasAbsolutePosition)) {
      scale(1 / map_info.zoomLevel);
      translate(-map_info.center[0], -map_info.center[1]);
    }
    fill(get_rect_color(entity));
    translate(entity.pos.x, entity.pos.y);
    rect(0, 0, rr.w, rr.h);
    pop();
  });
}

function render_labels() {
  for_components([CT.HasLabel], (entity) => {
    if (!entity.HasLabel.active) return;
    push();

    fill(255);
    textSize(5);

    if (has_(entity.id, CT.HasAbsolutePosition)) {
      scale(1 / map_info.zoomLevel);
      translate(-map_info.center[0], -map_info.center[1]);
    }

    const has_rect_background = has_(entity.id, CT.RectRenderer);
    const background_color = get_rect_color(entity);

    if (entity.HasLabel.is_dynamic) {
      entity.HasLabel.text = entity.HasLabel.get_text();
    }

    translate(entity.pos.x, entity.pos.y);

    switch (entity.HasLabel.location) {
      case RectLocation.TopLeft:
        break;
      case RectLocation.Center:
        fill(...inverseColor(...background_color.levels));
        if (has_rect_background) {
          const rr = entity.RectRenderer;
          const tx = textWidth(entity.HasLabel.text);
          const ty = textHeight(entity.HasLabel.text ?? "");
          const xs = (rr.w - tx) / 2;
          const ys = (rr.h - ty) / 2;
          translate(xs, ys);
        }
        break;
    }
    text("" + entity.HasLabel.text, 0, 0);
    pop();
  });
}

// end renderer system
