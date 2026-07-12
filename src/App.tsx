import { useCallback, useEffect, useMemo, useState } from 'react';
import { Game } from './game/game';
import { DialogAction, DialogContent, SceneName } from './game/events';
import { DialogPanel } from './ui/DialogPanel';
import { GameCanvas } from './ui/GameCanvas';
import { HUD } from './ui/HUD';
import { StartScreen } from './ui/StartScreen';
import { TouchControls } from './ui/TouchControls';
import './ui/ui.css';

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [started, setStarted] = useState(false);
  const [dialog, setDialog] = useState<DialogContent | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneName>('overworld');

  const isTouch = useMemo(
    () =>
      window.matchMedia('(pointer: coarse)').matches ||
      new URLSearchParams(window.location.search).has('touch'),
    [],
  );

  useEffect(() => {
    if (!game) return;
    const unsubscribe = game.events.on((event) => {
      switch (event.type) {
        case 'openDialog':
          setDialog(event.content);
          break;
        case 'promptChange':
          setPrompt(event.prompt);
          break;
        case 'sceneChanged':
          setScene(event.scene);
          break;
      }
    });
    return unsubscribe;
  }, [game]);

  // pause the world whenever an overlay (start screen or dialog) is up
  useEffect(() => {
    game?.setPaused(!started || dialog !== null);
  }, [game, started, dialog]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleDialogAction = useCallback(
    (action: DialogAction) => {
      if (action.type === 'teleport-home') game?.returnHome();
      setDialog(null);
    },
    [game],
  );

  return (
    <div className="game-root">
      <GameCanvas onGame={setGame} />
      {started && <HUD prompt={dialog ? null : prompt} scene={scene} isTouch={isTouch} />}
      {started && isTouch && !dialog && game && <TouchControls virtual={game.virtualInput} />}
      {dialog && (
        <DialogPanel content={dialog} onClose={closeDialog} onAction={handleDialogAction} isTouch={isTouch} />
      )}
      {!started && <StartScreen onStart={() => setStarted(true)} isTouch={isTouch} />}
    </div>
  );
}

export default App;
