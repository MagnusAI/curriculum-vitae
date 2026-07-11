import { TILE } from '../constants';

// A tileset is a grid of TILE×TILE sprites on a single image.
export interface Tileset {
  image: CanvasImageSource;
  cols: number;
}

export interface TilemapData {
  w: number; // tiles
  h: number;
  layers: number[][]; // ground layers, drawn below entities; -1 = empty
  above?: number[]; // drawn over entities (tree canopies, roof edges)
  solid: Uint8Array; // 1 = blocked
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileset: Tileset,
  id: number,
  x: number,
  y: number,
): void {
  if (id < 0) return;
  const sx = (id % tileset.cols) * TILE;
  const sy = Math.floor(id / tileset.cols) * TILE;
  ctx.drawImage(tileset.image, sx, sy, TILE, TILE, x, y, TILE, TILE);
}

// Pre-render layers once per scene; per frame we only blit the visible
// region of the baked canvas.
export function bakeLayers(
  w: number,
  h: number,
  layers: number[][],
  tileset: Tileset,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w * TILE;
  canvas.height = h * TILE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.imageSmoothingEnabled = false;
  for (const layer of layers) {
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        drawTile(ctx, tileset, layer[ty * w + tx], tx * TILE, ty * TILE);
      }
    }
  }
  return canvas;
}

export function isSolid(map: TilemapData, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= map.w || tileY >= map.h) return true;
  return map.solid[tileY * map.w + tileX] === 1;
}
