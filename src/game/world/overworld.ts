import { education } from '../../data/education';
import { hobbies } from '../../data/hobbies';
import { gardenBeds, pottedPlants, rackTools } from '../../data/skills';
import { workExperience } from '../../data/work-experience';
import { PROPS, T } from '../atlas';
import { TILE } from '../constants';
import { playBlip } from '../engine/audio';
import { bakeLayers, TilemapData } from '../engine/tilemap';
import { Animal } from '../entities/animal';
import { Entity } from '../entities/entity';
import { Prop } from '../entities/prop';
import {
  bedDialog,
  careerDialog,
  educationDialog,
  forestSignDialog,
  hobbyDialog,
  mailboxDialog,
  mountainSignDialog,
  potDialog,
  toolRackDialog,
  welcomeDialog,
  yardSignDialog,
} from '../content/dialogs';
import { tenureMonths, tenureTreeSize } from '../content/tenure';
import { GameAssets, SceneDef } from './scene';

const W = 48;
const H = 34;

// ---------------------------------------------------------------- mountain
// Terraces from summit down; each has a walkable band, a south cliff row and
// a 2-tile ramp gap in that cliff leading up from the terrace below.
const TERRACES = [
  { x0: 19, x1: 29, rows: [1, 2, 3], cliffRow: 4, rampX: 21, snow: true }, // summit
  { x0: 16, x1: 32, rows: [5, 6], cliffRow: 7, rampX: 30, snow: false },
  { x0: 13, x1: 35, rows: [8, 9], cliffRow: 10, rampX: 15, snow: false },
  { x0: 10, x1: 38, rows: [11, 12], cliffRow: 13, rampX: 23, snow: false },
];

// Checkpoint slots, chronological (lowest education first): trail base,
// terrace 1..3, summit. Extend if more education entries are added.
const CHECKPOINTS: { kind: 'sign' | 'cairn' | 'cabin' | 'tower'; tx: number; ty: number }[] = [
  { kind: 'sign', tx: 26, ty: 15 }, // trail base
  { kind: 'cairn', tx: 19, ty: 11 },
  { kind: 'sign', tx: 26, ty: 8 },
  { kind: 'cabin', tx: 27, ty: 5 },
  { kind: 'tower', tx: 23, ty: 2 }, // summit
  { kind: 'sign', tx: 21, ty: 11 },
];

// Career forest slots along the main road, oldest job on the left.
const CAREER_TREE_XS = [28, 31, 34, 37, 40, 43, 45];
const CAREER_TREE_ROW = 18; // trunk-base tile row (north side of the road)

