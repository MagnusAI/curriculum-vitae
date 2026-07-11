// Input abstraction merging keyboard and virtual (touch) sources.

export interface InputSnapshot {
  dx: number; // -1..1
  dy: number; // -1..1
  interact: boolean; // edge-triggered, true for exactly one update tick
}

const MOVE_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

const INTERACT_KEYS = new Set(['KeyE', 'Enter', 'Space']);

// Written to directly by the TouchControls React component.
export class VirtualInput {
  dx = 0;
  dy = 0;
  interactQueued = false;

  setAxis(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }

  pressInteract(): void {
    this.interactQueued = true;
  }

  reset(): void {
    this.dx = 0;
    this.dy = 0;
    this.interactQueued = false;
  }
}

export class Input {
  readonly virtual = new VirtualInput();
  private keys = new Set<string>();
  private interactQueued = false;
  private enabled = true;

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code in MOVE_KEYS || INTERACT_KEYS.has(e.code)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    if (INTERACT_KEYS.has(e.code)) {
      if (this.enabled) this.interactQueued = true;
      return;
    }
    if (e.code in MOVE_KEYS) this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onBlur = () => {
    this.keys.clear();
  };

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  // While disabled (dialog open) movement reads neutral and interact
  // presses are dropped rather than queued.
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.interactQueued = false;
      this.virtual.interactQueued = false;
    }
  }

  poll(): InputSnapshot {
    if (!this.enabled) return { dx: 0, dy: 0, interact: false };
    let dx = 0;
    let dy = 0;
    for (const code of this.keys) {
      const move = MOVE_KEYS[code];
      dx += move[0];
      dy += move[1];
    }
    dx += this.virtual.dx;
    dy += this.virtual.dy;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    const interact = this.interactQueued || this.virtual.interactQueued;
    this.interactQueued = false;
    this.virtual.interactQueued = false;
    return { dx, dy, interact };
  }
}
