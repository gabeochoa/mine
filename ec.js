const CT = {
  CircleRenderer: {
    name: "CircleRenderer",
  },
  SquareRenderer: {
    name: "SquareRenderer",
  },
  RectRenderer: {
    name: "RectRenderer",
    fields: {
      w: "Number",
      h: "Number",
      color: "Color",
    },
  },
  HasVelocity: {
    name: "HasVelocity",
    fields: {
      vel: "Vector",
    },
  },
  HasTarget: {
    name: "HasTarget",
    fields: {
      target_id: "ID",
    },
  },
  IsTarget: {
    name: "IsTarget",
    fields: {
      parent_id: "ID",
    },
  },
  IsOre: {
    name: "IsOre",
    fields: {
      type: "OreType",
    },
  },
  HoldsOre: {
    name: "HoldsOre",
    fields: {
      type: "OreType",
      amount: "Amount",
    },
  },
  IsDropoff: {
    name: "IsDropoff",
  },
  HasClickInteraction: {
    name: "HasClickInteraction",
    fields: {
      callback: "Function",
      validator: "NullableFunction",
    },
  },
  HasHoverInteraction: {
    name: "HasHoverInteraction",
    fields: {
      active: "Boolean",
      //
      onStart: "Function",
      onEnd: "Function",
    },
  },
  HasLabel: {
    name: "HasLabel",
    fields: {
      active: "Boolean",
      // when true, get_text() is called and text is last rendered
      is_dynamic: "Boolean",
      text: "String",
      location: "RectLocation",
      // called when is_dynamic=true
      get_text: "Function",
    },
  },
  HasAbsolutePosition: {
    name: "HasAbsolutePosition",
    fields: {},
  },
};

const EC = {
  CircleRenderer: [],
  SquareRenderer: [],
  RectRenderer: [],
  HasVelocity: [],
  HasTarget: [],
  IsTarget: [],
  IsOre: [],
  HoldsOre: [],
  IsDropoff: [],
  //
  // UI
  //
  HasClickInteraction: [],
  HasHoverInteraction: [],
  HasLabel: [],
  HasAbsolutePosition: [],
};

const OreType = {
  Iron: "iron",
};

function randomOre() {
  const ores = Object.values(OreType);
  const index = Math.floor(Math.random() * ores.length);
  return ores[index];
}

const UI_Interaction_Type = {
  None: "none",
  Click: "click",
  Hover: "hover",
};

class UIInteraction {
  constructor(type, callback) {
    this.type = type;
    this.callback = callback;
  }
}

const RectLocation = {
  TopLeft: "topleft",
  Center: "center",
};

let NEXT_ENTITY_ID = 0;

class Entity {
  constructor(x, y, components) {
    this.id = NEXT_ENTITY_ID++;
    this.pos = createVector(x, y);
    for (let component of components) {
      this.add_component(component);
    }
  }

  add_component(component) {
    // console.log(component)
    if (!(component.name in EC)) {
      console.error("component ", component, " missing from EC", EC);
    }
    EC[component.name].push(this.id);

    if (component.fields) {
      this.add_component_fields(component);
    }
  }

  add_component_fields(component) {
    for (const [key, value] of Object.entries(component.fields)) {
      let fields = {};
      switch (value) {
        case "Vector":
          fields[key] = createVector(0, 0);
          break;
        case "ID":
          fields[key] = null;
          break;
        case "OreType":
          fields[key] = randomOre();
          break;
        case "Amount":
          fields[key] = 0;
          break;
        case "Number":
          fields[key] = 0;
          break;
        case "Interaction[]":
          fields[key] = [];
          break;
        case "Function":
          fields[key] = () => {};
          break;
        case "NullableFunction":
          fields[key] = null;
          break;
        case "Boolean":
          fields[key] = false;
          break;
        case "Color":
          fields[key] = color(255);
          break;
        case "String":
          fields[key] = "";
          break;
        case "RectLocation":
          fields[key] = RectLocation.TopLeft;
          break;
        default:
          console.warn("Missing handler for ", value);
          break;
      }
      this[component.name] = fields;
    }
  }
}

// EC lists hold entity ids (numbers), never entity objects. Mutate each
// list in place: reassigning a local `component` variable deletes nothing.
function remove_entity(id) {
  delete entities[id];
  for (const name of Object.keys(EC)) {
    EC[name] = EC[name].filter((entity_id) => entity_id !== id);
  }
}
