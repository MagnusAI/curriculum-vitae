import { education } from '../../data/education';
import { PROPS, T } from '../atlas';
import { TILE } from '../constants';
import { bakeLayers, TilemapData } from '../engine/tilemap';
import { Entity } from '../entities/entity';
import { Npc } from '../entities/npc';
import { Prop } from '../entities/prop';
import { educationDialog, mountainGuideDialog } from '../content/dialogs';
import { GameAssets, SceneDef } from './scene';

const W = 40;
const H = 36;

// The mountain rises as a triangle: apex near the top, base at row BASE_ROW.
const APEX = { x: 20, y: 2 };
const BASE_ROW = 30;
const BASE_HALF = 18;
const SNOW_ROWS = 9; // rows APEX.y..APEX.y+SNOW_ROWS are snow-capped

// The serpentine trail, carved through the (otherwise solid) rock as
// horizontal switchbacks joined by short climbs. Two tiles wide.
const TRAIL_SEGMENTS: { x0: number; x1: number; y0: number; y1: number }[] = [
  { x0: 19, x1: 20, y0: 29, y1: 35 }, // entrance from the bottom edge
  { x0: 9, x1: 20, y0: 27, y1: 28 }, // switchback 1 (west)
  { x0: 9, x1: 10, y0: 24, y1: 28 },
  { x0: 9, x1: 30, y0: 24, y1: 25 }, // switchback 2 (east)
  { x0: 29, x1: 30, y0: 20, y1: 25 },
  { x0: 12, x1: 30, y0: 20, y1: 21 }, // switchback 3 (west)
  { x0: 12, x1: 13, y0: 16, y1: 21 },
  { x0: 12, x1: 26, y0: 16, y1: 17 }, // switchback 4 (east)
  { x0: 25, x1: 26, y0: 12, y1: 17 },
  { x0: 16, x1: 26, y0: 12, y1: 13 }, // switchback 5 (west)
  { x0: 16, x1: 17, y0: 8, y1: 13 },
  { x0: 16, x1: 22, y0: 8, y1: 9 }, // final traverse into the snow
  { x0: 21, x1: 22, y0: 4, y1: 9 }, // last climb
  { x0: 17, x1: 22, y0: 4, y1: 5 }, // summit plateau
];

// Education signs along the trail, chronological from the base. Extend if
// more entries are added.
const SIGN_SLOTS: [number, number][] = [
  [17, 29], // beside the trail entrance
  [8, 26], // west turn of switchback 1→2
  [31, 22], // east turn of switchback 2→3
  [11, 18], // west turn of switchback 3→4
  [18, 4], // the summit
  [27, 14],
];

// The slopes keep widening past BASE_ROW so the mountain's foot fills the
// bottom of the map — everything around it is sky.
function insideMountain(x: number, y: number): boolean {
  if (y < APEX.y) return false;
  const half = ((y - APEX.y) / (BASE_ROW - APEX.y)) * BASE_HALF;
  return Math.abs(x - APEX.x) <= half;
}

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