// deterministic decoration noise
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildOverworld(assets: GameAssets): SceneDef {
  const ground = new Array<number>(W * H);
  const solid = new Uint8Array(W * H);
  const r = rng(2024);

  // --- base: grass with sprinkled variety
  for (let i = 0; i < W * H; i++) {
    const v = r();
    ground[i] =
      v < 0.42 ? T.GRASS_A : v < 0.84 ? T.GRASS_B : v < 0.9 ? T.GRASS_TUFT : v < 0.95 ? T.GRASS_FLOWER_Y : T.GRASS_FLOWER_R;
  }

  const setTile = (x: number, y: number, id: number) => {
    ground[y * W + x] = id;
  };
  const fillTiles = (x0: number, y0: number, x1: number, y1: number, id: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setTile(x, y, id);
  };
  const markSolid = (x: number, y: number, isSolid = true) => {
    solid[y * W + x] = isSolid ? 1 : 0;
  };

  const entities: Entity[] = [];
  const P = PROPS;

  const prop = (
    name: keyof typeof PROPS,
    tx: number,
    ty: number,
    options?: ConstructorParameters<typeof Prop>[4],
    pxOffset: [number, number] = [0, 0],
  ) => {
    const p = new Prop(assets.props, P[name], tx * TILE + pxOffset[0], ty * TILE + pxOffset[1], options);
    entities.push(p);
    return p;
  };

  // Plants a tree whose trunk base sits on tile row `ty`.
  const plantTree = (
    name: keyof typeof PROPS,
    tx: number,
    ty: number,
    options?: ConstructorParameters<typeof Prop>[4],
  ) => {
    const region = P[name];
    const p = new Prop(
      assets.props,
      region,
      tx * TILE + Math.floor((TILE - region.w) / 2),
      (ty + 1) * TILE - region.h,
      {
        feet: {
          ox: Math.floor(region.w / 2) - 6,
          oy: region.h - 8,
          w: 12,
          h: 8,
        },
        ...options,
      },
    );
    entities.push(p);
    return p;
  };

  // ================================================== 🏔️ Education Mountain
  for (const terrace of TERRACES) {
    for (const row of terrace.rows) {
      for (let x = terrace.x0; x <= terrace.x1; x++) {
        setTile(x, row, terrace.snow ? T.SNOW : r() < 0.5 ? T.ROCK_A : T.ROCK_B);
      }
      // rock rim: outermost column of each band is impassable
      markSolid(terrace.x0, row);
      markSolid(terrace.x1, row);
    }
    for (let x = terrace.x0; x <= terrace.x1; x++) {
      const isRamp = x === terrace.rampX || x === terrace.rampX + 1;
      setTile(x, terrace.cliffRow, isRamp ? T.PATH : T.CLIFF);
      markSolid(x, terrace.cliffRow, !isRamp);
    }
  }
  // trail: base approach + switchbacks across the terraces
  fillTiles(23, 14, 24, 16, T.PATH); // from the road up to the first ramp
  fillTiles(16, 11, 24, 12, T.PATH);
  fillTiles(15, 8, 31, 9, T.PATH);
  fillTiles(21, 5, 31, 6, T.PATH);
  fillTiles(21, 2, 24, 3, T.PATH);
  // rocks scattered on terraces
  for (const [rx, ry] of [
    [12, 11],
    [34, 8],
    [18, 5],
    [33, 11],
  ] as const) {
    prop('rock', rx, ry, { feet: { ox: 1, oy: 8, w: 11, h: 7 } });
  }
  // pines on the flanks
  for (const [px, py] of [
    [7, 4],
    [5, 8],
    [8, 11],
    [41, 5],
    [43, 9],
    [40, 12],
    [3, 5],
    [44, 3],
  ] as const) {
    plantTree('tree_pine_l', px, py);
  }

  // mountain grammar sign at the trail base
  prop('sign', 21, 15, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the trail sign',
    dialog: mountainSignDialog(),
  });

  // education checkpoints, chronological from the bottom of the trail
  const educationChrono = [...education].reverse();
  if (educationChrono.length > CHECKPOINTS.length) {
    console.warn(
      `overworld: ${educationChrono.length} education entries but only ${CHECKPOINTS.length} checkpoints — extend CHECKPOINTS`,
    );
  }
  educationChrono.slice(0, CHECKPOINTS.length).forEach((item, i) => {
    const cp = CHECKPOINTS[i];
    const dialog = educationDialog(item);
    if (cp.kind === 'sign') {
      prop('sign', cp.tx, cp.ty, {
        feet: { ox: 0, oy: 6, w: 14, h: 10 },
        interactPrompt: 'Read waymark',
        dialog,
      });
    } else if (cp.kind === 'cairn') {
      prop('cairn', cp.tx, cp.ty, {
        feet: { ox: 1, oy: 8, w: 13, h: 8 },
        interactPrompt: 'Inspect cairn',
        dialog,
      });
    } else if (cp.kind === 'cabin') {
      entities.push(
        new Prop(assets.props, P.cabin, cp.tx * TILE, (cp.ty + 2) * TILE - P.cabin.h, {
          feet: { ox: 0, oy: P.cabin.h - 14, w: P.cabin.w, h: 14 },
          interactPrompt: 'Visit the cabin',
          dialog,
        }),
      );
    } else {
      entities.push(
        new Prop(assets.props, P.tower, cp.tx * TILE, (cp.ty + 1) * TILE - P.tower.h, {
          feet: { ox: 2, oy: P.tower.h - 12, w: P.tower.w - 4, h: 12 },
          interactPrompt: 'Climb the lookout tower',
          dialog,
        }),
      );
    }
  });

  // a couple of sheep grazing at the foothill (pure decoration)
  const meadow = { x: 28 * TILE, y: 14 * TILE, w: 10 * TILE, h: 2 * TILE };
  entities.push(new Animal(30 * TILE, 14 * TILE + 8, assets.sheep, meadow, 'Baah?', undefined, () => playBlip(65, 0.18)));
  entities.push(new Animal(34 * TILE, 15 * TILE, assets.sheep, meadow, 'Baah?', undefined, () => playBlip(62, 0.18)));

  // ==================================================== roads + house + mail
  fillTiles(2, 19, 46, 20, T.PATH); // main east-west road
  fillTiles(11, 21, 12, 22, T.PATH); // south to the Skills Yard gate
  fillTiles(36, 21, 37, 23, T.PATH); // south to the campsite

  const houseX = 4 * TILE;
  const houseY = 14 * TILE;
  entities.push(
    new Prop(assets.props, P.house, houseX, houseY, {
      feet: { ox: 0, oy: 34, w: 96, h: 46 },
    }),
  );
  prop('mailbox', 10, 18, {
    feet: { ox: 2, oy: 4, w: 12, h: 11 },
    interactPrompt: 'Check mailbox',
    dialog: mailboxDialog(),
  });
  // a chicken pecking between the garden beds (decoration)
  const chickenRun = { x: 6 * TILE, y: 26 * TILE, w: 8 * TILE, h: TILE };
  entities.push(new Animal(8 * TILE, 26 * TILE, assets.chicken, chickenRun, 'Bok?', undefined, () => playBlip(84, 0.07)));

  // welcome sign at the spawn
  prop('sign', 26, 21, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read sign',
    dialog: welcomeDialog(),
  });

  // ===================================================== 🌲 Career Forest
  if (workExperience.length > CAREER_TREE_XS.length) {
    console.warn(
      `overworld: ${workExperience.length} work entries but only ${CAREER_TREE_XS.length} tree slots — extend CAREER_TREE_XS`,
    );
  }
  const careerChrono = [...workExperience].reverse(); // oldest first, left to right
  const speciesBySector: Record<string, 'oak' | 'pine' | 'fruit'> = {
    finance: 'pine',
    software: 'oak',
    retail: 'fruit',
  };
  careerChrono.slice(0, CAREER_TREE_XS.length).forEach((item, i) => {
    const species = speciesBySector[item.sector ?? ''] ?? 'oak';
    const size = tenureTreeSize(tenureMonths(item.period));
    plantTree(`tree_${species}_${size}` as keyof typeof PROPS, CAREER_TREE_XS[i], CAREER_TREE_ROW, {
      interactPrompt: `Inspect tree — ${item.organization}`,
      dialog: careerDialog(item),
    });
  });
  // forest grammar sign at the row's start
  prop('sign', 26, 18, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the forest sign',
    dialog: forestSignDialog(),
  });
  // wild filler trees (non-interactive) to make it feel like a forest
  const fillerKinds = ['tree_oak_s', 'tree_pine_s', 'tree_oak_m', 'tree_pine_m', 'tree_fruit_s'] as const;
  const fillerSpots: [number, number][] = [
    [29, 16],
    [33, 16],
    [38, 16],
    [42, 16],
    [45, 17],
    [30, 22],
    [33, 23],
    [39, 22],
    [43, 23],
    [45, 21],
    [27, 23],
    [41, 16],
  ];
  fillerSpots.forEach(([fx, fy], i) => {
    // keep the campsite path clear
    if (fx >= 35 && fx <= 38 && fy >= 21 && fy <= 23) return;
    plantTree(fillerKinds[i % fillerKinds.length], fx, fy);
  });

  // ===================================================== 🌱 Skills Yard
  const YARD = { x0: 3, y0: 22, x1: 21, y1: 31 };
  for (let x = YARD.x0; x <= YARD.x1; x++) {
    if (x !== 11 && x !== 12) {
      prop('fence_h', x, YARD.y0, { feet: { ox: 0, oy: 4, w: 16, h: 11 } });
    }
    prop('fence_h', x, YARD.y1, { feet: { ox: 0, oy: 4, w: 16, h: 11 } });
  }
  for (let y = YARD.y0 + 1; y < YARD.y1; y++) {
    prop('fence_v', YARD.x0, y, { feet: { ox: 4, oy: 0, w: 8, h: 16 } });
    prop('fence_v', YARD.x1, y, { feet: { ox: 4, oy: 0, w: 8, h: 16 } });
  }
  // yard grammar sign beside the gate (just outside the fence)
  prop('sign', 13, 21, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the yard sign',
    dialog: yardSignDialog(),
  });
  // raised garden beds — growth stage = proficiency
  const BED_SLOTS: [number, number][] = [
    [5, 24],
    [11, 24],
    [17, 24],
    [7, 27],
    [14, 27],
    [17, 29],
  ];
  if (gardenBeds.length > BED_SLOTS.length) {
    console.warn(`overworld: ${gardenBeds.length} garden beds but only ${BED_SLOTS.length} slots — extend BED_SLOTS`);
  }
  gardenBeds.slice(0, BED_SLOTS.length).forEach((bed, i) => {
    const [bx, by] = BED_SLOTS[i];
    prop(`bed_${bed.proficiency}` as keyof typeof PROPS, bx, by, {
      feet: { ox: 0, oy: 6, w: 32, h: 17 },
      interactPrompt: `Look at the ${bed.name} bed`,
      dialog: bedDialog(bed),
    });
  });
  // potted plants along the west fence
  const POT_SLOTS: [number, number][] = [
    [4, 24],
    [4, 26],
    [4, 28],
    [4, 30],
  ];
  if (pottedPlants.length > POT_SLOTS.length) {
    console.warn(`overworld: ${pottedPlants.length} potted plants but only ${POT_SLOTS.length} slots — extend POT_SLOTS`);
  }
  const potKinds = ['pot_c', 'pot_b', 'pot_a'] as const;
  pottedPlants.slice(0, POT_SLOTS.length).forEach((plant, i) => {
    const [px, py] = POT_SLOTS[i];
    prop(potKinds[i % potKinds.length], px, py, {
      feet: { ox: 2, oy: 14, w: 11, h: 6 },
      interactPrompt: `Look at “${plant.name}”`,
      dialog: potDialog(plant),
    });
  });
  // the tool rack
  prop('toolrack', 8, 29, {
    feet: { ox: 1, oy: 22, w: 30, h: 9 },
    interactPrompt: 'Check the tool rack',
    dialog: toolRackDialog(rackTools),
  });

  // ===================================================== 🏕️ Campsite
  const campsiteHobby = hobbies.find((h) => h.spot === 'campsite');
  const campsiteDialog = campsiteHobby
    ? hobbyDialog(campsiteHobby, 'Curious about the rest? My piano and computer are inside the house — go have a look!')
    : undefined;
  // dirt clearing
  fillTiles(32, 25, 41, 29, T.PATH);
  entities.push(
    new Prop(assets.props, P.tent, 33 * TILE, 24 * TILE - 4, {
      feet: { ox: 2, oy: 12, w: 28, h: 15 },
      interactPrompt: 'Peek into the tent',
      dialog: campsiteDialog,
    }),
  );
  prop('campfire_a', 37, 27, {
    feet: { ox: 1, oy: 10, w: 14, h: 6 },
    interactPrompt: 'Warm your hands',
    dialog: campsiteDialog,
    altRegion: P.campfire_b,
    animFps: 5,
  });
  prop('log', 35, 28, { feet: { ox: 0, oy: 9, w: 15, h: 6 } });
  prop('log', 39, 27, { feet: { ox: 0, oy: 9, w: 15, h: 6 } });
  prop('sign', 31, 26, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the campsite sign',
    dialog: campsiteDialog,
  });
  plantTree('tree_pine_m', 32, 24);
  plantTree('tree_pine_m', 42, 25);
  plantTree('tree_pine_s', 41, 29);

  // ================================================== borders + edge solids
  for (let x = 0; x < W; x++) {
    solid[x] = 1;
    solid[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    solid[y * W] = 1;
    solid[y * W + W - 1] = 1;
  }
  for (let x = 1; x < W - 1; x += 2) {
    if (r() < 0.85) plantTree(r() < 0.4 ? 'tree_pine_l' : 'tree_oak_l', x, H - 2);
  }
  for (let y = 15; y < H - 2; y += 2) {
    plantTree('tree_oak_l', 1, y);
    if (y < 17 || y > 24) plantTree('tree_pine_l', W - 2, y);
  }
  // top corners of the map (beside the mountain flanks)
  for (let x = 1; x < 9; x += 2) plantTree('tree_pine_l', x, 1);
  for (let x = 40; x < W - 1; x += 2) plantTree('tree_pine_l', x, 1);

  // scattered decoration
  for (const [bx, by] of [
    [25, 16],
    [45, 19],
    [8, 21],
    [24, 23],
  ] as const) {
    prop('bush', bx, by, { feet: { ox: 1, oy: 6, w: 14, h: 9 } });
  }

  const map: TilemapData = { w: W, h: H, layers: [ground], solid };

  return {
    name: 'overworld',
    map,
    ground: bakeLayers(W, H, [ground], assets.tileset),
    entities,
    triggers: [
      {
        // house door — walk into it to enter
        rect: { x: houseX + 38, y: houseY + 78, w: 20, h: 6 },
        target: 'house',
        spawn: { x: 107, y: 136, facing: 'up' },
      },
    ],
    spawn: { x: 24 * TILE + 3, y: 20 * TILE + 2, facing: 'up' },
  };
}
