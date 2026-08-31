import { education } from '../data/education';
import { hobbies } from '../data/hobbies';
import { profileData, summary } from '../data/profile';
import { gardenBeds, pottedPlants, rackTools } from '../data/skills';
import { workExperience } from '../data/work-experience';
import { TimelineItem } from '../data/types';

// Always-mounted, visually-hidden text rendering of the CV. The game canvas
// is aria-hidden and its dialogs only exist once a visitor has walked to and
// interacted with something, so without this the CV has no representation
// outside the canvas at all - unreachable by a screen reader, invisible to
// find-in-page, and absent from the DOM for anything that doesn't play.
//
// This deliberately reads straight from src/data/*.ts rather than through
// game/content/dialogs.ts's mapper functions (careerDialog, educationDialog,
// etc.): those build a flat { meta, lines, tags } shape for a single game
// dialog at a time, not a nested heading outline across many entries, and
// their phrasing (e.g. the "(part-time)" suffix, combined meta strings) is
// tuned for a compact dialog panel rather than a linear document. Reading
// the data directly is simpler than routing through a shape built for a
// different reader.
export function CvContent() {
  return (
    <div className="sr-only">
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
