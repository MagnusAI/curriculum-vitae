// One-time pixel-art generator. Run: node scripts/generate-art.mjs
// Writes sprite sheets to src/assets/game/ and the atlas map to
// src/game/atlas.ts. Set PREVIEW_DIR to also write 4x-scaled previews.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'assets', 'game');
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- PNG encoder
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- image utils
function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
}

class Img {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = Buffer.alloc(w * h * 4);
  }
  set(x, y, c) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = c[3];
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  // grid: array of equal-length strings; pal: char -> color; '.' transparent
  grid(rows, pal, ox = 0, oy = 0, mirror = false) {
    const w = rows[0].length;
    for (const r of rows) {
      if (r.length !== w) throw new Error(`ragged grid row: "${r}" (${r.length} != ${w})`);
    }
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][mirror ? w - 1 - x : x];
        if (ch === '.') continue;
        const c = pal[ch];
        if (!c) throw new Error(`no palette entry for "${ch}"`);
        this.set(ox + x, oy + y, c);
      }
    }
  }
  blit(src, sx, sy, w, h, dx, dy) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = ((sy + y) * src.w + sx + x) * 4;
        if (src.data[i + 3] === 0) continue;
        this.set(dx + x, dy + y, [src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3]]);
      }
  }
  scaled(f) {
    const out = new Img(this.w * f, this.h * f);
    for (let y = 0; y < out.h; y++)
      for (let x = 0; x < out.w; x++) {
        const i = ((y / f | 0) * this.w + (x / f | 0)) * 4;
        out.set(x, y, [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]]);
      }
    return out;
  }
}

function save(name, img) {
  writeFileSync(join(OUT, name), encodePng(img.w, img.h, img.data));
  if (process.env.PREVIEW_DIR) {
    mkdirSync(process.env.PREVIEW_DIR, { recursive: true });
    const big = img.scaled(4);
    writeFileSync(join(process.env.PREVIEW_DIR, name), encodePng(big.w, big.h, big.data));
  }
  console.log(`wrote ${name} (${img.w}x${img.h})`);
}

// mulberry32 — deterministic noise so regeneration is stable
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- palette
const C = {
  outline: hex('#2b2018'),
  // terrain
  grass: hex('#7dbf4e'),
  grassDark: hex('#6fae44'),
  grassLight: hex('#8ccb5d'),
  flowerRed: hex('#d9534f'),
  flowerYellow: hex('#f0c33c'),
  flowerWhite: hex('#f5f2e8'),
  path: hex('#d9b380'),
  pathDark: hex('#c49a63'),
  soil: hex('#8a5a33'),
  soilDark: hex('#754b29'),
  // interior
  floor: hex('#c8945f'),
  floorDark: hex('#b07f4e'),
  floorLine: hex('#9a6d41'),
  wall: hex('#a3765a'),
  wallDark: hex('#8a6249'),
  wallBase: hex('#6e4e3a'),
  voidBlack: hex('#1a1410'),
  matStraw: hex('#c9a566'),
  matDark: hex('#b08d52'),
  // wood / props
  wood: hex('#a97c50'),
  woodDark: hex('#8a6440'),
  woodDarker: hex('#6e4e30'),
  // tree
  leaf: hex('#4f9639'),
  leafDark: hex('#3f7d2e'),
  leafLight: hex('#66b04a'),
  pine: hex('#3a8257'),
  pineDark: hex('#2e6b46'),
  pineLight: hex('#4d9c6b'),
  trunk: hex('#7a5230'),
  trunkDark: hex('#5f3f24'),
  // mountain
  rock: hex('#9a948c'),
  rockDark: hex('#7f7a72'),
  rockLight: hex('#b0aaa2'),
  cliff: hex('#6e6862'),
  cliffDark: hex('#57524c'),
  snow: hex('#eef2f8'),
  snowShade: hex('#d8e2ee'),
  // campsite
  canvasGreen: hex('#5c8a4a'),
  canvasDark: hex('#4a7039'),
  canvasLight: hex('#6e9e5a'),
  flame: hex('#f2913d'),
  flameLight: hex('#f8c53a'),
  flameDark: hex('#d95f2b'),
};

// ============================================================ tileset (ground)
const TILE = 16;
const TILE_NAMES = [
  'GRASS_A', 'GRASS_B', 'GRASS_FLOWER_R', 'GRASS_FLOWER_Y', 'GRASS_TUFT',
  'PATH', 'SOIL', 'FLOOR_A', 'FLOOR_B', 'WALL', 'WALL_BASE', 'VOID', 'DOORMAT',
  'ROCK_A', 'ROCK_B', 'CLIFF', 'SNOW', 'WATER_A', 'WATER_B',
  'SKY_A', 'SKY_B', 'CLOUD_A', 'CLOUD_B',
];
const TILESET_COLS = 16;

function drawGrassBase(img, ox, oy, seed) {
  const r = rng(seed);
  img.rect(ox, oy, TILE, TILE, C.grass);
  for (let i = 0; i < 26; i++) {
    const x = (r() * TILE) | 0;
    const y = (r() * TILE) | 0;
    img.set(ox + x, oy + y, r() < 0.5 ? C.grassDark : C.grassLight);
  }
}

function drawTileset() {
  const rows = Math.ceil(TILE_NAMES.length / TILESET_COLS);
  const img = new Img(TILESET_COLS * TILE, rows * TILE);
  // helpers return [x, y] px position of a named tile
  const atX = (name) => (TILE_NAMES.indexOf(name) % TILESET_COLS) * TILE;
  const atY = (name) => Math.floor(TILE_NAMES.indexOf(name) / TILESET_COLS) * TILE;
  const at = (name) => {
    if (atY(name) !== 0) throw new Error(`tile ${name} not on row 0 — use atX/atY`);
    return atX(name);
  };

  drawGrassBase(img, at('GRASS_A'), 0, 11);
  drawGrassBase(img, at('GRASS_B'), 0, 47);

  drawGrassBase(img, at('GRASS_FLOWER_R'), 0, 3);
  img.grid(
    ['....y...........', '...yry..........', '....y.......y...', '...........yry..', '............y...'],
    { y: C.flowerYellow, r: C.flowerRed },
    at('GRASS_FLOWER_R'),
    4,
  );
  drawGrassBase(img, at('GRASS_FLOWER_Y'), 0, 5);
  img.grid(
    ['..w.........w...', '.wyw.......wyw..', '..w.........w...', '.......w........', '......wyw.......', '.......w........'],
    { w: C.flowerWhite, y: C.flowerYellow },
    at('GRASS_FLOWER_Y'),
    3,
  );
  drawGrassBase(img, at('GRASS_TUFT'), 0, 7);
  img.grid(
    ['..d..d......d...', '..d..d.....d.d..', '.....d..........', '.........d......', '....d....d......', '....d...........'],
    { d: C.leafDark },
    at('GRASS_TUFT'),
    6,
  );

  // path
  {
    const r = rng(21);
    img.rect(at('PATH'), 0, TILE, TILE, C.path);
    for (let i = 0; i < 20; i++) {
      img.set(at('PATH') + ((r() * TILE) | 0), (r() * TILE) | 0, C.pathDark);
    }
  }
  // tilled soil: horizontal furrows
  {
    img.rect(at('SOIL'), 0, TILE, TILE, C.soil);
    for (let y = 1; y < TILE; y += 4) img.rect(at('SOIL'), y, TILE, 2, C.soilDark);
  }
  // wood floor planks
  for (const [name, seed] of [['FLOOR_A', 5], ['FLOOR_B', 9]]) {
    const ox = at(name);
    const r = rng(seed);
    img.rect(ox, 0, TILE, TILE, C.floor);
    for (let y = 0; y < TILE; y += 4) {
      img.rect(ox, y, TILE, 1, C.floorLine);
      const gap = 2 + ((r() * 12) | 0);
      img.rect(ox + gap, y, 1, 4, C.floorLine);
    }
    for (let i = 0; i < 6; i++) img.set(ox + ((r() * TILE) | 0), (r() * TILE) | 0, C.floorDark);
  }
  // interior wall + baseboard
  {
    const ox = at('WALL');
    img.rect(ox, 0, TILE, TILE, C.wall);
    for (let y = 3; y < TILE; y += 5) img.rect(ox, y, TILE, 1, C.wallDark);
    const ox2 = at('WALL_BASE');
    img.rect(ox2, 0, TILE, TILE, C.wall);
    for (let y = 3; y < 10; y += 5) img.rect(ox2, y, TILE, 1, C.wallDark);
    img.rect(ox2, 11, TILE, 5, C.wallBase);
    img.rect(ox2, 11, TILE, 1, C.outline);
  }
  img.rect(at('VOID'), 0, TILE, TILE, C.voidBlack);
  // doormat
  {
    const ox = at('DOORMAT');
    img.rect(ox, 0, TILE, TILE, C.matStraw);
    for (let y = 0; y < TILE; y += 2) img.rect(ox, y, TILE, 1, C.matDark);
    img.rect(ox, 0, TILE, 1, C.outline);
    img.rect(ox, TILE - 1, TILE, 1, C.outline);
    img.rect(ox, 0, 1, TILE, C.outline);
    img.rect(ox + TILE - 1, 0, 1, TILE, C.outline);
  }
  // rock plateau variants
  for (const [name, seed] of [['ROCK_A', 61], ['ROCK_B', 89]]) {
    const ox = at(name);
    const r = rng(seed);
    img.rect(ox, 0, TILE, TILE, C.rock);
    for (let i = 0; i < 22; i++) {
      img.set(ox + ((r() * TILE) | 0), (r() * TILE) | 0, r() < 0.5 ? C.rockDark : C.rockLight);
    }
    if (r() < 0.6) {
      const cx = 2 + ((r() * 11) | 0);
      const cy = 2 + ((r() * 11) | 0);
      img.rect(ox + cx, cy, 3, 1, C.rockDark);
      img.set(ox + cx + 1, cy + 1, C.rockDark);
    }
  }
  // cliff face (south edge of a terrace)
  {
    const ox = at('CLIFF');
    const r = rng(37);
    img.rect(ox, 0, TILE, TILE, C.cliff);
    img.rect(ox, 0, TILE, 2, C.rockLight); // top lip catches light
    img.rect(ox, 2, TILE, 1, C.rockDark);
    for (let i = 0; i < 5; i++) {
      const x = (r() * TILE) | 0;
      const y = 4 + ((r() * 8) | 0);
      img.rect(ox + x, y, 1, 3 + ((r() * 5) | 0), C.cliffDark);
    }
    img.rect(ox, TILE - 2, TILE, 2, C.cliffDark);
    img.rect(ox, TILE - 1, TILE, 1, C.outline);
  }
  // snow (summit)
  {
    const ox = atX('SNOW');
    const oy = atY('SNOW');
    const r = rng(101);
    img.rect(ox, oy, TILE, TILE, C.snow);
    for (let i = 0; i < 14; i++) {
      img.set(ox + ((r() * TILE) | 0), oy + ((r() * TILE) | 0), C.snowShade);
    }
    img.set(ox + 4, oy + 5, hex('#ffffff'));
    img.set(ox + 11, oy + 10, hex('#ffffff'));
  }
  // water variants
  for (const [name, seed] of [['WATER_A', 71], ['WATER_B', 137]]) {
    const ox = atX(name);
    const oy = atY(name);
    const r = rng(seed);
    img.rect(ox, oy, TILE, TILE, hex('#4fa4d8'));
    for (let i = 0; i < 4; i++) {
      const wx = (r() * (TILE - 5)) | 0;
      const wy = 2 + ((r() * (TILE - 4)) | 0);
      img.rect(ox + wx, oy + wy, 3 + ((r() * 3) | 0), 1, hex('#6fbde8'));
    }
    for (let i = 0; i < 5; i++) {
      img.set(ox + ((r() * TILE) | 0), oy + ((r() * TILE) | 0), hex('#3f89bd'));
    }
    img.rect(ox, oy, TILE, 1, hex('#3f89bd'));
  }
  // sky variants (mountain scene backdrop)
  const skyBase = hex('#a9d6f5');
  const skyLight = hex('#c2e4fb');
  for (const [name, seed] of [['SKY_A', 55], ['SKY_B', 91]]) {
    const ox = atX(name);
    const oy = atY(name);
    const r = rng(seed);
    img.rect(ox, oy, TILE, TILE, skyBase);
    for (let i = 0; i < 3; i++) {
      const wx = (r() * (TILE - 6)) | 0;
      const wy = (r() * TILE) | 0;
      img.rect(ox + wx, oy + wy, 4 + ((r() * 3) | 0), 1, skyLight);
    }
  }
  // two-tile cloud (left + right halves)
  {
    const cloudWhite = hex('#f7fbff');
    const cloudShade = hex('#dcebf8');
    for (const [name, isLeft] of [['CLOUD_A', true], ['CLOUD_B', false]]) {
      const ox = atX(name);
      const oy = atY(name);
      img.rect(ox, oy, TILE, TILE, skyBase);
      // puffy half-blob: full on the inner edge, rounded on the outer
      for (let y = 4; y < 13; y++) {
        const roundness = y < 6 || y > 10 ? 3 : 0;
        const x0 = isLeft ? roundness : 0;
        const x1 = isLeft ? TILE : TILE - roundness;
        for (let x = x0; x < x1; x++) {
          img.set(ox + x, oy + y, y > 10 ? cloudShade : cloudWhite);
        }
      }
    }
  }
  return img;
}

