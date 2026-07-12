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
  finance: 'Finance (birch)',
  software: 'Software (oak)',
  retail: 'Retail (fruit tree)',
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
          '🏔️ North — take the path between the lakes to climb Education Mountain',
          '🌲 South-east — the Career Forest: one planted tree per job',
          '🌱 South-west — the garden: skills growing in beds, pots and on the tool rack',
          '🏕️ East — the campsite',
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
          'Follow this path between the lakes and take the winding trail up. The higher a waymark sits, the higher the education — the flag at the summit marks the master’s degree.',
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
          'Species = industry: white-barked birch is finance, broadleaf oak is software, 🍎 fruit tree is retail.',
          'The pines themselves are just the fence — only signed trees talk.',
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
