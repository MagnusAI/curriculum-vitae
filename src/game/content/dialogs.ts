import { profileData, summary } from '../../data/profile';
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
  finance: 'Finance 🌲',
  software: 'Software 🌳',
  retail: 'Retail 🍎',
};

// ---------------------------------------------------------------- education
export function educationDialog(item: TimelineItem): DialogContent {
  return {
    title: item.title,
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
          '“Oh, you must be here about Magnus! Let me tell you about him…”',
          summary,
          '“He built this whole little world himself, you know. The dog insisted on being included.”',
        ],
      },
    ],
  };
}

export function bookshelfDialog(): DialogContent {
  return {
    title: 'The Bookshelf',
    subtitle: 'About this CV',
    icon: '📚',
    sections: [
      {
        lines: [
          'This interactive CV is hand-built with React, TypeScript and a custom HTML5 canvas engine — no game framework.',
          'Even the pixel art is generated from code. Prefer paper? Grab the PDF from the menu.',
        ],
      },
    ],
  };
}

// -------------------------------------------------- zone grammar legends
export function welcomeDialog(): DialogContent {
  return {
    title: 'Welcome, visitor!',
    subtitle: "Magnus Arnild's world",
    icon: '🗺️',
    sections: [
      {
        lines: [
          'You are controlling Magnus. Walk around and poke at things!',
          '🏔️ North — Education Mountain: climb the trail',
          '🌲 East — the Career Forest: one tree per job',
          '🌱 South-west — the Skills Yard',
          '🏕️ South-east — the campsite',
          '🏠 And do step inside the house.',
        ],
      },
    ],
  };
}

export function mountainSignDialog(): DialogContent {
  return {
    title: 'Education Mountain',
    subtitle: 'How to read this zone',
    icon: '🏔️',
    sections: [
      {
        lines: [
          'Education is the foundation everything else stands on — so it gets a mountain.',
          'The higher a checkpoint sits on the trail, the higher the education. The lookout tower at the summit marks the master’s degree.',
          'Interact with each waymark, cabin and tower for the details.',
        ],
      },
    ],
  };
}

export function forestSignDialog(): DialogContent {
  return {
    title: 'Career Forest',
    subtitle: 'How to read this zone',
    icon: '🌲',
    sections: [
      {
        lines: [
          'One planted tree per job, oldest on the left — a timeline you can walk along.',
          'Bigger tree = longer tenure (sapling → young → mature).',
          'Species = industry: 🌲 pine is finance, 🌳 broadleaf is software, 🍎 fruit tree is retail.',
          'The wild trees around them are just forest — the planted row follows the path.',
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
