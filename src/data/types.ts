// Shared CV data types
export type Sector = 'finance' | 'software' | 'retail';

export interface TimelineItem {
  title: string;
  organization: string;
  location: string;
  period: string;
  description?: string[];
  type: 'work' | 'education';
  // Shorter heading used on the in-world sign/waymark; overviews keep `title`.
  signTitle?: string;
  // Industry of the employer — controls the tree species in the Career Forest.
  sector?: Sector;
  defaultExpanded?: boolean;
}

export type HobbySpot = 'campsite' | 'piano' | 'desk';

export interface Hobby {
  name: string;
  description: string;
  spot: HobbySpot;
}

// Skills Yard structures
export interface GardenBed {
  name: string;
  // 1 = sprouting, 2 = growing, 3 = flourishing — controls the bed's growth stage sprite
  proficiency: 1 | 2 | 3;
  skills: string[];
}

export interface PottedPlant {
  name: string;
  note?: string;
}

export interface RackTool {
  name: string;
  // 1 = occasional, 2 = regular, 3 = daily driver
  usage: 1 | 2 | 3;
}
