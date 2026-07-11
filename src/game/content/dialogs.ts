import { profileData, summary } from '../../data/profile';
import { workExperience } from '../../data/work-experience';
import { Hobby, TimelineItem } from '../../data/types';
import { DialogContent } from '../events';

const PART_TIME = /part[- ]?time\s*/i;

function roleTitle(item: TimelineItem): string {
  return item.title.replace(PART_TIME, '').trim();
}

function isPartTime(item: TimelineItem): boolean {
  return PART_TIME.test(item.title);
}

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

export function skillsDialog(category: { name: string; skills: string[] }): DialogContent {
  return {
    title: category.name,
    subtitle: 'Skills',
    icon: '🌾',
    sections: [{ tags: category.skills }],
  };
}

export function hobbyDialog(hobby: Hobby): DialogContent {
  return {
    title: hobby.name,
    subtitle: 'Hobby',
    icon: '🐾',
    sections: [{ lines: [hobby.description] }],
  };
}

export function workDialog(): DialogContent {
  return {
    title: 'Work Experience',
    subtitle: `${profileData.name} — ${profileData.title}`,
    icon: '💻',
    sections: workExperience.map((item) => ({
      heading: `${roleTitle(item)} · ${item.organization}${isPartTime(item) ? ' (part-time)' : ''}`,
      meta: `${item.location} · ${item.period}`,
      lines: item.description,
    })),
  };
}

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

export function pianoDialog(): DialogContent {
  return {
    title: 'The Piano',
    subtitle: 'Music corner',
    icon: '🎹',
    sections: [
      {
        lines: [
          'Magnus unwinds at the keys — mostly classical pieces, occasionally game soundtracks.',
          'You just heard a few bars of Für Elise. He promises it sounds better in person.',
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

export function skillsFieldSign(): DialogContent {
  return {
    title: 'Skill Fields',
    subtitle: 'The crops of knowledge',
    icon: '🌾',
    sections: [
      {
        lines: [
          'Each field grows a different crop of skills. Walk up to a row sign to inspect what’s planted.',
        ],
      },
    ],
  };
}