// ============================================================ props
const propRegions = {};
const propsImg = new Img(512, 512);
let cursorX = 0;
let cursorY = 0;
let rowH = 0;

function addProp(name, w, h, draw) {
  if (cursorX + w > propsImg.w) {
    cursorX = 0;
    cursorY += rowH;
    rowH = 0;
  }
  rowH = Math.max(rowH, h);
  draw(propsImg, cursorX, cursorY);
  propRegions[name] = { x: cursorX, y: cursorY, w, h };
  cursorX += w;
}

function drawTree(img, ox, oy) {
  const r = rng(77);
  // canopy: rounded blob 32x24
  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = (x - 15.5) / 15.5;
      const dy = (y - 11.5) / 11.5;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      let c = C.leaf;
      if (d > 0.72) c = C.leafDark;
      else if (dx < 0.2 && dy < -0.1 && r() < 0.5) c = C.leafLight;
      if (d > 0.9) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
  for (let i = 0; i < 20; i++) {
    img.set(ox + 4 + ((r() * 24) | 0), oy + 4 + ((r() * 16) | 0), r() < 0.5 ? C.leafDark : C.leafLight);
  }
  // trunk
  img.rect(ox + 12, oy + 22, 8, 10, C.trunk);
  img.rect(ox + 12, oy + 22, 2, 10, C.trunkDark);
  img.rect(ox + 11, oy + 22, 1, 10, C.outline);
  img.rect(ox + 20, oy + 22, 1, 10, C.outline);
  img.rect(ox + 12, oy + 31, 8, 1, C.outline);
  // roots
  img.set(ox + 10, oy + 31, C.outline);
  img.set(ox + 21, oy + 31, C.outline);
}

function drawPine(img, ox, oy) {
  const r = rng(31);
  // three triangle layers
  const layers = [
    { top: 0, h: 10, half: 7 },
    { top: 7, h: 11, half: 11 },
    { top: 15, h: 12, half: 14 },
  ];
  for (const L of layers) {
    for (let y = 0; y < L.h; y++) {
      const half = Math.max(1, Math.round((y / L.h) * L.half));
      for (let x = 16 - half; x < 16 + half; x++) {
        let c = C.pine;
        if (x < 16 - half + 2) c = C.pineLight;
        if (x > 16 + half - 3) c = C.pineDark;
        if (y === L.h - 1 || x === 16 - half || x === 16 + half - 1) c = C.pineDark;
        img.set(ox + x, oy + L.top + y, c);
      }
    }
  }
  for (let i = 0; i < 14; i++) img.set(ox + 8 + ((r() * 16) | 0), oy + 6 + ((r() * 18) | 0), C.pineLight);
  img.rect(ox + 13, oy + 26, 6, 6, C.trunk);
  img.rect(ox + 13, oy + 26, 2, 6, C.trunkDark);
  img.rect(ox + 12, oy + 26, 1, 6, C.outline);
  img.rect(ox + 19, oy + 26, 1, 6, C.outline);
}

// ---- parametric career trees: species (oak/pine/fruit) × size (s/m/l) ----
// Sprite sizes: s = 16x24, m = 24x28, l = 32x32.
const TREE_SIZES = {
  s: { w: 16, h: 24, canopyH: 14, trunkW: 4, trunkH: 8 },
  m: { w: 24, h: 28, canopyH: 18, trunkW: 6, trunkH: 9 },
  l: { w: 32, h: 32, canopyH: 22, trunkW: 8, trunkH: 10 },
};

