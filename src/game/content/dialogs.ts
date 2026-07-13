import { education } from '../../data/education';
import { profileData } from '../../data/profile';
import { gardenBeds, pottedPlants, rackTools } from '../../data/skills';
import { workExperience } from '../../data/work-experience';
import { GardenBed, Hobby, PottedPlant, RackTool, TimelineItem } from '../../data/types';
import { DialogContent } from '../events';
import { tenureLabel, tenureMonths } from './tenure';

const PART_TIME = /part[- ]?time\s*/i;

function roleTitle(item: TimelineItem): string {
  return item.title.replace(PART_TIME, '').trim();
}

function isPartTime(item: TimelineItem): boolean {
  return PART_TIME.test(item.title);
}

const SECTOR_LABEL: Record<string, string> = {
  finance: 'Finance (birch)',
  software: 'Software (oak)',
  retail: 'Retail (fruit tree)',
};

// ---------------------------------------------------------------- education
export function educationDialog(item: TimelineItem): DialogContent {
  return {
    title: item.signTitle ?? item.title,
    subtitle: item.organization,
    icon: '🎓',
    sections: [
      {
        meta: `${item.location} · ${item.period}`,
        lines: item.description,
      },
    ],
  };
}

// ------------------------------------------------------------------- career
export function careerDialog(item: TimelineItem): DialogContent {
  const months = tenureMonths(item.period);
  const tenure = tenureLabel(months);
  const metaBits = [item.location, item.period];
  if (tenure) metaBits.push(tenure);
  return {
    title: `${roleTitle(item)}${isPartTime(item) ? ' (part-time)' : ''}`,
    subtitle: `${item.organization}${item.sector ? ` · ${SECTOR_LABEL[item.sector] ?? item.sector}` : ''}`,
    icon: '💼',
    sections: [
      {
        meta: metaBits.join(' · '),
        lines: item.description,
      },
    ],
  };
}

// -------------------------------------------------------------- skills yard
const PROFICIENCY_LABEL: Record<number, string> = {
  1: 'Sprouting — actively growing',
  2: 'Growing well — solid and dependable',
  3: 'Flourishing — home turf',
};

export function bedDialog(bed: GardenBed): DialogContent {
  return {
    title: bed.name,
    subtitle: 'Raised garden bed · growth = proficiency',
    icon: '🌱',
    sections: [
      {
        meta: PROFICIENCY_LABEL[bed.proficiency],
        tags: bed.skills,
      },
    ],
  };
}

export function potDialog(plant: PottedPlant): DialogContent {
  return {
    title: plant.name,
    subtitle: 'Potted plant · tended daily',
    icon: '🪴',
    sections: [{ lines: plant.note ? [plant.note] : undefined }],
  };
}

const USAGE_LABEL: Record<number, string> = {
  1: 'on the shelf',
  2: 'well used',
  3: 'worn smooth — daily driver',
};

export function toolRackDialog(tools: RackTool[]): DialogContent {
  return {
    title: 'The Tool Rack',
    subtitle: 'Shinier handle = used more',
    icon: '🛠️',
    sections: [
      {
        lines: [...tools]
          .sort((a, b) => b.usage - a.usage)
          .map((tool) => `${tool.name} — ${USAGE_LABEL[tool.usage]}`),
      },
    ],
  };
}

// ------------------------------------------------------------------ hobbies
export function hobbyDialog(hobby: Hobby, extraLine?: string): DialogContent {
  const lines = [hobby.description];
  if (extraLine) lines.push(extraLine);
  return {
    title: hobby.name,
    subtitle: 'Hobby',
    icon: hobby.spot === 'campsite' ? '🏕️' : hobby.spot === 'piano' ? '🎹' : '🖥️',
    sections: [{ lines }],
  };
}

// ------------------------------------------------------------- world flavor
export function mailboxDialog(): DialogContent {
  return {
    title: profileData.name,
    subtitle: profileData.title,
    icon: '📫',
    sections: [
      { lines: [profileData.bio] },
      {
        heading: 'Get in touch',
        lines: ['GitHub: github.com/arnildtech', 'LinkedIn: linkedin.com/in/magnus-arnild'],
      },
    ],
  };
}

export function wifeDialog(): DialogContent {
  return {
    title: 'Wife',
    subtitle: 'She knows him best',
    icon: '💬',
    sections: [
      {
        lines: [
          '“Oh, you must be here about Magnus! We are married and live here together — along with our lovely dog, who follows him around whenever he gets the chance.”',
          '“Magnus is a Software Engineer with wide-ranging knowledge of building, fixing, and maintaining almost anything. He can fix just about everything around the house, too.”',
        ],
      },
      {
        heading: 'When he is not working…',
        lines: [
          'He loves hiking & survival trips — spending real time outdoors, away from screens.',
          'He plays wonderful music on the piano — one of his favourite ways to unwind. He learned to play all by himself.',
          'He plays games with friends and tinkers with programming on his computer — video games and hobby projects; building small things for fun is how this very pixel world came to be.',
          'He also tinkers with hardware and 3D printing.',
        ],
      },
      {
        lines: ['“Take a look around the house to find out more about his hobbies.”'],
      },
    ],
  };
}

