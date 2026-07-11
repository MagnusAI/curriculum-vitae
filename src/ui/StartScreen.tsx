import { profileData } from '../data/profile';
import { useDownloadPdf } from './useDownloadPdf';

interface StartScreenProps {
  onStart: () => void;
  isTouch: boolean;
}

export function StartScreen({ onStart, isTouch }: StartScreenProps) {
  const { busy, download } = useDownloadPdf();

  return (
    <div className="start-screen">
      <div className="pixel-panel start-panel">
        <img className="start-photo" src={profileData.imageUrl} alt="Photo of Magnus Arnild" />
        <h1>Magnus Arnild</h1>
        <h2>Software Engineer · Interactive CV</h2>
        <p>
          Welcome to my little pixel world! Walk around as me: the forest holds my education, the
          fields grow my skills, the meadow keeps my hobbies — and my wife, piano and computer are
          in the house.
        </p>
        <div className="start-controls">
          {isTouch ? (
            <>
              🕹️ D-pad to walk
              <br />✋ Button to interact
            </>
          ) : (
            <>
              ⌨️ WASD / arrow keys to walk
              <br />⚡ E / Enter to interact
            </>
          )}
        </div>
        <div className="start-buttons">
          <button className="pixel-button" onClick={onStart} autoFocus>
            ▶ Explore
          </button>
          <button className="pixel-button secondary" onClick={download} disabled={busy}>
            {busy ? 'Baking…' : '📄 Boring PDF version'}
          </button>
        </div>
        <p className="sr-only">
          This page is an interactive game. If you prefer a standard document, use the download
          button to get the CV as a PDF.
        </p>
      </div>
    </div>
  );
}
