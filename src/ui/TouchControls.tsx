import { useEffect, useRef } from 'react';
import { VirtualInput } from '../game/engine/input';

interface TouchControlsProps {
  virtual: VirtualInput;
}

// Floating d-pad (bottom-left) + interact button (bottom-right).
// Writes straight into the game's VirtualInput — no React re-renders.
export function TouchControls({ virtual }: TouchControlsProps) {
  const dpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dpad = dpadRef.current;
    if (!dpad) return;
    let activePointer: number | null = null;

    const applyFromPoint = (clientX: number, clientY: number) => {
      const rect = dpad.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const dead = 12;
      if (Math.hypot(dx, dy) < dead) {
        virtual.setAxis(0, 0);
        return;
      }
      // 8-way from angle; atan2 range [-π, π] mapped to octants
      // idx 0 = -π (left), 2 = -π/2 (up), 4 = 0 (right), 6 = π/2 (down)
      const angle = Math.atan2(dy, dx);
      const oct = Math.round(angle / (Math.PI / 4));
      const table: [number, number][] = [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
      ];
      const [ax, ay] = table[oct + 4];
      const len = Math.hypot(ax, ay) || 1;
      virtual.setAxis(ax / len, ay / len);
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      activePointer = e.pointerId;
      dpad.setPointerCapture(e.pointerId);
      applyFromPoint(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      e.preventDefault();
      applyFromPoint(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      virtual.setAxis(0, 0);
    };

    dpad.addEventListener('pointerdown', onDown);
    dpad.addEventListener('pointermove', onMove);
    dpad.addEventListener('pointerup', onUp);
    dpad.addEventListener('pointercancel', onUp);
    return () => {
      dpad.removeEventListener('pointerdown', onDown);
      dpad.removeEventListener('pointermove', onMove);
      dpad.removeEventListener('pointerup', onUp);
      dpad.removeEventListener('pointercancel', onUp);
      virtual.setAxis(0, 0);
    };
  }, [virtual]);

  return (
    <div className="touch-controls">
      <div className="dpad" ref={dpadRef}>
        <div className="dpad-btn up">▲</div>
        <div className="dpad-btn down">▼</div>
        <div className="dpad-btn left">◀</div>
        <div className="dpad-btn right">▶</div>
      </div>
      <button
        className="touch-interact"
        onPointerDown={(e) => {
          e.preventDefault();
          virtual.pressInteract();
        }}
        aria-label="Interact"
      >
        ✦
      </button>
    </div>
  );
}
