import { education } from '../../data/education';
import { hobbies } from '../../data/hobbies';
import { skillCategories } from '../../data/skills';
import { HobbyAnimal } from '../../data/types';
import { PROPS } from '../atlas';
import { T } from '../atlas';
import { TILE } from '../constants';
import { playBlip } from '../engine/audio';
import { bakeLayers, TilemapData } from '../engine/tilemap';
import { Animal } from '../entities/animal';
import { Entity } from '../entities/entity';
import { Prop } from '../entities/prop';
import { educationDialog, hobbyDialog, mailboxDialog, skillsDialog } from '../content/dialogs';
import { GameAssets, SceneDef } from './scene';

const W = 40;
const H = 30;

// Hand-placed slots — extend these arrays if the CV data outgrows them.
const EDUCATION_SIGN_SLOTS: [number, number][] = [
  [6, 7],
  [12, 7],
  [18, 7],
  [24, 7],
  [30, 7],
  [35, 7],
];
const SKILL_ROW_SLOTS: { sign: [number, number]; cols: [number, number]; row: number }[] = [
  { sign: [11, 21], cols: [12, 18], row: 21 },
  { sign: [11, 23], cols: [12, 18], row: 23 },
  { sign: [11, 25], cols: [12, 18], row: 25 },
  { sign: [21, 21], cols: [22, 28], row: 21 },
  { sign: [21, 23], cols: [22, 28], row: 23 },
  { sign: [21, 25], cols: [22, 28], row: 25 },
];
const ANIMAL_SLOTS: [number, number][] = [
  [29, 11],
  [32, 13],
  [35, 11],
  [30, 13],
];
const CROP_KINDS = ['crop_wheat', 'crop_carrot', 'crop_cabbage', 'crop_berry', 'crop_corn'] as const;

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

  // --- ground: grass with sprinkled variety
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

  // --- paths
  fillTiles(6, 16, 32, 17, T.PATH); // main east-west road
  fillTiles(19, 8, 20, 15, T.PATH); // north to the forest
  fillTiles(19, 18, 20, 27, T.PATH); // south through the fields
  fillTiles(7, 14, 8, 15, T.PATH); // from the house door

  // --- map edge is always solid
  for (let x = 0; x < W; x++) {
    solid[x] = 1;
    solid[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    solid[y * W] = 1;
    solid[y * W + W - 1] = 1;
  }

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

  const tree = (tx: number, ty: number, pine = false) => {
    // sprite is 32x32; ty is the tile row of the trunk base
    const region = pine ? P.pine : P.tree;
    entities.push(
      new Prop(assets.props, region, tx * TILE - 8, (ty + 1) * TILE - 32, {
        feet: { ox: 10, oy: 24, w: 12, h: 8 },
      }),
    );
  };

  // --- forest band (decorative) + map borders
  for (let x = 1; x < W - 1; x += 2) {
    tree(x, 1, r() < 0.4);
    if (r() < 0.7) tree(Math.min(W - 2, x + 1), 3, r() < 0.4);
  }
  for (let y = 5; y < H - 2; y += 2) {
    tree(1, y, r() < 0.3);
    tree(W - 2, y, r() < 0.3);
  }
  for (let x = 3; x < W - 3; x += 2) {
    if (r() < 0.85) tree(x, H - 2, r() < 0.3);
  }

  // --- education forest: one tree + sign per entry
  if (education.length > EDUCATION_SIGN_SLOTS.length) {
    console.warn(
      `overworld: ${education.length} education entries but only ${EDUCATION_SIGN_SLOTS.length} slots — extend EDUCATION_SIGN_SLOTS`,
    );
  }
  education.slice(0, EDUCATION_SIGN_SLOTS.length).forEach((item, i) => {
    const [sx, sy] = EDUCATION_SIGN_SLOTS[i];
    tree(sx, sy - 1);
    prop('sign', sx, sy, {
      feet: { ox: 0, oy: 6, w: 14, h: 10 },
      interactPrompt: 'Read sign',
      dialog: educationDialog(item),
    });
  });

  // --- skill fields: one crop row per category
  if (skillCategories.length > SKILL_ROW_SLOTS.length) {
    console.warn(
      `overworld: ${skillCategories.length} skill categories but only ${SKILL_ROW_SLOTS.length} rows — extend SKILL_ROW_SLOTS`,
    );
  }
  skillCategories.slice(0, SKILL_ROW_SLOTS.length).forEach((category, i) => {
    const slot = SKILL_ROW_SLOTS[i];
    const crop = CROP_KINDS[i % CROP_KINDS.length];
    for (let x = slot.cols[0]; x <= slot.cols[1]; x++) {
      setTile(x, slot.row, T.SOIL);
      prop(crop, x, slot.row, { feet: { ox: 1, oy: 6, w: 14, h: 10 } });
    }
    prop('sign', slot.sign[0], slot.sign[1], {
      feet: { ox: 0, oy: 6, w: 14, h: 10 },
      interactPrompt: 'Read sign',
      dialog: skillsDialog(category),
    });
  });

  // --- hobby meadow: fenced pen with one animal per hobby
  const PEN = { x0: 27, y0: 9, x1: 37, y1: 15 };
  for (let x = PEN.x0; x <= PEN.x1; x++) {
    prop('fence_h', x, PEN.y0, { feet: { ox: 0, oy: 4, w: 16, h: 11 } });
    if (x !== 30 && x !== 31) {
      // gate gap at the bottom
      prop('fence_h', x, PEN.y1, { feet: { ox: 0, oy: 4, w: 16, h: 11 } });
    }
  }
  for (let y = PEN.y0 + 1; y < PEN.y1; y++) {
    prop('fence_v', PEN.x0, y, { feet: { ox: 5, oy: 0, w: 6, h: 16 } });
    prop('fence_v', PEN.x1, y, { feet: { ox: 5, oy: 0, w: 6, h: 16 } });
  }
  const penRect = {
    x: (PEN.x0 + 1) * TILE + 2,
    y: (PEN.y0 + 1) * TILE + 2,
    w: (PEN.x1 - PEN.x0 - 1) * TILE - 16,
    h: (PEN.y1 - PEN.y0 - 1) * TILE - 12,
  };
  const animalSheet: Record<HobbyAnimal, typeof assets.chicken> = {
    dog: assets.dog,
    chicken: assets.chicken,
    sheep: assets.sheep,
    cow: assets.cow,
  };
  const animalSound: Record<HobbyAnimal, () => void> = {
    dog: () => playBlip(60),
    chicken: () => playBlip(84, 0.07),
    sheep: () => playBlip(65, 0.18),
    cow: () => playBlip(50, 0.25),
  };
  if (hobbies.length > ANIMAL_SLOTS.length) {
    console.warn(
      `overworld: ${hobbies.length} hobbies but only ${ANIMAL_SLOTS.length} animal slots — extend ANIMAL_SLOTS`,
    );
  }
  hobbies.slice(0, ANIMAL_SLOTS.length).forEach((hobby, i) => {
    const [ax, ay] = ANIMAL_SLOTS[i];
    entities.push(
      new Animal(
        ax * TILE,
        ay * TILE + 8,
        animalSheet[hobby.animal],
        penRect,
        `About “${hobby.name}”`,
        hobbyDialog(hobby),
        animalSound[hobby.animal],
      ),
    );
  });

  // --- house + mailbox
  const houseX = 5 * TILE;
  const houseY = 9 * TILE;
  entities.push(
    new Prop(assets.props, P.house, houseX, houseY, {
      feet: { ox: 0, oy: 34, w: 96, h: 46 },
    }),
  );
  prop('mailbox', 11, 14, {
    feet: { ox: 2, oy: 4, w: 12, h: 11 },
    interactPrompt: 'Check mailbox',
    dialog: mailboxDialog(),
  });

  // --- welcome sign at the spawn crossing
  prop('sign', 21, 15, {
    feet: { ox: 0, oy: 6, w: 14, h: 10 },
    interactPrompt: 'Read sign',
    dialog: {
      title: 'Welcome, visitor!',
      subtitle: "Magnus Arnild's world",
      icon: '🗺️',
      sections: [
        {
          lines: [
            'You are controlling Magnus. Walk around and poke at things!',
            '🌳 North — the Education Forest',
            '🌾 South — the Skill Fields',
            '🐑 East — the Hobby Meadow',
            '🏠 West — home sweet home (do go inside)',
          ],
        },
      ],
    },
  });

  // --- scattered decoration
  const bushes: [number, number][] = [
    [4, 20],
    [35, 20],
    [3, 8],
    [25, 12],
    [14, 12],
    [34, 22],
  ];
  for (const [bx, by] of bushes) prop('bush', bx, by, { feet: { ox: 1, oy: 6, w: 14, h: 9 } });
  const rocks: [number, number][] = [
    [5, 26],
    [33, 26],
    [24, 19],
  ];
  for (const [rx, ry] of rocks) prop('rock', rx, ry, { feet: { ox: 1, oy: 8, w: 11, h: 7 } });

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
    spawn: { x: 315, y: 288, facing: 'up' },
  };
}
