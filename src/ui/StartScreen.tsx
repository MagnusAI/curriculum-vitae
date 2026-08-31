import { profileData } from '../data/profile';
import { useDownloadPdf } from './useDownloadPdf';

interface StartScreenProps {
  onStart: () => void;
  onViewCv: () => void;
  isTouch: boolean;
}

export function StartScreen({ onStart, onViewCv, isTouch }: StartScreenProps) {
  const { busy, download } = useDownloadPdf();

  return (
    <div className="start-screen">
      <div className="pixel-panel start-panel">
        <img className="start-photo" src={profileData.imageUrl} alt="Photo of Magnus Arnild" />
        {/* h2/h3, not h1/h2: CvContent (always mounted, see App.tsx) owns the
            page's one h1, and this panel unmounts once the game starts. */}
        <h2>Magnus Arnild</h2>
        <h3>Software Engineer · Interactive CV</h3>
        <p>
          You've stepped out of the CV and into the pixel world it's built from. Walk around and
          find out more: the forest holds my career, the garden grows my skills, the mountains
          represent my education — and my hobbies are spread all over the world.
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
          <button className="pixel-button secondary" onClick={onViewCv}>
            📖 Read the CV
          </button>
          <button className="pixel-button secondary" onClick={download} disabled={busy}>
            {busy ? 'Baking…' : '📄 Boring PDF version'}
          </button>
        </div>
        <p className="sr-only">
          This is an optional interactive game mode, reached by leaving the main CV page. Use
          "Read the CV" to go back to it, or download it as a PDF from here.
        </p>
      </div>
    </div>
  );
}