function drawCanopyTree(img, ox, oy, size, seed, { fruit = false, birch = false } = {}) {
  const s = TREE_SIZES[size];
  const r = rng(seed);
  const cx = s.w / 2 - 0.5;
  const cy = s.canopyH / 2 - 0.5;
  const leaf = birch ? hex('#8fce6a') : C.leaf;
  const leafDark = birch ? hex('#6cb04a') : C.leafDark;
  const leafLight = birch ? hex('#b3e28e') : C.leafLight;
  for (let y = 0; y < s.canopyH; y++) {
    for (let x = 0; x < s.w; x++) {
      const dx = (x - cx) / (s.w / 2 - 0.5);
      const dy = (y - cy) / (s.canopyH / 2 - 0.5);
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      let c = leaf;
      if (d > 0.72) c = leafDark;
      else if (dx < 0.2 && dy < -0.1 && r() < 0.5) c = leafLight;
      if (d > 0.9) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
  for (let i = 0; i < s.w; i++) {
    img.set(ox + 2 + ((r() * (s.w - 4)) | 0), oy + 2 + ((r() * (s.canopyH - 4)) | 0), r() < 0.5 ? leafDark : leafLight);
  }
  if (fruit) {
    const fruits = size === 's' ? 3 : size === 'm' ? 5 : 7;
    for (let i = 0; i < fruits; i++) {
      const fx = ox + 3 + ((r() * (s.w - 6)) | 0);
      const fy = oy + 3 + ((r() * (s.canopyH - 6)) | 0);
      img.set(fx, fy, hex('#d9534f'));
      img.set(fx + 1, fy, hex('#b5382f'));
    }
  }
  // trunk (birch: pale bark with dark horizontal dashes)
  const trunkMain = birch ? hex('#e9e5da') : C.trunk;
  const trunkShade = birch ? hex('#c9c4b6') : C.trunkDark;
  const tx = ox + Math.floor((s.w - s.trunkW) / 2);
  const ty = oy + s.h - s.trunkH;
  img.rect(tx, ty - 2, s.trunkW, s.trunkH + 2, trunkMain);
  img.rect(tx, ty - 2, Math.max(1, s.trunkW >> 2), s.trunkH + 2, trunkShade);
  if (birch) {
    for (let y = ty; y < oy + s.h - 1; y += 3) {
      img.rect(tx + 1 + (((y / 3) | 0) % 2) * Math.max(1, s.trunkW - 3), y, Math.max(2, s.trunkW >> 1), 1, hex('#3a352e'));
    }
  }
  img.rect(tx - 1, ty, 1, s.trunkH, C.outline);
  img.rect(tx + s.trunkW, ty, 1, s.trunkH, C.outline);
  img.rect(tx, oy + s.h - 1, s.trunkW, 1, C.outline);
}

function drawPineTree(img, ox, oy, size, seed) {
  const s = TREE_SIZES[size];
  const r = rng(seed);
  const layers = 3;
  const layerH = Math.ceil(s.canopyH / layers) + 2;
  for (let L = 0; L < layers; L++) {
    const top = Math.floor((L * s.canopyH) / layers) - (L > 0 ? 2 : 0);
    const maxHalf = ((L + 1.6) / (layers + 0.6)) * (s.w / 2 - 0.5);
    for (let y = 0; y < layerH; y++) {
      const half = Math.max(1, Math.round(((y + 1) / layerH) * maxHalf));
      for (let x = Math.floor(s.w / 2 - half); x < Math.ceil(s.w / 2 + half); x++) {
        let c = C.pine;
        if (x < s.w / 2 - half + 2) c = C.pineLight;
        if (x > s.w / 2 + half - 3) c = C.pineDark;
        if (y === layerH - 1) c = C.pineDark;
        img.set(ox + x, oy + top + y, c);
      }
    }
  }
  for (let i = 0; i < s.w / 2; i++) {
    img.set(ox + 3 + ((r() * (s.w - 6)) | 0), oy + 3 + ((r() * (s.canopyH - 4)) | 0), C.pineLight);
  }
  const tx = ox + Math.floor((s.w - s.trunkW) / 2);
  const ty = oy + s.h - s.trunkH;
  img.rect(tx, ty, s.trunkW, s.trunkH, C.trunk);
  img.rect(tx, ty, Math.max(1, s.trunkW >> 2), s.trunkH, C.trunkDark);
  img.rect(tx - 1, ty, 1, s.trunkH, C.outline);
  img.rect(tx + s.trunkW, ty, 1, s.trunkH, C.outline);
}

// ---- mountain checkpoints ----
function drawCairn(img, ox, oy) {
  // stacked flat slabs — light tops, dark sides, visible gaps between layers
  img.grid(
    [
      '......OOOO......',
      '.....OllllO.....',
      '.....OddddO.....',
      '....OOOOOOOO....',
      '...OllllllllO...',
      '...OmmmmmmddO...',
      '...OOOOOOOOOO...',
      '..OllllllllllO..',
      '..OlmmmmmmmddO..',
      '..OmmddddddddO..',
      '..OOOOOOOOOOOO..',
    ],
    { O: C.outline, l: hex('#c6c0b6'), m: hex('#a8a29a'), d: hex('#847e76') },
    ox,
    oy + 5,
  );
}

function drawCabin(img, ox, oy) {
  const W = 48;
  // roof
  const roofDark = hex('#5a4632');
  const roof = hex('#6e5740');
  for (let y = 0; y < 14; y++) {
    const inset = Math.max(0, 5 - y);
    for (let x = inset; x < W - inset; x++) {
      let c = y % 4 === 3 ? roofDark : roof;
      if (x === inset || x === W - inset - 1 || y === 0) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
  // log walls
  for (let y = 14; y < 38; y++) {
    for (let x = 0; x < W; x++) {
      let c = (y - 14) % 4 < 2 ? C.wood : C.woodDark;
      if (x === 0 || x === W - 1 || y === 37) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
  // door + window
  img.rect(ox + 20, oy + 22, 10, 16, C.woodDarker);
  img.rect(ox + 21, oy + 23, 8, 15, hex('#4a3020'));
  img.rect(ox + 8, oy + 20, 9, 9, C.outline);
  img.rect(ox + 9, oy + 21, 7, 7, hex('#f8c53a')); // warm lit window
  img.rect(ox + 12, oy + 21, 1, 7, C.woodDarker);
  img.rect(ox + 9, oy + 24, 7, 1, C.woodDarker);
  img.rect(ox + 34, oy + 24, 6, 5, C.outline);
  img.rect(ox + 35, oy + 25, 4, 3, hex('#9ed4e8'));
}

function drawTower(img, ox, oy) {
  const W = 32;
  // roof
  for (let y = 0; y < 8; y++) {
    const half = Math.round(((y + 2) / 9) * (W / 2 - 1));
    for (let x = W / 2 - half; x < W / 2 + half; x++) {
      img.set(ox + x, oy + y, y === 7 || x === W / 2 - half || x === W / 2 + half - 1 ? C.outline : hex('#b5482a'));
    }
  }
  // platform + railing
  img.rect(ox + 3, oy + 12, 26, 3, C.woodDark);
  img.rect(ox + 3, oy + 12, 26, 1, hex('#c99a6a'));
  for (let x = 4; x < 28; x += 5) img.rect(ox + x, oy + 8, 2, 4, C.wood);
  img.rect(ox + 3, oy + 8, 1, 7, C.outline);
  img.rect(ox + 28, oy + 8, 1, 7, C.outline);
  // legs with cross brace
  img.rect(ox + 5, oy + 15, 3, 31, C.wood);
  img.rect(ox + 24, oy + 15, 3, 31, C.wood);
  img.rect(ox + 5, oy + 15, 1, 31, hex('#c99a6a'));
  img.rect(ox + 26, oy + 15, 1, 31, C.woodDark);
  img.rect(ox + 4, oy + 15, 1, 31, C.outline);
  img.rect(ox + 27, oy + 15, 1, 31, C.outline);
  for (let i = 0; i < 16; i++) {
    img.set(ox + 8 + i, oy + 20 + i, C.woodDark);
    img.set(ox + 23 - i, oy + 20 + i, C.woodDark);
  }
  // ladder
  img.rect(ox + 14, oy + 15, 1, 31, C.woodDarker);
  img.rect(ox + 17, oy + 15, 1, 31, C.woodDarker);
  for (let y = 17; y < 46; y += 4) img.rect(ox + 14, oy + y, 4, 1, C.woodDarker);
  img.rect(ox + 5, oy + 45, 22, 1, C.outline);
}

function drawFlag(img, ox, oy) {
  // summit flag: pole with a red pennant
  img.rect(ox + 6, oy + 2, 2, 24, hex('#c8c4b8'));
  img.rect(ox + 6, oy + 2, 1, 24, hex('#f0ede4'));
  img.rect(ox + 5, oy + 2, 1, 24, C.outline);
  img.rect(ox + 8, oy + 2, 1, 24, C.outline);
  img.rect(ox + 5, oy + 1, 4, 1, C.outline);
  img.grid(
    [
      'ORRRRRRR.',
      'ORRRRRRRO',
      'ORRRRRO..',
      'ORRRO....',
      'ORO......',
    ],
    { O: C.outline, R: hex('#d9534f') },
    ox + 9,
    oy + 2,
  );
  img.rect(ox + 4, oy + 26, 8, 2, hex('#847e76'));
  img.rect(ox + 4, oy + 26, 8, 1, hex('#a8a29a'));
}

// ---- campsite ----
function drawTent(img, ox, oy) {
  const W = 32;
  const H = 26;
  for (let y = 0; y < H; y++) {
    const half = Math.max(1, Math.round(((y + 2) / (H + 2)) * (W / 2 - 1)));
    for (let x = W / 2 - half; x < W / 2 + half; x++) {
      let c = C.canvasGreen;
      if (x < W / 2 - half + 2) c = C.canvasLight;
      if (x > W / 2 + half - 3) c = C.canvasDark;
      if (x === W / 2 - half || x === W / 2 + half - 1 || y === H - 1 || y < 2) c = C.outline;
      img.set(ox + x, oy + 2 + y, c);
    }
  }
  // opening
  for (let y = 10; y < H; y++) {
    const half = Math.round(((y - 8) / (H - 8)) * 5);
    for (let x = W / 2 - half; x < W / 2 + half; x++) {
      img.set(ox + x, oy + 2 + y, y === 10 || Math.abs(x - W / 2) === half - 1 ? C.canvasDark : hex('#2b2018'));
    }
  }
  // pole tip
  img.rect(ox + W / 2 - 1, oy, 2, 3, C.woodDarker);
}

function drawCampfireFrame(img, ox, oy, tall) {
  // stone ring + crossed logs
  img.grid(
    [
      '................',
      '..O..........O..',
      '.OgO...OO...OgO.',
      '..O.............',
      '................',
    ],
    { O: C.outline, g: hex('#a8a29a') },
    ox,
    oy + 11,
  );
  img.rect(ox + 3, oy + 12, 10, 2, C.trunk);
  img.rect(ox + 3, oy + 13, 10, 1, C.trunkDark);
  img.rect(ox + 5, oy + 10, 2, 5, C.trunk);
  img.rect(ox + 9, oy + 10, 2, 5, C.trunk);
  // flame
  const base = oy + (tall ? 2 : 4);
  const h = tall ? 9 : 7;
  for (let y = 0; y < h; y++) {
    const half = Math.max(1, Math.round(((y + 1) / h) * 3.4));
    for (let x = 8 - half; x < 8 + half; x++) {
      let c = C.flame;
      if (y > h * 0.45) c = C.flameLight;
      if (x === 8 - half || x === 8 + half - 1 || y === 0) c = C.flameDark;
      img.set(ox + x + (tall && y < 3 ? 1 : 0), base + y, c);
    }
  }
}

function drawLog(img, ox, oy) {
  img.grid(
    [
      '.OOOOOOOOOOOOO..',
      'OkwwwwwwwwwwwkO.',
      'OkKwwwwwwwwwwkO.',
      'OkKkkkkkkkkkkkO.',
      '.OOOOOOOOOOOOO..',
    ],
    { O: C.outline, w: C.wood, k: C.woodDark, K: hex('#c99a6a') },
    ox,
    oy + 9,
  );
}

// ---- skills yard ----
function drawGardenBed(img, ox, oy, stage) {
  const W = 32;
  // wooden frame
  img.rect(ox, oy + 6, W, 16, C.wood);
  img.rect(ox, oy + 6, W, 2, hex('#c99a6a'));
  img.rect(ox, oy + 20, W, 2, C.woodDark);
  img.rect(ox, oy + 5, W, 1, C.outline);
  img.rect(ox, oy + 22, W, 1, C.outline);
  img.rect(ox, oy + 5, 1, 18, C.outline);
  img.rect(ox + W - 1, oy + 5, 1, 18, C.outline);
  // soil
  img.rect(ox + 2, oy + 8, W - 4, 12, C.soil);
  for (let y = 9; y < 19; y += 3) img.rect(ox + 2, oy + y, W - 4, 1, C.soilDark);
  const r = rng(500 + stage);
  if (stage >= 1) {
    // sprouts
    for (let x = 4; x < W - 3; x += 4) {
      img.set(ox + x, oy + 11, C.leafLight);
      img.set(ox + x, oy + 16, C.leafLight);
      if (stage === 1) img.set(ox + x, oy + 12, C.leaf);
    }
  }
  if (stage >= 2) {
    // bushy rows
    for (let x = 3; x < W - 3; x += 4) {
      for (const yy of [10, 15]) {
        img.rect(ox + x, oy + yy, 3, 3, C.leaf);
        img.set(ox + x + 1, oy + yy, C.leafLight);
        img.set(ox + x + 2, oy + yy + 2, C.leafDark);
      }
    }
  }
  if (stage >= 3) {
    // lush + blooms
    for (let i = 0; i < 26; i++) {
      img.set(ox + 3 + ((r() * (W - 6)) | 0), oy + 9 + ((r() * 10) | 0), r() < 0.5 ? C.leaf : C.leafLight);
    }
    for (let i = 0; i < 6; i++) {
      const fx = ox + 4 + ((r() * (W - 8)) | 0);
      const fy = oy + 10 + ((r() * 8) | 0);
      img.set(fx, fy, r() < 0.5 ? C.flowerYellow : hex('#d9534f'));
    }
  }
}

function drawPot(img, ox, oy, kind) {
  // terracotta pot
  img.grid(
    [
      '...OOOOOOOO.....',
      '..OppppppppO....',
      '..OpPPPPPPpO....',
      '...OppppppO.....',
      '...OpppppPO.....',
      '....OOOOOO......',
    ],
    { O: C.outline, p: hex('#c07048'), P: hex('#a05a38') },
    ox,
    oy + 14,
  );
  if (kind === 0) {
    // seedling
    img.grid(
      ['......g.........', '.....gLg........', '......g.........'],
      { g: C.leaf, L: C.leafLight },
      ox + 1,
      oy + 11,
    );
  } else if (kind === 1) {
    // leafy
    img.grid(
      [
        '....g...g.......',
        '...gLg.gLg......',
        '....ggggg.......',
        '.....gGg........',
        '......g.........',
      ],
      { g: C.leaf, L: C.leafLight, G: hex('#6a8f37') },
      ox + 1,
      oy + 9,
    );
  } else {
    // flowering
    img.grid(
      [
        '.....yry........',
        '....gyryg.......',
        '...gLgggLg......',
        '....ggGgg.......',
        '......g.........',
      ],
      { g: C.leaf, L: C.leafLight, G: hex('#6a8f37'), y: C.flowerYellow, r: hex('#d9534f') },
      ox + 1,
      oy + 9,
    );
  }
}

function drawToolRack(img, ox, oy) {
  const W = 32;
  // backboard
  img.rect(ox + 1, oy + 2, W - 2, 22, C.wood);
  img.rect(ox + 2, oy + 3, W - 4, 2, hex('#c99a6a'));
  img.rect(ox + 1, oy + 22, W - 2, 2, C.woodDark);
  img.rect(ox, oy + 2, 1, 22, C.outline);
  img.rect(ox + W - 1, oy + 2, 1, 22, C.outline);
  img.rect(ox + 1, oy + 1, W - 2, 1, C.outline);
  img.rect(ox + 1, oy + 24, W - 2, 1, C.outline);
  const gray = hex('#a8b0b8');
  const grayDark = hex('#7d858d');
  const handle = hex('#c07048');
  // hammer
  img.rect(ox + 4, oy + 6, 6, 3, grayDark);
  img.rect(ox + 4, oy + 6, 6, 1, gray);
  img.rect(ox + 6, oy + 9, 2, 10, handle);
  // wrench
  img.rect(ox + 14, oy + 6, 2, 12, gray);
  img.rect(ox + 12, oy + 5, 3, 3, gray);
  img.rect(ox + 15, oy + 5, 3, 3, grayDark);
  img.set(ox + 14, oy + 6, C.outline);
  // screwdriver
  img.rect(ox + 22, oy + 5, 2, 6, hex('#4f74b8'));
  img.rect(ox + 22, oy + 11, 2, 8, gray);
  // shine sparkles (well-used tools gleam)
  img.set(ox + 3, oy + 5, hex('#ffffff'));
  img.set(ox + 13, oy + 4, hex('#ffffff'));
  img.set(ox + 17, oy + 9, hex('#ffffff'));
  // legs
  img.rect(ox + 3, oy + 25, 3, 5, C.woodDark);
  img.rect(ox + 26, oy + 25, 3, 5, C.woodDark);
  img.rect(ox + 3, oy + 30, 3, 1, C.outline);
  img.rect(ox + 26, oy + 30, 3, 1, C.outline);
}

function drawHouse(img, ox, oy) {
  const W = 96;
  const roofH = 34;
  const wallTop = roofH;
  const wallH = 44;
  const r = rng(4242);
  // roof
  const roofRed = hex('#b5482a');
  const roofLight = hex('#d05f3b');
  const roofDark = hex('#8f3721');
  for (let y = 0; y < roofH; y++) {
    const inset = y < 3 ? 6 - y * 2 : 0;
    for (let x = inset; x < W - inset; x++) {
      let c = roofRed;
      if (y % 6 === 5) c = roofDark;
      if (y % 6 === 0 && r() < 0.15) c = roofLight;
      if (y < 2) c = roofDark;
      if (x === inset || x === W - inset - 1) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
  img.rect(ox, oy + roofH - 2, W, 2, roofDark);
  img.rect(ox, oy + roofH - 1, W, 1, C.outline);
  // walls
  const cream = hex('#e8d5a3');
  const creamShade = hex('#d4bf8b');
  const timber = hex('#8a6b46');
  img.rect(ox, oy + wallTop, W, wallH, cream);
  for (let i = 0; i < 40; i++) {
    img.set(ox + ((r() * W) | 0), oy + wallTop + ((r() * wallH) | 0), creamShade);
  }
  // timber frame
  img.rect(ox, oy + wallTop, 3, wallH, timber);
  img.rect(ox + W - 3, oy + wallTop, 3, wallH, timber);
  img.rect(ox, oy + wallTop, W, 2, timber);
  // windows
  for (const wx of [12, 68]) {
    img.rect(ox + wx - 1, oy + wallTop + 9, 18, 18, C.outline);
    img.rect(ox + wx, oy + wallTop + 10, 16, 16, hex('#9ed4e8'));
    img.rect(ox + wx, oy + wallTop + 10, 16, 2, hex('#c8ecf8'));
    img.rect(ox + wx + 7, oy + wallTop + 10, 2, 16, hex('#f5f2e8'));
    img.rect(ox + wx, oy + wallTop + 17, 16, 2, hex('#f5f2e8'));
    img.rect(ox + wx - 1, oy + wallTop + 27, 18, 2, timber);
  }
  // door (aligned so its center is 48px from the left edge)
  const doorX = 40;
  const doorW = 16;
  const doorH = 26;
  const doorTop = oy + wallTop + wallH - doorH;
  img.rect(ox + doorX - 1, doorTop - 1, doorW + 2, doorH + 1, C.outline);
  img.rect(ox + doorX, doorTop, doorW, doorH, C.woodDark);
  img.rect(ox + doorX + 1, doorTop + 1, doorW - 2, doorH - 1, C.wood);
  img.rect(ox + doorX + 3, doorTop + 3, doorW - 6, 6, hex('#9ed4e8'));
  img.rect(ox + doorX + 3, doorTop + 3, doorW - 6, 1, C.woodDarker);
  img.set(ox + doorX + doorW - 4, doorTop + 14, C.outline);
  img.set(ox + doorX + doorW - 4, doorTop + 15, hex('#f0c33c'));
  // outline sides
  img.rect(ox, oy + wallTop, 1, wallH, C.outline);
  img.rect(ox + W - 1, oy + wallTop, 1, wallH, C.outline);
  img.rect(ox, oy + roofH + wallH - 1, W, 1, C.outline);
}

function drawFenceH(img, ox, oy) {
  img.rect(ox, oy + 6, 16, 3, C.wood);
  img.rect(ox, oy + 8, 16, 1, C.woodDark);
  img.rect(ox, oy + 11, 16, 3, C.wood);
  img.rect(ox, oy + 13, 16, 1, C.woodDark);
  img.rect(ox + 6, oy + 3, 4, 12, C.wood);
  img.rect(ox + 6, oy + 3, 1, 12, hex('#c99a6a'));
  img.rect(ox + 9, oy + 3, 1, 12, C.woodDark);
  img.rect(ox + 6, oy + 3, 4, 1, hex('#c99a6a'));
  img.rect(ox + 6, oy + 14, 4, 1, C.outline);
}

function drawFenceV(img, ox, oy) {
  // twin vertical rails with a post knob so it reads as a fence, not a pole
  img.rect(ox + 5, oy, 2, 16, C.wood);
  img.rect(ox + 5, oy, 1, 16, hex('#c99a6a'));
  img.rect(ox + 9, oy, 2, 16, C.wood);
  img.rect(ox + 10, oy, 1, 16, C.woodDark);
  img.rect(ox + 4, oy + 5, 8, 5, C.wood);
  img.rect(ox + 4, oy + 5, 8, 1, hex('#c99a6a'));
  img.rect(ox + 4, oy + 9, 8, 1, C.outline);
  img.rect(ox + 4, oy + 4, 8, 1, C.outline);
}

function drawSign(img, ox, oy) {
  img.grid(
    [
      'OOOOOOOOOOOOOO..',
      'OwwwwwwwwwwwwO..',
      'OwddwdddwddwwO..',
      'OwwwwwwwwwwwwO..',
      'OwddddwwdddwwO..',
      'OwwwwwwwwwwwwO..',
      'OOOOOOOOOOOOOO..',
      '.....OkkO.......',
      '.....OkkO.......',
      '.....OkkO.......',
      '.....OkkO.......',
      '.....OkkO.......',
      '....OOkkOO......',
    ],
    { O: C.outline, w: hex('#c99a6a'), d: C.woodDarker, k: C.woodDark },
    ox,
    oy + 3,
  );
}

function drawMailbox(img, ox, oy) {
  img.grid(
    [
      '..OOOOOOOO......',
      '.OrrrrrrrrO..O..',
      '.OrRRRRRRrO..Oy.',
      '.OrRRRRRRrOOOO..',
      '.OrrrrrrrrO.....',
      '.OOOOOOOOOO.....',
      '.....OkkO.......',
      '.....OkkO.......',
      '.....OkkO.......',
      '.....OkkO.......',
      '....OOkkOO......',
    ],
    { O: C.outline, r: hex('#d9534f'), R: hex('#b5382f'), k: C.woodDark, y: hex('#f0c33c') },
    ox,
    oy + 4,
  );
}

function drawBush(img, ox, oy) {
  const r = rng(15);
  for (let y = 4; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const dx = (x - 8) / 7;
      const dy = (y - 9.5) / 5.5;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      let c = C.leaf;
      if (d > 0.75) c = C.leafDark;
      else if (r() < 0.2) c = C.leafLight;
      if (d > 0.92) c = C.outline;
      img.set(ox + x, oy + y, c);
    }
  }
}

function drawRock(img, ox, oy) {
  // angular faceted boulder: bright top-left face, mid face, shaded right
  img.grid(
    [
      '......OOOO......',
      '....OOllllO.....',
      '...OlllllllO....',
      '..OllllllmmmO...',
      '.OlllllmmmmmdO..',
      '.OllmmmmmmdddO..',
      '.OmmmmmmddddDO..',
      '..OmmdddddDDO...',
      '...OOOOOOOOO....',
    ],
    { O: C.outline, l: hex('#c6c0b6'), m: hex('#a8a29a'), d: hex('#847e76'), D: hex('#6b655e') },
    ox,
    oy + 6,
  );
}

// crops — drawn over SOIL tiles
function addCrops() {
  addProp('crop_wheat', 16, 16, (img, ox, oy) => {
    img.grid(
      [
        '.y..y..y..y..y..',
        '.Y..Y..Y..Y..Y..',
        '.Y..Y..Y..Y..Y..',
        '.y..y..y..y..y..',
        '.g..g..g..g..g..',
        '.g..g..g..g..g..',
        '.g.gg..g.gg..g..',
        '.gg.g.gg..g.gg..',
        '.g..g..g..g..g..',
        '.g..g..g..g..g..',
      ],
      { y: hex('#f0c33c'), Y: hex('#e0ae26'), g: hex('#7d9b3a') },
      ox,
      oy + 5,
    );
  });
  addProp('crop_carrot', 16, 16, (img, ox, oy) => {
    img.grid(
      [
        '..g...g....g....',
        '.ggg.ggg..ggg...',
        '.gLg.gLg..gLg...',
        '.ggg.ggg..ggg...',
        '..g...g....g....',
        '..o...o....o....',
        '..o...o....o....',
      ],
      { g: C.leaf, L: C.leafLight, o: hex('#e07b39') },
      ox,
      oy + 8,
    );
  });
  addProp('crop_cabbage', 16, 16, (img, ox, oy) => {
    for (const cx of [4, 11]) {
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          const dx = (x - 3.5) / 3.5;
          const dy = (y - 3.5) / 3.5;
          const d = dx * dx + dy * dy;
          if (d > 1) continue;
          let c = hex('#8fbf5a');
          if (d > 0.6) c = C.leaf;
          if (d > 0.88) c = C.leafDark;
          img.set(ox + cx - 3 + x, oy + 7 + y, c);
        }
      img.set(ox + cx, oy + 9, hex('#b8d98a'));
      img.set(ox + cx + 1, oy + 10, hex('#b8d98a'));
    }
  });
  addProp('crop_berry', 16, 16, (img, ox, oy) => {
    const r = rng(8);
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 14; x++) {
        const dx = (x - 6.5) / 6.5;
        const dy = (y - 5.5) / 4.5;
        if (dx * dx + dy * dy > 1) continue;
        img.set(ox + 1 + x, oy + 5 + y, r() < 0.25 ? C.leafDark : C.leaf);
      }
    for (const [bx, by] of [[3, 8], [7, 7], [11, 9], [5, 11], [9, 11]]) {
      img.set(ox + bx, oy + by, hex('#7a4a9e'));
      img.set(ox + bx + 1, oy + by, hex('#9a66c4'));
      img.set(ox + bx, oy + by + 1, hex('#5e3880'));
      img.set(ox + bx + 1, oy + by + 1, hex('#7a4a9e'));
    }
  });
  addProp('crop_corn', 16, 16, (img, ox, oy) => {
    img.grid(
      [
        '...g......g.....',
        '..gg.....gg.....',
        '..gGg....gGg....',
        '.g.G..g.g.G..g..',
        '..gGg....gGg....',
        '..yG......yG....',
        '..yG..g...yG.g..',
        '..gGg....gGg....',
        '...G......G.....',
        '...G......G.....',
      ],
      { g: C.leaf, G: hex('#6a8f37'), y: hex('#f0c33c') },
      ox,
      oy + 5,
    );
  });
}

// interior furniture
function drawPiano(img, ox, oy) {
  const body = hex('#4a2f1e');
  const bodyLight = hex('#5e3d28');
  const bodyDark = hex('#38241a');
  img.rect(ox + 1, oy + 4, 30, 26, body);
  img.rect(ox + 1, oy + 4, 30, 3, bodyDark);
  img.rect(ox + 2, oy + 7, 28, 4, bodyLight);
  // sheet stand
  img.rect(ox + 10, oy + 8, 12, 2, hex('#f5f2e8'));
  // keys
  img.rect(ox + 2, oy + 13, 28, 6, hex('#f5f2e8'));
  img.rect(ox + 2, oy + 17, 28, 2, hex('#d8d4c8'));
  for (let x = 4; x < 29; x += 4) {
    img.rect(ox + x, oy + 13, 2, 3, C.outline);
  }
  // lower panel + legs
  img.rect(ox + 1, oy + 19, 30, 8, body);
  img.rect(ox + 2, oy + 21, 28, 1, bodyDark);
  img.rect(ox + 1, oy + 27, 4, 4, bodyDark);
  img.rect(ox + 27, oy + 27, 4, 4, bodyDark);
  // outline
  img.rect(ox, oy + 4, 1, 27, C.outline);
  img.rect(ox + 31, oy + 4, 1, 27, C.outline);
  img.rect(ox + 1, oy + 3, 30, 1, C.outline);
  img.rect(ox + 1, oy + 30, 4, 1, C.outline);
  img.rect(ox + 27, oy + 30, 4, 1, C.outline);
  img.rect(ox + 5, oy + 26, 22, 1, C.outline);
}

function drawDesk(img, ox, oy) {
  // monitor
  img.rect(ox + 7, oy, 18, 13, C.outline);
  img.rect(ox + 8, oy + 1, 16, 11, hex('#1c2b4a'));
  // "code" on screen
  const codeCols = [hex('#5ad4e8'), hex('#8ce88a'), hex('#f0c33c'), hex('#d9749a')];
  const r = rng(99);
  for (let y = 2; y < 11; y += 2) {
    let x = 9 + ((r() * 3) | 0);
    while (x < 21) {
      const len = 2 + ((r() * 4) | 0);
      const c = codeCols[(r() * codeCols.length) | 0];
      img.rect(ox + x, oy + y, Math.min(len, 23 - x), 1, c);
      x += len + 2;
    }
  }
  img.rect(ox + 14, oy + 13, 4, 2, C.outline); // stand
  // desk top
  img.rect(ox, oy + 15, 32, 5, C.wood);
  img.rect(ox, oy + 15, 32, 1, hex('#c99a6a'));
  img.rect(ox, oy + 19, 32, 1, C.woodDark);
  // keyboard
  img.rect(ox + 10, oy + 16, 12, 3, hex('#3a3f4a'));
  img.rect(ox + 11, oy + 17, 10, 1, hex('#565e6e'));
  // legs
  img.rect(ox + 1, oy + 20, 3, 4, C.woodDark);
  img.rect(ox + 28, oy + 20, 3, 4, C.woodDark);
  img.rect(ox, oy + 14, 32, 1, C.outline);
  img.rect(ox + 1, oy + 23, 3, 1, C.outline);
  img.rect(ox + 28, oy + 23, 3, 1, C.outline);
}

function drawBed(img, ox, oy) {
  img.rect(ox + 1, oy, 30, 6, C.woodDark); // headboard
  img.rect(ox + 2, oy + 1, 28, 4, C.wood);
  img.rect(ox + 1, oy + 6, 30, 22, hex('#e8e4d8')); // mattress
  img.rect(ox + 4, oy + 4, 24, 7, hex('#f5f2e8')); // pillow
  img.rect(ox + 4, oy + 4, 24, 1, C.outline);
  img.rect(ox + 4, oy + 10, 24, 1, hex('#c8c4b8'));
  img.rect(ox + 1, oy + 12, 30, 16, hex('#4f74b8')); // blanket
  img.rect(ox + 1, oy + 12, 30, 2, hex('#6a8fd0'));
  img.rect(ox + 1, oy + 25, 30, 3, hex('#3d5c96'));
  img.rect(ox + 1, oy + 28, 30, 3, C.woodDark); // footboard
  img.rect(ox, oy, 1, 31, C.outline);
  img.rect(ox + 31, oy, 1, 31, C.outline);
  img.rect(ox + 1, oy + 30, 30, 1, C.outline);
  img.rect(ox + 1, oy, 30, 1, C.outline);
}

function drawBookshelf(img, ox, oy) {
  img.rect(ox, oy, 16, 30, C.woodDark);
  img.rect(ox + 1, oy + 1, 14, 28, C.wood);
  const books = [hex('#d9534f'), hex('#4f74b8'), hex('#8ce88a'), hex('#f0c33c'), hex('#9a66c4'), hex('#5ad4e8')];
  const r = rng(3);
  for (const shelfY of [3, 12, 21]) {
    let x = 2;
    while (x < 13) {
      const w = 2 + ((r() * 2) | 0);
      img.rect(ox + x, oy + shelfY + ((r() * 2) | 0), Math.min(w, 14 - x), 7 - ((r() * 2) | 0), books[(r() * books.length) | 0]);
      x += w + (r() < 0.3 ? 1 : 0);
    }
    img.rect(ox + 1, oy + shelfY + 7, 14, 2, C.woodDarker);
  }
  img.rect(ox, oy, 1, 30, C.outline);
  img.rect(ox + 15, oy, 1, 30, C.outline);
  img.rect(ox, oy, 16, 1, C.outline);
  img.rect(ox, oy + 29, 16, 1, C.outline);
}

function drawTable(img, ox, oy) {
  img.rect(ox + 1, oy + 2, 30, 14, C.wood);
  img.rect(ox + 2, oy + 3, 28, 2, hex('#c99a6a'));
  img.rect(ox + 1, oy + 14, 30, 2, C.woodDark);
  img.rect(ox + 2, oy + 16, 3, 6, C.woodDark);
  img.rect(ox + 27, oy + 16, 3, 6, C.woodDark);
  img.rect(ox, oy + 2, 1, 14, C.outline);
  img.rect(ox + 31, oy + 2, 1, 14, C.outline);
  img.rect(ox + 1, oy + 1, 30, 1, C.outline);
  img.rect(ox + 2, oy + 21, 3, 1, C.outline);
  img.rect(ox + 27, oy + 21, 3, 1, C.outline);
  // fruit bowl
  img.rect(ox + 13, oy + 6, 6, 3, hex('#d9534f'));
  img.set(ox + 14, oy + 5, C.leaf);
  img.set(ox + 17, oy + 5, hex('#f0c33c'));
}

function drawChair(img, ox, oy) {
  img.grid(
    [
      '..OkkkkkkO......',
      '..OkwwwwkO......',
      '..OkwwwwkO......',
      '..OkkkkkkO......',
      '..OwwwwwwO......',
      '..OwwwwwwO......',
      '..Ok....kO......',
      '..Ok....kO......',
      '..OO....OO......',
    ],
    { O: C.outline, k: C.woodDark, w: C.wood },
    ox + 3,
    oy + 6,
  );
}

function drawPlant(img, ox, oy) {
  img.grid(
    [
      '....gg..g.......',
      '..gggLgggg......',
      '.gLgggggLgg.....',
      '.ggggLggggg.....',
      '..ggggggLg......',
      '...gLgggg.......',
      '....OppO........',
      '...OppppO.......',
      '...OpPPpO.......',
      '...OOOOOO.......',
    ],
    { g: C.leaf, L: C.leafLight, O: C.outline, p: hex('#c07048'), P: hex('#a05a38') },
    ox + 2,
    oy + 6,
  );
}

function drawFridge(img, ox, oy) {
  img.rect(ox + 2, oy, 12, 24, hex('#e8e8e4'));
  img.rect(ox + 3, oy + 1, 10, 8, hex('#f5f5f2'));
  img.rect(ox + 2, oy + 9, 12, 1, hex('#b8b8b4'));
  img.rect(ox + 11, oy + 3, 1, 4, hex('#888884'));
  img.rect(ox + 11, oy + 12, 1, 6, hex('#888884'));
  img.rect(ox + 1, oy, 1, 24, C.outline);
  img.rect(ox + 14, oy, 1, 24, C.outline);
  img.rect(ox + 2, oy, 12, 1, C.outline);
  img.rect(ox + 2, oy + 23, 12, 1, C.outline);
}

function drawCounter(img, ox, oy) {
  img.rect(ox, oy + 2, 16, 4, hex('#d8d4c8'));
  img.rect(ox, oy + 2, 16, 1, hex('#f0ede4'));
  img.rect(ox, oy + 6, 16, 9, C.wood);
  img.rect(ox + 2, oy + 8, 5, 5, C.woodDark);
  img.rect(ox + 9, oy + 8, 5, 5, C.woodDark);
  img.rect(ox, oy + 1, 16, 1, C.outline);
  img.rect(ox, oy + 15, 16, 1, C.outline);
  img.rect(ox, oy + 1, 1, 15, C.outline);
  img.rect(ox + 15, oy + 1, 1, 15, C.outline);
}

function drawRug(img, ox, oy) {
  const red = hex('#b0524a');
  const redDark = hex('#96423c');
  const cream = hex('#e8d5a3');
  img.rect(ox, oy, 48, 32, red);
  img.rect(ox + 2, oy + 2, 44, 28, redDark);
  img.rect(ox + 4, oy + 4, 40, 24, red);
  img.rect(ox + 8, oy + 8, 32, 16, cream);
  img.rect(ox + 10, oy + 10, 28, 12, red);
  for (let x = 0; x < 48; x += 4) {
    img.set(ox + x, oy, cream);
    img.set(ox + x, oy + 31, cream);
  }
}

// ============================================================ characters
// Shared 16x24 humanoid: rows 0-16 head+torso, rows 17-23 legs.
const PAL_PLAYER = {
  O: C.outline,
  H: hex('#5a3d26'), // hair
  S: hex('#f0c49c'),
  s: hex('#d9a97f'),
  E: hex('#2b2018'),
  T: hex('#3f6fb5'), // shirt
  t: hex('#33598f'),
  P: hex('#4a4c5e'), // pants
  p: hex('#3b3d4c'),
  B: hex('#3a2f28'), // shoes
  D: hex('#c05a7a'), // dress (wife)
  d: hex('#a4486a'),
  W: hex('#8a5a2f'), // wife hair
};

const DOWN_HEAD = [
  '................',
  '....OOOOOOOO....',
  '...OHHHHHHHHO...',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '..OHHSSSSSSHHO..',
  '..OSSSSSSSSSSO..',
  '..OSSESSSSESSO..',
  '..OSSSSSSSSSSO..',
  '...OSSssssSSO...',
  '....OssssssO....',
];
const DOWN_TORSO = [
  '...OTTTTTTTTO...',
  '..OTTTTTTTTTTO..',
  '.OSTTTTTTTTTTSO.',
  '.OSTTttttttTTSO.',
  '.OsTTTTTTTTTTsO.',
  '..OTTTTTTTTTTO..',
];
const LEGS_IDLE = [
  '...OPPPPPPPPO...',
  '...OPPPppPPPO...',
  '...OPPO..OPPO...',
  '...OPPO..OPPO...',
  '...OPPO..OPPO...',
  '...OBBO..OBBO...',
  '...OOOO..OOOO...',
];
const LEGS_STEP = [
  '...OPPPPPPPPO...',
  '...OPPPppPPPO...',
  '...OPPO..OPPO...',
  '...OPPO..OPPO...',
  '...OBBO..OPPO...',
  '...OOOO..OBBO...',
  '.........OOOO...',
];

const UP_HEAD = [
  '................',
  '....OOOOOOOO....',
  '...OHHHHHHHHO...',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '..OHHHHHHHHHHO..',
  '...OHHHHHHHHO...',
  '....OssssssO....',
];
const UP_TORSO = [
  '...OTTTTTTTTO...',
  '..OTTTTTTTTTTO..',
  '.OSTTTTTTTTTTSO.',
  '.OSTTTTTTTTTTSO.',
  '.OsTTTTTTTTTTsO.',
  '..OTTTTTTTTTTO..',
];

const SIDE_HEAD = [
  '................',
  '.....OOOOOO.....',
  '....OHHHHHHO....',
  '...OHHHHHHHHO...',
  '...OHHHHHHHHO...',
  '...OHHHSSSSHO...',
  '...OHSSSSSSSO...',
  '...OHSSSSESSO...',
  '...OHSSSSSSSO...',
  '....OSSssSSO....',
  '.....OssssO.....',
];
const SIDE_TORSO = [
  '....OTTTTTTO....',
  '....OTTTTTTO....',
  '....OTTTTTsO....',
  '....OTttttsO....',
  '....OTTTTTTO....',
  '....OTTTTTTO....',
];
const SIDE_LEGS_IDLE = [
  '....OPPPPPPO....',
  '....OPPppPPO....',
  '.....OPPPPO.....',
  '.....OPPPPO.....',
  '.....OPPPPO.....',
  '.....OBBBBO.....',
  '.....OOOOOO.....',
];
const SIDE_LEGS_A = [
  '....OPPPPPPO....',
  '....OPPppPPO....',
  '....OPPOOPPO....',
  '...OPPO..OPPO...',
  '...OPPO...OPPO..',
  '...OBBO...OBBO..',
  '...OOOO...OOOO..',
];
const SIDE_LEGS_B = [
  '....OPPPPPPO....',
  '....OPPppPPO....',
  '.....OPPPPO.....',
  '.....OPPPPO.....',
  '.....OPPPPO.....',
  '.....OBBBBO.....',
  '.....OOOOOO.....',
];

function drawHumanFrame(img, ox, oy, head, torso, legs, pal, mirror = false) {
  img.grid(head, pal, ox, oy, mirror);
  img.grid(torso, pal, ox, oy + head.length, mirror);
  img.grid(legs, pal, ox, oy + head.length + torso.length, mirror);
}

function makePlayerSheet(pal) {
  const img = new Img(48, 96);
  const dirs = [
    { head: DOWN_HEAD, torso: DOWN_TORSO, legs: [LEGS_IDLE, LEGS_STEP, LEGS_STEP], mirrorFrames: [false, false, true], mirrorAll: false },
    { head: UP_HEAD, torso: UP_TORSO, legs: [LEGS_IDLE, LEGS_STEP, LEGS_STEP], mirrorFrames: [false, false, true], mirrorAll: false },
    { head: SIDE_HEAD, torso: SIDE_TORSO, legs: [SIDE_LEGS_IDLE, SIDE_LEGS_A, SIDE_LEGS_B], mirrorFrames: [false, false, false], mirrorAll: true }, // left
    { head: SIDE_HEAD, torso: SIDE_TORSO, legs: [SIDE_LEGS_IDLE, SIDE_LEGS_A, SIDE_LEGS_B], mirrorFrames: [false, false, false], mirrorAll: false }, // right
  ];
  dirs.forEach((dir, row) => {
    for (let f = 0; f < 3; f++) {
      const mirror = dir.mirrorAll || dir.mirrorFrames[f];
      drawHumanFrame(img, f * 16, row * 24, dir.head, dir.torso, dir.legs[f], pal, mirror);
    }
  });
  return img;
}

// Wife: long hair + dress, single frame per direction.
const WIFE_DOWN = [
  '................',
  '....OOOOOOOO....',
  '...OWWWWWWWWO...',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWSSSSSSWWO..',
  '..OWSSSSSSSSWO..',
  '..OWSESSSSESWO..',
  '..OWSSSSSSSSWO..',
  '..OWWSssssSWWO..',
  '..OWWOssssOWWO..',
  '..OWWDDDDDDWWO..',
  '..OWODDDDDDOWO..',
  '.OSODDDDDDDDOSO.',
  '.OSODddddddDOSO.',
  '.OsODDDDDDDDOsO.',
  '...ODDDDDDDDO...',
  '...ODDDDDDDDO...',
  '..ODDDDDDDDDDO..',
  '..ODDDDDDDDDDO..',
  '..ODdDdDdDdDdO..',
  '...OSSO..OSSO...',
  '...OBBO..OBBO...',
  '...OOOO..OOOO...',
];
const WIFE_UP = [
  '................',
  '....OOOOOOOO....',
  '...OWWWWWWWWO...',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWWWWWWWWWO..',
  '..OWWDDDDDDWWO..',
  '..OWWDDDDDDWWO..',
  '.OSODDDDDDDDOSO.',
  '.OSODDDDDDDDOSO.',
  '.OsODDDDDDDDOsO.',
  '...ODDDDDDDDO...',
  '...ODDDDDDDDO...',
  '..ODDDDDDDDDDO..',
  '..ODDDDDDDDDDO..',
  '..ODdDdDdDdDdO..',
  '...OSSO..OSSO...',
  '...OBBO..OBBO...',
  '...OOOO..OOOO...',
];
const WIFE_SIDE = [
  '................',
  '.....OOOOOO.....',
  '....OWWWWWWO....',
  '...OWWWWWWWWO...',
  '...OWWWWWWWWO...',
  '...OWWWSSSSWO...',
  '...OWWSSSSSSO...',
  '...OWWSSSESSO...',
  '...OWWSSSSSSO...',
  '...OWWSssSSO....',
  '...OWWOssssO....',
  '...OWWDDDDDO....',
  '...OWWDDDDDO....',
  '...OWDDDDDsO....',
  '...ODDddddsO....',
  '....ODDDDDDO....',
  '....ODDDDDDO....',
  '....ODDDDDDO....',
  '...ODDDDDDDDO...',
  '...ODDDDDDDDO...',
  '...ODdDdDdDdO...',
  '.....OSSSSO.....',
  '.....OBBBBO.....',
  '.....OOOOOO.....',
];

function makeWifeSheet() {
  const img = new Img(16, 96);
  img.grid(WIFE_DOWN, PAL_PLAYER, 0, 0);
  img.grid(WIFE_UP, PAL_PLAYER, 0, 24);
  img.grid(WIFE_SIDE, PAL_PLAYER, 0, 48, true); // left
  img.grid(WIFE_SIDE, PAL_PLAYER, 0, 72); // right
  return img;
}

// Dog: 16x16, jack russell — white with brown head patch. 2 frames per dir.
const PAL_DOG = {
  O: C.outline,
  w: hex('#f2efe6'),
  W: hex('#e0dccc'),
  b: hex('#a5683f'), // brown patch
  B: hex('#8a5430'),
  p: hex('#d89ab0'), // tongue/ear inner
  E: hex('#2b2018'),
};
const DOG_DOWN_A = [
  '................',
  '..OO......OO....',
  '.ObbO....OwwO...',
  '.ObbbOOOOwwwO...',
  '..ObbbwwwwwwO...',
  '..ObbEwwwEwwO...',
  '..ObbwwwwwwwO...',
  '...OwwwOOwwO....',
  '...OwwwppwwO....',
  '....OwwwwwO.....',
  '...OwwwwwwwO....',
  '...OwwwwwwwO....',
  '...OwwwwwwwO....',
  '...OwOO.OOwO....',
  '...OwO...OwO....',
  '...OOO...OOO....',
];
const DOG_DOWN_B = [
  '................',
  '..OO......OO....',
  '.ObbO....OwwO...',
  '.ObbbOOOOwwwO...',
  '..ObbbwwwwwwO...',
  '..ObbEwwwEwwO...',
  '..ObbwwwwwwwO...',
  '...OwwwOOwwO....',
  '...OwwwppwwO....',
  '....OwwwwwO.....',
  '...OwwwwwwwO....',
  '...OwwwwwwwO....',
  '...OwwwwwwwO....',
  '...OOwO.OwOO....',
  '....OwO.OwO.....',
  '....OOO.OOO.....',
];
const DOG_UP_A = [
  '................',
  '..OO......OO....',
  '.ObbO....OwwO...',
  '.ObbbOOOOwwwO...',
  '..ObbbbwwwwwO...',
  '..ObbbbwwwwwO...',
  '..ObbbwwwwwwO...',
  '...OwwwwwwwO....',
  '....OwwwwwO.....',
  '...OwwwwwwwO..O.',
  '...OwwwwwwwO.OwO',
  '...OwwwwwwwOOwO.',
  '...OwwwwwwwOO...',
  '...OwOO.OOwO....',
  '...OwO...OwO....',
  '...OOO...OOO....',
];
const DOG_UP_B = [
  '................',
  '..OO......OO....',
  '.ObbO....OwwO...',
  '.ObbbOOOOwwwO...',
  '..ObbbbwwwwwO...',
  '..ObbbbwwwwwO...',
  '..ObbbwwwwwwO...',
  '...OwwwwwwwO....',
  '....OwwwwwO.....',
  '...OwwwwwwwOO...',
  '...OwwwwwwwOwO..',
  '...OwwwwwwwOwO..',
  '...OwwwwwwwOO...',
  '...OOwO.OwOO....',
  '....OwO.OwO.....',
  '....OOO.OOO.....',
];
const DOG_SIDE_A = [
  '................',
  '................',
  '...........OO...',
  '..........ObbO..',
  '..........ObbbO.',
  '.....OOOOOObEbO.',
  '..O.OwwwwwbbbbO.',
  '.OwOOwwwwwbbOO..',
  '.OwwwwwwwwwbO...',
  '..OwwwwwwwwOO...',
  '...OwwwwwwwO....',
  '...OwOOOOwwO....',
  '...OwO...OwO....',
  '...OwO...OwO....',
  '...OOO...OOO....',
  '................',
];
const DOG_SIDE_B = [
  '................',
  '................',
  '...........OO...',
  '..........ObbO..',
  '..........ObbbO.',
  '..O..OOOOOObEbO.',
  '..OwOwwwwwbbbbO.',
  '..OwwwwwwwbbOO..',
  '..OwwwwwwwwbO...',
  '..OwwwwwwwwOO...',
  '...OwwwwwwwO....',
  '...OwwOOOwwO....',
  '..OwO...OwwO....',
  '..OwO....OwO....',
  '..OOO....OOO....',
  '................',
];

function makeDogSheet() {
  const img = new Img(32, 64);
  img.grid(DOG_DOWN_A, PAL_DOG, 0, 0);
  img.grid(DOG_DOWN_B, PAL_DOG, 16, 0);
  img.grid(DOG_UP_A, PAL_DOG, 0, 16);
  img.grid(DOG_UP_B, PAL_DOG, 16, 16);
  img.grid(DOG_SIDE_A, PAL_DOG, 0, 32, true); // left
  img.grid(DOG_SIDE_B, PAL_DOG, 16, 32, true);
  img.grid(DOG_SIDE_A, PAL_DOG, 0, 48); // right
  img.grid(DOG_SIDE_B, PAL_DOG, 16, 48);
  return img;
}

// Farm animals: 16x16, 2 frames, side view (runtime-flipped).
const PAL_ANIMALS = {
  O: C.outline,
  E: hex('#2b2018'),
  w: hex('#f5f2e8'),
  W: hex('#e0dccc'),
  r: hex('#d04030'),
  o: hex('#e8a03a'),
  k: hex('#3a332e'),
  p: hex('#d89ab0'),
  f: hex('#4a4038'),
  g: hex('#847e76'),
};
const CHICKEN_A = [
  '................',
  '......O.........',
  '.....OrO........',
  '....OwwwO.......',
  '...OwwwwwOO.....',
  '..OwwwwwwwwO....',
  '.OEwwwwwwwwO....',
  '.OwwwwwwwwO.....',
  'OoOwwwwwwO......',
  '.OwwwwwwO.......',
  '..OwwwwwO.......',
  '...OwwwwO.......',
  '....OOOO........',
  '.....OoO........',
  '.....O.oO.......',
  '................',
];
const CHICKEN_B = [
  '................',
  '......O.........',
  '.....OrO........',
  '....OwwwO.......',
  '...OwwwwwOO.....',
  '..OwwwwwwwwO....',
  '.OEwwwwwwwwO....',
  '.OwwwwwwwwO.....',
  'OoOwwwwwwO......',
  '.OwwwwwwO.......',
  '..OwwwwwO.......',
  '...OwwwwO.......',
  '....OOOO........',
  '....OoO.........',
  '...Oo.O.........',
  '................',
];
const SHEEP_A = [
  '................',
  '................',
  '....OOOOOOO.....',
  '...OwwwwwwwOO...',
  '..OwwwwwwwwwwO..',
  '.OwwwwwwwwwwwO..',
  '.OwwwwwwwwwwwOO.',
  '.OwwwwwwwwwwOfO.',
  '.OwwwwwwwwwwOfEO',
  '.OwwwwwwwwwwOfO.',
  '..OwwwwwwwwwOO..',
  '..OwWWwwWWwO....',
  '...OfO..OfO.....',
  '...OfO..OfO.....',
  '...OOO..OOO.....',
  '................',
];
const SHEEP_B = [
  '................',
  '................',
  '....OOOOOOO.....',
  '...OwwwwwwwOO...',
  '..OwwwwwwwwwwO..',
  '.OwwwwwwwwwwwO..',
  '.OwwwwwwwwwwwOO.',
  '.OwwwwwwwwwwOfO.',
  '.OwwwwwwwwwwOfEO',
  '.OwwwwwwwwwwOfO.',
  '..OwwwwwwwwwOO..',
  '..OwWWwwWWwO....',
  '..OfO....OfO....',
  '..OfO....OfO....',
  '..OOO....OOO....',
  '................',
];
const COW_A = [
  '................',
  '................',
  '...OOOOOOOO.....',
  '..OwwkkwwwwOO...',
  '.OwwwkkwwwwwwOO.',
  '.OwwwwwwkkwwOgO.',
  '.OkkwwwwkkwwOwEO',
  '.OkkwwwwwwwwOwO.',
  '.OwwwwwwwwwwOpO.',
  '.OwwwkkwwwwwOO..',
  '..OwwkkwwwwO....',
  '..OppOwwkkwO....',
  '...OwO..OwO.....',
  '...OwO..OwO.....',
  '...OOO..OOO.....',
  '................',
];
const COW_B = [
  '................',
  '................',
  '...OOOOOOOO.....',
  '..OwwkkwwwwOO...',
  '.OwwwkkwwwwwwOO.',
  '.OwwwwwwkkwwOgO.',
  '.OkkwwwwkkwwOwEO',
  '.OkkwwwwwwwwOwO.',
  '.OwwwwwwwwwwOpO.',
  '.OwwwkkwwwwwOO..',
  '..OwwkkwwwwO....',
  '..OppOwwkkwO....',
  '..OwO....OwO....',
  '..OwO....OwO....',
  '..OOO....OOO....',
  '................',
];

function makeAnimalSheet(a, b) {
  const img = new Img(32, 16);
  img.grid(a, PAL_ANIMALS, 0, 0);
  img.grid(b, PAL_ANIMALS, 16, 0);
  return img;
}

// ============================================================ build everything
save('tileset.png', drawTileset());

addProp('tree', 32, 32, drawTree);
addProp('pine', 32, 32, drawPine);
addProp('house', 96, 80, drawHouse);
addProp('fence_h', 16, 16, drawFenceH);
addProp('fence_v', 16, 16, drawFenceV);
addProp('sign', 16, 16, drawSign);
addProp('mailbox', 16, 16, drawMailbox);
addProp('bush', 16, 16, drawBush);
addProp('rock', 16, 16, drawRock);
addCrops();
// career trees: species × size
for (const size of ['s', 'm', 'l']) {
  const dims = TREE_SIZES[size];
  addProp(`tree_oak_${size}`, dims.w, dims.h, (img, ox, oy) => drawCanopyTree(img, ox, oy, size, 900 + size.charCodeAt(0)));
  addProp(`tree_pine_${size}`, dims.w, dims.h, (img, ox, oy) => drawPineTree(img, ox, oy, size, 910 + size.charCodeAt(0)));
  addProp(`tree_fruit_${size}`, dims.w, dims.h, (img, ox, oy) =>
    drawCanopyTree(img, ox, oy, size, 920 + size.charCodeAt(0), { fruit: true }),
  );
  addProp(`tree_birch_${size}`, dims.w, dims.h, (img, ox, oy) =>
    drawCanopyTree(img, ox, oy, size, 930 + size.charCodeAt(0), { birch: true }),
  );
}
// mountain checkpoints
addProp('cairn', 16, 16, drawCairn);
addProp('cabin', 48, 40, drawCabin);
addProp('tower', 32, 48, drawTower);
addProp('flag', 16, 28, drawFlag);
// campsite
addProp('tent', 32, 28, drawTent);
addProp('campfire_a', 16, 16, (img, ox, oy) => drawCampfireFrame(img, ox, oy, false));
addProp('campfire_b', 16, 16, (img, ox, oy) => drawCampfireFrame(img, ox, oy, true));
addProp('log', 16, 16, drawLog);
// skills yard
addProp('bed_1', 32, 24, (img, ox, oy) => drawGardenBed(img, ox, oy, 1));
addProp('bed_2', 32, 24, (img, ox, oy) => drawGardenBed(img, ox, oy, 2));
addProp('bed_3', 32, 24, (img, ox, oy) => drawGardenBed(img, ox, oy, 3));
addProp('pot_a', 16, 20, (img, ox, oy) => drawPot(img, ox, oy, 0));
addProp('pot_b', 16, 20, (img, ox, oy) => drawPot(img, ox, oy, 1));
addProp('pot_c', 16, 20, (img, ox, oy) => drawPot(img, ox, oy, 2));
addProp('toolrack', 32, 32, drawToolRack);
addProp('piano', 32, 32, drawPiano);
addProp('desk', 32, 24, drawDesk);
addProp('bed', 32, 32, drawBed);
addProp('bookshelf', 16, 32, drawBookshelf);
addProp('table', 32, 24, drawTable);
addProp('chair', 16, 16, drawChair);
addProp('plant', 16, 24, drawPlant);
addProp('fridge', 16, 24, drawFridge);
addProp('counter', 16, 16, drawCounter);
addProp('rug', 48, 32, drawRug);

save('props.png', propsImg);
save('player.png', makePlayerSheet(PAL_PLAYER));
save('wife.png', makeWifeSheet());
save('dog.png', makeDogSheet());
save('chicken.png', makeAnimalSheet(CHICKEN_A, CHICKEN_B));
save('sheep.png', makeAnimalSheet(SHEEP_A, SHEEP_B));
save('cow.png', makeAnimalSheet(COW_A, COW_B));

// ---------------------------------------------------------------- atlas.ts
const tileIds = TILE_NAMES.map((n, i) => `  ${n}: ${i},`).join('\n');
const props = Object.entries(propRegions)
  .map(([n, r]) => `  ${n}: { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} },`)
  .join('\n');
writeFileSync(
  join(ROOT, 'src', 'game', 'atlas.ts'),
  `// AUTO-GENERATED by scripts/generate-art.mjs — do not edit by hand.
export const TILESET_COLS = ${TILESET_COLS};

export const T = {
${tileIds}
} as const;

export interface PropRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const PROPS = {
${props}
} as const satisfies Record<string, PropRegion>;

export type PropName = keyof typeof PROPS;
`,
);
console.log('wrote src/game/atlas.ts');
