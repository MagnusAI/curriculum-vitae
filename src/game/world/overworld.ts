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

// Decorative mountain skyline along the top edge: peak apex columns.
// The gap between the middle peaks is the entrance to the mountain scene.
const PEAKS = [3, 12, 20, 34, 43];
const PEAK_ROWS = 4; // rows 0..3
const GAP = { x0: 26, x1: 28 }; // path between the lakes, up into the peaks
const WATER_ROWS = { y0: 4, y1: 6 };

// The career grove: a clearing enclosed by a ring of (non-interactive)
// pines, entered from the campsite. Job trees stand inside with signs,
// chronological reading order: top row left→right, then bottom row.
const GROVE = { cx: 35, cy: 25, rx: 10, ry: 6.5 };
const GROVE_ENTRANCE = { x0: 36, x1: 37, maxY: 20 };
const CAREER_TREE_SPOTS: [number, number][] = [
  [29, 22],
  [34, 22],
  [39, 22],
  [29, 27],
  [34, 27],
  [39, 27],
  [44, 25],
];

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
  ) => {
    const p = new Prop(assets.props, P[name], tx * TILE, ty * TILE, options);
    entities.push(p);
    return p;
  };

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
        feet: { ox: Math.floor(region.w / 2) - 6, oy: region.h - 8, w: 12, h: 8 },
        ...options,
      },
    );
    entities.push(p);
    return p;
  };

  // =========================================== mountain skyline (decorative)
  for (let y = 0; y < PEAK_ROWS; y++) {
    for (const apex of PEAKS) {
      const half = Math.round(((y + 1.5) / PEAK_ROWS) * 4.5);
      for (let x = apex - half; x <= apex + half; x++) {
        if (x < 0 || x >= W) continue;
        setTile(x, y, y < 2 ? T.SNOW : r() < 0.5 ? T.ROCK_A : T.ROCK_B);
      }
    }
    // whole skyline band is impassable scenery
    for (let x = 0; x < W; x++) markSolid(x, y);
  }
  // shade the very bottom rock edge where the range meets the water
  for (let x = 0; x < W; x++) {
    if (ground[(PEAK_ROWS - 1) * W + x] === T.ROCK_A || ground[(PEAK_ROWS - 1) * W + x] === T.ROCK_B) {
      if (r() < 0.5) setTile(x, PEAK_ROWS - 1, T.CLIFF);
    }
  }

  // ============================================== the two lakes + entrance
  for (let y = WATER_ROWS.y0; y <= WATER_ROWS.y1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (x >= GAP.x0 && x <= GAP.x1) continue;
      setTile(x, y, r() < 0.6 ? T.WATER_A : T.WATER_B);
      markSolid(x, y);
    }
  }
  // the path to the mountains, between the lakes and into the skyline
  fillTiles(GAP.x0, 1, GAP.x1, WATER_ROWS.y1 + 2, T.PATH);
  for (let y = 1; y <= WATER_ROWS.y1; y++) {
    for (let x = GAP.x0; x <= GAP.x1; x++) markSolid(x, y, false);
  }

  // sign explaining the mountains, beside the path entrance
  prop('sign', 24, 7, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the trail sign',
    dialog: mountainSignDialog(),
  });

  // ======================================================== house + mailbox
  const houseX = 4 * TILE;
  const houseY = 10 * TILE;
  entities.push(
    new Prop(assets.props, P.house, houseX, houseY, {
      feet: { ox: 0, oy: 34, w: 96, h: 46 },
    }),
  );
  prop('mailbox', 10, 14, {
    feet: { ox: 2, oy: 4, w: 12, h: 11 },
    interactPrompt: 'Check mailbox',
    dialog: mailboxDialog(),
  });

  // welcome sign near the spawn, in the middle of the open meadow
  prop('sign', 22, 13, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read sign',
    dialog: welcomeDialog(),
  });

  // ============================================ skills corner (south-west)
  // tool rack below the house
  prop('toolrack', 4, 17, {
    feet: { ox: 1, oy: 22, w: 30, h: 9 },
    interactPrompt: 'Check the tool rack',
    dialog: toolRackDialog(rackTools),
  });
  // potted plants lined up next to the rack
  const POT_SLOTS: [number, number][] = [
    [8, 17],
    [10, 17],
    [12, 17],
    [14, 17],
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
  // garden beds along the bottom-left
  const BED_SLOTS: [number, number][] = [
    [3, 24],
    [9, 24],
    [15, 24],
    [5, 28],
    [11, 28],
    [17, 28],
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
  // skills sign between the rack and the beds
  prop('sign', 8, 21, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the garden sign',
    dialog: yardSignDialog(),
  });
  // resident chicken pecking between the beds
  const chickenRun = { x: 4 * TILE, y: 26 * TILE, w: 12 * TILE, h: TILE };
  entities.push(new Animal(8 * TILE, 26 * TILE, assets.chicken, chickenRun, 'Bok?', undefined, () => playBlip(84, 0.07)));

  // ================================================= campsite (mid-east)
  const campsiteHobby = hobbies.find((h) => h.spot === 'campsite');
  const campsiteDialog = campsiteHobby
    ? hobbyDialog(campsiteHobby, 'Curious about the rest? My piano and computer are inside the house — go have a look!')
    : undefined;
  fillTiles(38, 12, 44, 15, T.PATH); // the camp clearing
  entities.push(
    new Prop(assets.props, P.tent, 41 * TILE, 11 * TILE - 4, {
      feet: { ox: 2, oy: 12, w: 28, h: 15 },
      interactPrompt: 'Peek into the tent',
      dialog: campsiteDialog,
    }),
  );
  prop('campfire_a', 39, 13, {
    feet: { ox: 1, oy: 10, w: 14, h: 6 },
    interactPrompt: 'Warm your hands',
    dialog: campsiteDialog,
    altRegion: P.campfire_b,
    animFps: 5,
  });
  prop('log', 38, 14, { feet: { ox: 0, oy: 9, w: 15, h: 6 } });
  prop('log', 41, 14, { feet: { ox: 0, oy: 9, w: 15, h: 6 } });
  prop('sign', 37, 12, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the campsite sign',
    dialog: campsiteDialog,
  });

  // sheep grazing by the eastern lake
  const meadow = { x: 31 * TILE, y: 7 * TILE + 8, w: 5 * TILE, h: 2 * TILE };
  entities.push(new Animal(32 * TILE, 8 * TILE, assets.sheep, meadow, 'Baah?', undefined, () => playBlip(65, 0.18)));
  entities.push(new Animal(34 * TILE, 8 * TILE + 8, assets.sheep, meadow, 'Baah?', undefined, () => playBlip(62, 0.18)));

  // ====================================== career grove (enclosed pine ring)
  // path from the campsite clearing down to the grove entrance
  fillTiles(GROVE_ENTRANCE.x0, 16, GROVE_ENTRANCE.x1, 19, T.PATH);
  // the enclosing wall of pines — pines are never interactive
  for (let y = Math.floor(GROVE.cy - GROVE.ry) - 1; y <= Math.ceil(GROVE.cy + GROVE.ry) + 1; y++) {
    for (let x = Math.floor(GROVE.cx - GROVE.rx) - 1; x <= Math.ceil(GROVE.cx + GROVE.rx) + 1; x++) {
      if (x < 1 || x >= W - 1 || y < 1 || y >= H - 1) continue;
      const dx = (x - GROVE.cx) / GROVE.rx;
      const dy = (y - GROVE.cy) / GROVE.ry;
      const d = dx * dx + dy * dy;
      if (d < 0.75 || d > 1.15) continue;
      if (y <= GROVE_ENTRANCE.maxY && x >= GROVE_ENTRANCE.x0 && x <= GROVE_ENTRANCE.x1) continue; // gate
      plantTree((x + y) % 2 === 0 ? 'tree_pine_l' : 'tree_pine_m', x, y);
    }
  }
  // job trees inside the clearing, each with its own sign in front
  const careerChrono = [...workExperience].reverse();
  if (careerChrono.length > CAREER_TREE_SPOTS.length) {
    console.warn(
      `overworld: ${careerChrono.length} work entries but only ${CAREER_TREE_SPOTS.length} tree spots — extend CAREER_TREE_SPOTS`,
    );
  }
  const speciesBySector: Record<string, 'oak' | 'birch' | 'fruit'> = {
    finance: 'birch',
    software: 'oak',
    retail: 'fruit',
  };
  careerChrono.slice(0, CAREER_TREE_SPOTS.length).forEach((item, i) => {
    const species = speciesBySector[item.sector ?? ''] ?? 'oak';
    const size = tenureTreeSize(tenureMonths(item.period));
    const [tx, ty] = CAREER_TREE_SPOTS[i];
    const dialog = careerDialog(item);
    plantTree(`tree_${species}_${size}` as keyof typeof PROPS, tx, ty, {
      interactPrompt: `Inspect tree — ${item.organization}`,
      dialog,
    });
    prop('sign', tx, ty + 1, {
      feet: { ox: 0, oy: 6, w: 14, h: 10 },
      interactPrompt: `Read sign — ${item.organization}`,
      dialog,
    });
  });
  // forest sign right at the grove entrance
  prop('sign', 34, 17, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read the forest sign',
    dialog: forestSignDialog(),
  });

  // ================================================== borders + decoration
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
  for (let y = 10; y < H - 2; y += 2) {
    plantTree('tree_oak_l', 1, y);
  }
  for (let y = 10; y < 16; y += 2) {
    plantTree('tree_pine_l', W - 2, y);
  }
  for (const [bx, by] of [
    [18, 11],
    [30, 14],
    [20, 21],
    [13, 12],
  ] as const) {
    prop('bush', bx, by, { feet: { ox: 1, oy: 6, w: 14, h: 9 } });
  }
  for (const [rx, ry] of [
    [16, 20],
    [33, 17],
  ] as const) {
    prop('rock', rx, ry, { feet: { ox: 1, oy: 8, w: 11, h: 7 } });
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
      {
        // the path between the lakes leads up the education mountain
        rect: { x: GAP.x0 * TILE, y: 2 * TILE, w: (GAP.x1 - GAP.x0 + 1) * TILE, h: 10 },
        target: 'mountain',
        spawn: { x: 19 * TILE + 11, y: 34 * TILE - 6, facing: 'up' },
      },
    ],
    spawn: { x: 24 * TILE + 3, y: 13 * TILE, facing: 'up' },
  };
}
