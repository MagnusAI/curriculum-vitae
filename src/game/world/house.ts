import { hobbies } from '../../data/hobbies';
import { PROPS, T } from '../atlas';
import { TILE } from '../constants';
import { playTune } from '../engine/audio';
import { bakeLayers, TilemapData } from '../engine/tilemap';
import { Entity } from '../entities/entity';
import { Npc } from '../entities/npc';
import { Prop } from '../entities/prop';
import { bookshelfDialog, hobbyDialog, wifeDialog } from '../content/dialogs';
import { PIANO_TUNE } from '../content/pianoTune';
import { GameAssets, SceneDef } from './scene';

const W = 14;
const H = 10;

export function buildHouse(assets: GameAssets): SceneDef {
  const ground = new Array<number>(W * H).fill(T.VOID);
  const solid = new Uint8Array(W * H);

  const setTile = (x: number, y: number, id: number) => {
    ground[y * W + x] = id;
  };

  // back wall (rows 0-1), floor (rows 2-8), doormat exit (row 9)
  for (let x = 1; x < W - 1; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL_BASE);
  }
  for (let y = 2; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      setTile(x, y, (x + y) % 2 === 0 ? T.FLOOR_A : T.FLOOR_B);
    }
  }
  setTile(6, H - 1, T.DOORMAT);
  setTile(7, H - 1, T.DOORMAT);

  // solid: walls, void border, bottom row except the doormat
  for (let x = 0; x < W; x++) {
    solid[x] = 1;
    solid[W + x] = 1;
    if (x !== 6 && x !== 7) solid[(H - 1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    solid[y * W] = 1;
    solid[y * W + W - 1] = 1;
  }

  const entities: Entity[] = [];
  const P = PROPS;

  const prop = (
    name: keyof typeof PROPS,
    px: number,
    py: number,
    options?: ConstructorParameters<typeof Prop>[4],
  ) => {
    entities.push(new Prop(assets.props, P[name], px, py, options));
  };

  // rug in the middle of the room (flat, walkable)
  prop('rug', 88, 76, { solid: false, flat: true, feet: { ox: 0, oy: 0, w: 48, h: 32 } });

  const pianoHobby = hobbies.find((h) => h.spot === 'piano');
  const deskHobby = hobbies.find((h) => h.spot === 'desk');

  // piano against the back wall, left
  prop('piano', 20, 16, {
    feet: { ox: 0, oy: 18, w: 32, h: 14 },
    interactPrompt: 'Play the piano',
    dialog: pianoHobby
      ? hobbyDialog(pianoHobby, 'You just heard a few bars of Für Elise. It sounds better in person, promise.')
      : undefined,
    onInteract: () => playTune(PIANO_TUNE, 170),
  });

  // computer desk — the gaming & tinkering hobby
  prop('desk', 144, 24, {
    feet: { ox: 0, oy: 12, w: 32, h: 12 },
    interactPrompt: 'Check the computer',
    dialog: deskHobby ? hobbyDialog(deskHobby) : undefined,
  });

  // bookshelf — about this CV
  prop('bookshelf', 104, 8, {
    feet: { ox: 0, oy: 20, w: 16, h: 10 },
    interactPrompt: 'Browse the bookshelf',
    dialog: bookshelfDialog(),
  });

  // kitchen corner
  prop('counter', 180, 22, { feet: { ox: 0, oy: 4, w: 16, h: 12 } });
  prop('fridge', 196, 12, { feet: { ox: 1, oy: 12, w: 14, h: 12 } });

  // bed by the left wall
  prop('bed', 18, 76, { feet: { ox: 0, oy: 8, w: 32, h: 23 } });

  // table + chairs on the rug
  prop('table', 96, 80, { feet: { ox: 0, oy: 8, w: 32, h: 14 } });
  prop('chair', 78, 84, { feet: { ox: 3, oy: 8, w: 10, h: 7 } });
  prop('chair', 132, 84, { feet: { ox: 3, oy: 8, w: 10, h: 7 } });

  // plants in the corners
  prop('plant', 18, 108, { feet: { ox: 3, oy: 14, w: 10, h: 9 } });
  prop('plant', 190, 108, { feet: { ox: 3, oy: 14, w: 10, h: 9 } });

  // the wife, near the kitchen
  entities.push(new Npc(170, 96, assets.wife, 'Talk to Wife', wifeDialog()));

  const map: TilemapData = { w: W, h: H, layers: [ground], solid };

  return {
    name: 'house',
    map,
    ground: bakeLayers(W, H, [ground], assets.tileset),
    entities,
    triggers: [
      {
        // stepping on the doormat leaves the house
        rect: { x: 6 * TILE, y: (H - 1) * TILE + 2, w: 2 * TILE, h: 10 },
        target: 'overworld',
        spawn: { x: 107, y: 314, facing: 'down' },
      },
    ],
    spawn: { x: 107, y: 136, facing: 'up' },
  };
}
