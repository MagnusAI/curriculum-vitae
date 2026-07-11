// Shared CV data types
export interface TimelineItem {
  title: string;
  organization: string;
  location: string;
  period: string;
  description?: string[];
  type: 'work' | 'education';
  defaultExpanded?: boolean;
}

export type HobbyAnimal = 'dog' | 'chicken' | 'cow' | 'sheep';

export interface Hobby {
  name: string;
  description: string;
  animal: HobbyAnimal;
}
