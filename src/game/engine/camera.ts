// Camera that follows a target and clamps to the map bounds.
export class Camera {
  x = 0; // top-left corner in world px (floored for rendering)
  y = 0;

  constructor(
    public viewW: number,
    public viewH: number,
  ) {}

  follow(targetX: number, targetY: number, mapW: number, mapH: number): void {
    let x = targetX - this.viewW / 2;
    let y = targetY - this.viewH / 2;
    // Clamp to map; center if the map is smaller than the view.
    if (mapW <= this.viewW) x = (mapW - this.viewW) / 2;
    else x = Math.max(0, Math.min(x, mapW - this.viewW));
    if (mapH <= this.viewH) y = (mapH - this.viewH) / 2;
    else y = Math.max(0, Math.min(y, mapH - this.viewH));
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }
}
