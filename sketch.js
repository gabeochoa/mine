"use strict";
const PSIZE = 10;
let entities = {};

let SHIP_STORAGE = 1;
let SPEED = 0.75;

let ticks = 0;

let spawn_radius = 0;
let NUM_SPAWNED = 10;
let SPAWN_ORE_COST = 5;

let map_info = {
  zoomLevel: 1,
  center: [0, 0],
};

function setup() {
  frameRate(60);
  let cnv = createCanvas(400, 300);
  cnv.mouseWheel(mouseScrolled);

  spawn_radius = width / 2;
  //

  make_ore(width / 4, height / 4);
  remove_entity(0);

  make_ore(width / 4, height / 4);
  make_ship(width / 2, height / 2);

  make_ship(width / 4, height / 2);
  make_drop(width / 6, height / 6, PSIZE * 2, PSIZE * 2, OreType.Iron);

  //
  print(EC);
  print(entities);

  if (count_entities_with(CT.IsOre) != 1) {
    console.error("remove isnt working", count_entities_with(CT.IsOre));
  }

  spawn_N_ore();

  const BUTTON_WIDTH = 50;
  const BUTTON_HEIGHT = 20;
  const BUTTON_PADDING = 10;
  make_dynamic_button({
    x: width - BUTTON_WIDTH - BUTTON_PADDING,
    y: BUTTON_PADDING,
    w: BUTTON_WIDTH,
    h: BUTTON_HEIGHT,
    label: () => {
      return "spawn " + NUM_SPAWNED + " ore\n(" + SPAWN_ORE_COST + " iron)";
    },
    onClick: () => {
      const iron_holders = find_all_with(
        [CT.HoldsOre, CT.IsTarget],
        (entity) => {
          return entity.HoldsOre.type == OreType.Iron;
        }
      );
      let i = SPAWN_ORE_COST;
      for (let iron_holder of iron_holders) {
        i = i - iron_holder.HoldsOre.amount;
        iron_holder.HoldsOre.amount = 0;
        if (i <= 0) {
          iron_holder.HoldsOre.amount += -i;
          break;
        }
      }
      spawn_N_ore();
    },
    onHoverStart: (_entity) => {},
    onHoverEnd: (_entity) => {},
    validationFunction: (_entity) => {
      return amount_in_storage(OreType.Iron) >= SPAWN_ORE_COST;
    },
  });
  make_button({
    x: width - BUTTON_WIDTH - BUTTON_PADDING,
    y: BUTTON_HEIGHT + BUTTON_PADDING + BUTTON_PADDING,
    w: BUTTON_WIDTH,
    h: BUTTON_HEIGHT,
    label: "speed up ship\n(15 iron)",
    onClick: () => {
      if (SPEED > 3.9) return;
      SPEED += 0.1;
      console.log("new speed is ", SPEED);
    },
    onHoverStart: (_entity) => {},
    onHoverEnd: (_entity) => {},
    validationFunction: () => {
      return amount_in_storage(OreType.Iron) >= 15;
    },
  });

  make_label(10, 10, () => {
    return "num ents " + Object.keys(entities).length;
  });

  make_label_list(10, 20, () => {
    // calculate + render_holders
    let holders = audit_storage();
    let texts = [];
    for (let k of Object.keys(holders)) {
      texts.push("" + k + ": " + holders[k]);
    }
    return texts.join("\n");
  });
}

function spawn_N_ore() {
  let i = 0;
  while (i < NUM_SPAWNED) {
    // console.log("spawning a new ore")

    let rad = (spawn_radius / 2) * Math.random();
    let angle = 2 * PI * Math.random();
    make_ore(
      width / 2 + Math.floor(cos(angle) * rad),
      height / 2 + Math.floor(sin(angle) * rad)
    );
    i++;
  }
  spawn_radius += 75;
  NUM_SPAWNED = Math.round(NUM_SPAWNED * 1.2);
}

function on_second_tick() {}

