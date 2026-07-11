import { useEffect, useRef } from 'react';
import { Game } from '../game/game';

interface GameCanvasProps {
  onGame: (game: Game | null) => void;
}

export function GameCanvas({ onGame }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onGameRef = useRef(onGame);
  onGameRef.current = onGame;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Game(canvas);

    const applySize = () => {
      const rect = canvas.getBoundingClientRect();
      game.resize(rect.width, rect.height, window.devicePixelRatio || 1);
    };
    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(canvas);
    window.addEventListener('resize', applySize);

    void game.start();
    onGameRef.current(game);
    if (new URLSearchParams(window.location.search).has('debug')) {
      (window as unknown as { __game?: Game }).__game = game;
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', applySize);
      onGameRef.current(null);
      game.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-hidden="true"
    />
  );
}
