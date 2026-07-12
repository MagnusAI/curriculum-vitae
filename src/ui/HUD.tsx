import { useDownloadPdf } from './useDownloadPdf';

interface HUDProps {
  prompt: string | null;
  scene: string;
  isTouch: boolean;
}

export function HUD({ prompt, scene, isTouch }: HUDProps) {
  const { busy, download } = useDownloadPdf();

  return (
    <div className="hud">
      <div className="hud-scene">
        {scene === 'house' ? '🏠 Home' : scene === 'mountain' ? '🏔️ Education Trail' : '🌍 The Grounds'}
      </div>
      <div className="hud-top">
        <button className="pixel-button" onClick={download} disabled={busy}>
          {busy ? 'Baking…' : '📄 CV PDF'}
        </button>
      </div>
      {prompt && (
        <div className="hud-prompt">{isTouch ? `👆 ${prompt}` : `E · ${prompt}`}</div>
      )}
    </div>
  );
}