export function buildMountain(assets: GameAssets): SceneDef {
  const ground = new Array<number>(W * H);
  const solid = new Uint8Array(W * H);
  const r = rng(4711);

  // sky all around — the mountain floats above the world. Nothing outside
  // the rock is walkable.
  solid.fill(1);
  for (let i = 0; i < W * H; i++) {
    ground[i] = r() < 0.6 ? T.SKY_A : T.SKY_B;
  }

  const setTile = (x: number, y: number, id: number) => {
    ground[y * W + x] = id;
  };
  const markSolid = (x: number, y: number, isSolid = true) => {
    solid[y * W + x] = isSolid ? 1 : 0;
  };

  // drifting clouds (two tiles wide), only in open sky
  const CLOUDS: [number, number][] = [
    [2, 6],
    [33, 4],
    [4, 16],
    [35, 13],
    [1, 24],
    [36, 21],
    [8, 2],
    [28, 8],
    [6, 10],
  ];
  for (const [cx, cy] of CLOUDS) {
    if (insideMountain(cx, cy) || insideMountain(cx + 1, cy)) continue;
    setTile(cx, cy, T.CLOUD_A);
    setTile(cx + 1, cy, T.CLOUD_B);
  }

  // the mountain body: solid rock, snow near the apex
  for (let y = APEX.y; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!insideMountain(x, y)) continue;
      const snow = y < APEX.y + SNOW_ROWS;
      setTile(x, y, snow ? T.SNOW : r() < 0.5 ? T.ROCK_A : T.ROCK_B);
    }
  }

  // carve the trail
  for (const seg of TRAIL_SEGMENTS) {
    for (let y = seg.y0; y <= seg.y1; y++) {
      for (let x = seg.x0; x <= seg.x1; x++) {
        setTile(x, y, T.PATH);
        markSolid(x, y, false);
      }
    }
  }

  // map edges
  for (let x = 0; x < W; x++) {
    solid[x] = 1;
    solid[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    solid[y * W] = 1;
    solid[y * W + W - 1] = 1;
  }
  // exit gap at the bottom edge (walk south to leave)
  for (let x = 19; x <= 20; x++) solid[(H - 1) * W + x] = 0;

  const entities: Entity[] = [];
  const P = PROPS;

  const prop = (
    name: keyof typeof PROPS,
    tx: number,
    ty: number,
    options?: ConstructorParameters<typeof Prop>[4],
  ) => {
    entities.push(new Prop(assets.props, P[name], tx * TILE, ty * TILE, options));
  };

  // education signs along the trail, oldest at the bottom
  const educationChrono = [...education].reverse();
  if (educationChrono.length > SIGN_SLOTS.length) {
    console.warn(
      `mountain: ${educationChrono.length} education entries but only ${SIGN_SLOTS.length} sign slots — extend SIGN_SLOTS`,
    );
  }
  const teleportHome = { label: '🏠 Teleport back home', type: 'teleport-home' as const };
  const summitIndex = Math.min(educationChrono.length, SIGN_SLOTS.length) - 1;
  educationChrono.slice(0, SIGN_SLOTS.length).forEach((item, i) => {
    const [sx, sy] = SIGN_SLOTS[i];
    const dialog = educationDialog(item);
    // the top sign offers a shortcut back down so nobody has to walk
    if (i === summitIndex) dialog.action = teleportHome;
    prop('sign', sx, sy, {
      feet: { ox: 0, oy: 6, w: 14, h: 10 },
      interactPrompt: 'Read waymark',
      dialog,
    });
  });

  // the mountain guide greets climbers where the trail begins
  entities.push(
    new Npc(18 * TILE + 3, 31 * TILE + 4, assets.npcGuide, 'Talk to the mountain guide', mountainGuideDialog()),
  );

  // the summit flag
  prop('flag', 20, 4, {
    feet: { ox: 3, oy: 22, w: 10, h: 6 },
    interactPrompt: 'You made it!',
    dialog: {
      title: 'The Summit',
      subtitle: 'Education complete',
      icon: '🚩',
      sections: [
        {
          lines: [
            'From high school at the bottom to a Master of Science up here — that’s the whole climb.',
            'Enjoy the view — and take the shortcut down whenever you like.',
          ],
        },
      ],
      action: teleportHome,
    },
  });

  // decoration: cairns at the turns, boulders and hardy pines on the rock
  for (const [cx, cy] of [
    [10, 26],
    [29, 23],
    [13, 19],
    [25, 15],
  ] as const) {
    prop('cairn', cx, cy, { feet: { ox: 1, oy: 8, w: 13, h: 8 } });
  }
  for (const [px, py] of [
    [5, 32],
    [12, 32],
    [27, 32],
    [34, 31],
    [7, 28],
    [33, 27],
  ] as const) {
    const region = r() < 0.5 ? P.tree_pine_m : P.tree_pine_s;
    entities.push(
      new Prop(assets.props, region, px * TILE + Math.floor((TILE - region.w) / 2), (py + 1) * TILE - region.h, {
        feet: { ox: Math.floor(region.w / 2) - 6, oy: region.h - 8, w: 12, h: 8 },
      }),
    );
  }
  for (const [rx, ry] of [
    [7, 31],
    [31, 29],
    [24, 28],
    [15, 23],
  ] as const) {
    prop('rock', rx, ry, { feet: { ox: 1, oy: 8, w: 11, h: 7 } });
  }

  const map: TilemapData = { w: W, h: H, layers: [ground], solid };

  return {
    name: 'mountain',
    map,
    ground: bakeLayers(W, H, [ground], assets.tileset),
    entities,
    triggers: [
      {
        // walking off the south edge returns to the overworld
        rect: { x: 18 * TILE, y: (H - 1) * TILE + 4, w: 4 * TILE, h: 12 },
        target: 'overworld',
        spawn: { x: 27 * TILE + 3, y: 9 * TILE + 2, facing: 'down' },
      },
    ],
    spawn: { x: 19 * TILE + 11, y: (H - 2) * TILE, facing: 'up' },
  };
}
