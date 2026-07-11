import { TILE } from '../constants';
import { TilemapData, isSolid } from './tilemap';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collidesAt(map: TilemapData, solids: Rect[], rect: Rect): boolean {
  const x0 = Math.floor(rect.x / TILE);
  const y0 = Math.floor(rect.y / TILE);
  const x1 = Math.floor((rect.x + rect.w - 0.001) / TILE);
  const y1 = Math.floor((rect.y + rect.h - 0.001) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (isSolid(map, tx, ty)) return true;
    }
  }
  for (const s of solids) {
    if (rectsOverlap(rect, s)) return true;
  }
  return false;
}

// Axis-separated movement so sliding along walls feels right.
// Mutates and returns the rect.
export function moveWithCollision(
  rect: Rect,
  dx: number,
  dy: number,
  map: TilemapData,
  solids: Rect[],
): Rect {
  if (dx !== 0) {
    const next = { ...rect, x: rect.x + dx };
    if (!collidesAt(map, solids, next)) rect.x = next.x;
  }
  if (dy !== 0) {
    const next = { ...rect, y: rect.y + dy };
    if (!collidesAt(map, solids, next)) rect.y = next.y;
  }
  return rect;
}