function tick() {
  ticks += 1;
  if (ticks >= 60) {
    ticks -= 60;
    on_second_tick();
  }

  // find cloest ore
  for_components([CT.HasTarget, CT.HoldsOre], (entity, ht, ho) => {
    if (ho.amount >= SHIP_STORAGE) return;
    if (ht.target_id != null) return;
    let match = find_closest_with_all(
      [CT.IsOre, CT.IsTarget],
      entity.pos,
      (e) => {
        if (ho.amount == 0) return true;
        if (is_valid_entity(e.IsTarget.parent_id)) {
          return;
        }
        return ho.type == e.IsOre.type;
      }
    );
    if (match == null) return;
    ht.target_id = match.id;
    match.IsTarget.parent_id = entity.id;
  });

  // find drop off for ore
  for_components([CT.HasTarget, CT.HoldsOre], (entity, ht, ho) => {
    if (ho.amount == 0) return;
    if (ht.target_id != null) return;
    let match = find_closest_with_all(
      [CT.HoldsOre, CT.IsDropoff],
      entity.pos,
      (e) => {
        return ho.type == e.HoldsOre.type;
      }
    );
    if (match == null) {
      return;
    }
    ht.target_id = match.id;
    match.IsTarget.parent_id = entity.id;
  });

  // move to target if one exists
  for_components([CT.HasTarget], (entity, ht) => {
    if (ht.target_id == null) return;
    const target = entities[ht.target_id];
    if (target == null) {
      ht.target_id = null;
      return;
    }

    let direction = v_sub(target.pos, entity.pos).normalize().mult(SPEED);
    entity.pos.add(direction);
  });

  // pick up object
  // drop off object
  for_components([CT.HasTarget, CT.HoldsOre], (entity, ht, ho) => {
    if (ht.target_id == null) return;
    const target = entities[ht.target_id];
    if (target == null) {
      ht.target_id = null;
      return;
    }
    if (distance(entity.pos, target.pos) > 2) return;

    if (has_(target.id, CT.IsOre)) {
      if (ho.type != null && ho.type != target.IsOre.type) return;

      ho.type = target.IsOre.type;
      ho.amount += 1;
      remove_entity(target.id);
      //   console.log(entity.id, "Picked up", ho.type);
    }

    if (has_(target.id, CT.IsDropoff)) {
      if (ho.type != null && ho.type != target.HoldsOre.type) return;
      target.HoldsOre.amount += ho.amount;
      //   console.log("Dropped off ", ho.type, "now has", target.HoldsOre.amount);
      ho.amount = 0;
      ho.type = null;
    }

    ht.target_id = null;

    return;
  });

  // process accel
  for_components([CT.HasVelocity], (entity, hv) => {
    entity.pos.add(hv.vel);
  });
}

function mouseScrolled(event) {
  if (event.deltaY > 0) {
    map_info.zoomLevel -= 0.01;
  } else if (event.deltaY < 0) {
    map_info.zoomLevel += 0.01;
  }
}

function mouseMoved() {
  for_components([CT.HasHoverInteraction], (entity, interaction) => {
    if (mouseInsideRect(entity.pos, entity.RectRenderer)) {
      interaction.active = true;
      interaction.onStart(entity);
    } else {
      if (interaction.active == true) {
        interaction.onEnd(entity);
        interaction.active = false;
      }
    }
  });
}

function mouseDragged(event) {
  // Code to run that uses the event.
  if (mouseButton == "center" || mouseButton == "right") {
    map_info.center = [
      map_info.center[0] + movedX / 2,
      map_info.center[1] + movedY / 2,
    ];
  }
}

function mouseClicked(event) {
  for_components([CT.HasClickInteraction], (entity, interaction) => {
    if (mouseInsideRect(entity.pos, entity.RectRenderer)) {
      interaction.callback(entity);
    }
  });
}

function arrowKeymapMovement() {
  const map_speed = keyIsDown(SHIFT) ? 5 : 1;
  if (keyIsDown(LEFT_ARROW)) {
    map_info["center"][0] += map_speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    map_info["center"][0] -= map_speed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    map_info["center"][1] -= map_speed;
  }
  if (keyIsDown(UP_ARROW)) {
    map_info["center"][1] += map_speed;
  }
}

function draw() {
  tick();

  arrowKeymapMovement();
  //

  push();
  {
    translate(map_info.center[0], map_info.center[1]);
    scale(map_info.zoomLevel);
    background(0);
    render_circles();
    render_squares();
    render_rect();
    render_labels();

    //
    push();
    {
      stroke(255);
      strokeWeight(2 / map_info.zoomLevel);
      noFill();
      circle(width / 2, height / 2, spawn_radius);
    }
    pop();
  }
  pop();
}