// ---------------------------------------------------------- guide NPCs
// Each area guide introduces the zone AND gives the full overview for
// visitors who don't want to click every object.

export function foresterDialog(): DialogContent {
  const chrono = [...workExperience].reverse();
  return {
    title: 'The Forester',
    subtitle: 'Keeper of the Career Grove',
    icon: '🌲',
    sections: [
      {
        lines: [
          '“Hey there! This grove tells the story of Magnus’ working life — every planted tree is a job. The longer he stayed, the bigger the tree, and the species tells you the industry. Each one has its own sign.”',
        ],
      },
      {
        heading: "In a hurry? Here's the overview:",
        lines: chrono.map(
          (item) =>
            `${item.period} · ${item.organization} — ${roleTitle(item)}${isPartTime(item) ? ' (part-time)' : ''}`,
        ),
      },
      {
        lines: ['“Wander around and inspect the trees for the details — the pines are just the fence.”'],
      },
    ],
  };
}

export function mountainGuideDialog(): DialogContent {
  const chrono = [...education].reverse();
  return {
    title: 'The Mountain Guide',
    subtitle: 'Welcome to Education Mountain',
    icon: '🏔️',
    sections: [
      {
        lines: [
          '“Welcome to the mountains! This trail climbs through Magnus’ education — the flag at the summit marks his Master of Science.”',
        ],
      },
      {
        heading: 'The short version, bottom to top:',
        lines: chrono.map((item) => `${item.period} · ${item.organization} — ${item.title}`),
      },
      {
        lines: ['“Take your time on the switchbacks — and the sign at the very top can teleport you straight home.”'],
      },
    ],
  };
}

export function gardenerDialog(): DialogContent {
  return {
    title: 'The Gardener',
    subtitle: 'Tender of the Skills Garden',
    icon: '🌱',
    sections: [
      {
        lines: [
          '“Everything Magnus knows, we grow right here. The fuller a bed, the stronger the skill — the pots are things still growing, and the rack holds his everyday tools.”',
        ],
      },
      {
        heading: 'What’s planted in the beds:',
        lines: gardenBeds.map((bed) => `${bed.name}: ${bed.skills.join(', ')}`),
      },
      {
        heading: 'And around the garden:',
        lines: [
          `In the pots: ${pottedPlants.map((plant) => plant.name).join(', ')}`,
          `On the tool rack: ${rackTools.map((tool) => tool.name).join(', ')}`,
        ],
      },
    ],
  };
}

export function hikingBuddyDialog(): DialogContent {
  return {
    title: 'The Hiking Buddy',
    subtitle: 'Warming up by the fire',
    icon: '🔥',
    sections: [
      {
        lines: [
          '“Pull up a log! Magnus and I go way back — he loves hiking, and we head out on survival trips together whenever we can get away. Tents, campfire, no screens.”',
          '“If you want to know what he does when he’s not in the wild, head to his house — his wife can tell you the rest.”',
        ],
      },
    ],
  };
}

export function robotDialog(): DialogContent {
  return {
    title: 'The Cleaning Robot',
    subtitle: 'Beep boop — tidying up',
    icon: '🤖',
    sections: [
      {
        lines: [
          '“*whirr* Oh, a visitor! I keep the house tidy while Magnus tinkers away.”',
          'Magnus loves playing around with robots and AI. His Master’s thesis was in robotics, and he spends a lot of time experimenting with AI agents.',
          '“Fun fact: this entire application was actually built while testing what AI agents can do. I might be one of his little experiments too. Beep.”',
        ],
      },
    ],
  };
}

export function bookshelfDialog(): DialogContent {
  return {
    title: 'The Bookshelf',
    subtitle: 'What Magnus reads',
    icon: '📚',
    sections: [
      {
        lines: [
          'I read a lot — both to learn and just for fun. Most of my physical books are educational, and I use them to keep my skills sharp.',
          'When I read to relax, it is mostly fantasy and fiction.',
        ],
      },
    ],
  };
}

// -------------------------------------------------- zone grammar legends
export function mountainSignDialog(): DialogContent {
  return {
    title: 'Education Mountain',
    subtitle: 'How to read this zone',
    icon: '🏔️',
    sections: [
      {
        lines: [
          'Education is the foundation everything else stands on — so it gets a mountain.',
          'Follow this path between the lakes, take the winding trail to the top, and read the signs along the way.',
        ],
      },
    ],
  };
}

export function forestSignDialog(): DialogContent {
  return {
    title: 'The Career Grove',
    subtitle: 'How to read this zone',
    icon: '🌲',
    sections: [
      {
        lines: [
          'Inside this ring of pines stands one planted tree per job, each with its own sign.',
          'Read them top row first, left to right — oldest job to newest.',
          'Bigger tree = longer tenure (sapling → young → mature).',
        ],
      },
    ],
  };
}

export function yardSignDialog(): DialogContent {
  return {
    title: 'Skills Yard',
    subtitle: 'How to read this zone',
    icon: '🌱',
    sections: [
      {
        lines: [
          'Raised beds are core skill areas — the fuller the bed grows, the stronger the proficiency.',
          'Potted plants are softer skills, tended and still growing.',
          'The tool rack holds concrete tools — the shinier the handle, the more it gets used.',
        ],
      },
    ],
  };
}
