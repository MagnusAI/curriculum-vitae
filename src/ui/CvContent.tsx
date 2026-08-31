import { useEffect, useRef } from 'react';
import { education } from '../data/education';
import { hobbies } from '../data/hobbies';
import { profileData, summary } from '../data/profile';
import { gardenBeds, pottedPlants, rackTools } from '../data/skills';
import { workExperience } from '../data/work-experience';
import { TimelineItem } from '../data/types';
import { useFocusTrap } from './useFocusTrap';

interface CvContentProps {
  // false (default): the always-mounted, screen-reader/find-in-page-only
  // rendering from #8 - unchanged, no close button, identical output.
  // true: the same content, same single heading structure, made visible
  // in place instead of clipped - see #17. There is deliberately only
  // ever one instance of this content in the DOM; toggling `visible`
  // restyles it rather than mounting a second copy, so the page never
  // ends up with the CV described twice at two different heading depths.
  visible?: boolean;
  onClose?: () => void;
}

// Always-mounted text rendering of the CV, visually hidden by default. The
// game canvas is aria-hidden and its dialogs only exist once a visitor has
// walked to and interacted with something, so without this the CV has no
// representation outside the canvas at all - unreachable by a screen
// reader, invisible to find-in-page, and absent from the DOM for anything
// that doesn't play (#8). Passing `visible` additionally makes it seeable
// on screen without playing at all (#17).
//
// This deliberately reads straight from src/data/*.ts rather than through
// game/content/dialogs.ts's mapper functions (careerDialog, educationDialog,
// etc.): those build a flat { meta, lines, tags } shape for a single game
// dialog at a time, not a nested heading outline across many entries, and
// their phrasing (e.g. the "(part-time)" suffix, combined meta strings) is
// tuned for a compact dialog panel rather than a linear document. Reading
// the data directly is simpler than routing through a shape built for a
// different reader.
export function CvContent({ visible = false, onClose }: CvContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useFocusTrap(rootRef, visible);

  // Escape-to-close, matching DialogPanel's existing pattern. Deliberately
  // not E/Enter/Space too: those are the game's interact keys, and #17's
  // AC2 is specifically that no game control is needed to see this content
  // - binding them here would blur that line rather than clarify it.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  return (
    <div ref={rootRef} className={visible ? 'cv-visible' : 'sr-only'} tabIndex={visible ? -1 : undefined}>
      {visible && (
        <button className="dialog-close cv-visible-close" onClick={onClose} aria-label="Close CV">
          ✕
        </button>
      )}
      <h1>
        {profileData.name} — {profileData.title}
      </h1>
      <p>{profileData.bio}</p>
      <p>{summary}</p>

      <h2>Work Experience</h2>
      {workExperience.map((item) => (
        <TimelineEntry key={`${item.organization}-${item.period}`} item={item} />
      ))}

      <h2>Education</h2>
      {education.map((item) => (
        <TimelineEntry key={`${item.organization}-${item.period}`} item={item} />
      ))}

      <h2>Skills</h2>
      {gardenBeds.map((bed) => (
        <section key={bed.name}>
          <h3>{bed.name}</h3>
          <p>{bed.skills.join(', ')}</p>
        </section>
      ))}
      {pottedPlants.length > 0 && (
        <section>
          {/* One shared heading for every plant, matching how the tool rack
              below (and the game's own toolRackDialog) already groups many
              small items under a single heading rather than one each. */}
          <h3>Also developing</h3>
          <p>{pottedPlants.map((plant) => plant.name).join(', ')}</p>
        </section>
      )}
      {rackTools.length > 0 && (
        <section>
          <h3>Tools</h3>
          <p>{rackTools.map((tool) => tool.name).join(', ')}</p>
        </section>
      )}

      <h2>Hobbies</h2>
      {hobbies.map((hobby) => (
        <section key={hobby.name}>
          <h3>{hobby.name}</h3>
          <p>{hobby.description}</p>
        </section>
      ))}
    </div>
  );
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  return (
    <section>
      <h3>
        {item.title} — {item.organization}
      </h3>
      <p>
        {item.location} · {item.period}
      </p>
      {item.description?.map((line) => <p key={line}>{line}</p>)}
    </section>
  );
}
