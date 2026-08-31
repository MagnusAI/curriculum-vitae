// Asserts every CV data entry survives the transform into the DialogContent
// model that DialogPanel renders (see DialogPanel.test.tsx for proof that
// DialogContent itself reaches the DOM). Together the two files cover the
// full path from data -> rendered output for issue #13.
import { describe, expect, it } from 'vitest';
import { education } from '../../data/education';
import { gardenBeds, pottedPlants, rackTools } from '../../data/skills';
import { workExperience } from '../../data/work-experience';
import { DialogContent } from '../events';
import { bedDialog, careerDialog, educationDialog, potDialog, toolRackDialog } from './dialogs';

function flatten(content: DialogContent): string {
  return [
    content.title,
    content.subtitle,
    ...content.sections.flatMap((section) => [
      section.heading,
      section.meta,
      ...(section.lines ?? []),
      ...(section.tags ?? []),
    ]),
  ]
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

describe('careerDialog reaches every work-experience entry', () => {
  for (const item of workExperience) {
    it(`includes ${item.organization} (${item.period})`, () => {
      const rendered = flatten(careerDialog(item));
      expect(rendered).toContain(item.organization);
      expect(rendered).toContain(item.period);
    });
  }
});

describe('educationDialog reaches every education entry', () => {
  for (const item of education) {
    it(`includes ${item.organization} (${item.period})`, () => {
      const rendered = flatten(educationDialog(item));
      // The sign shows `signTitle` when present, the full `title` otherwise -
      // assert whichever one the dialog actually used, not the other.
      expect(rendered).toContain(item.signTitle ?? item.title);
      expect(rendered).toContain(item.organization);
      expect(rendered).toContain(item.period);
    });
  }
});

describe('bedDialog reaches every garden bed', () => {
  for (const bed of gardenBeds) {
    it(`includes the ${bed.name} bed and its skills`, () => {
      const rendered = flatten(bedDialog(bed));
      expect(rendered).toContain(bed.name);
      for (const skill of bed.skills) expect(rendered).toContain(skill);
    });
  }
});

describe('potDialog reaches every potted plant', () => {
  for (const plant of pottedPlants) {
    it(`includes ${plant.name}`, () => {
      const rendered = flatten(potDialog(plant));
      expect(rendered).toContain(plant.name);
    });
  }
});

describe('toolRackDialog reaches every rack tool', () => {
  // Unlike the other skill types, every tool is listed inside one shared
  // dialog rather than getting its own - so this asserts each tool's name
  // appears in that single dialog, rather than iterating one dialog per tool.
  it('includes every tool name', () => {
    const rendered = flatten(toolRackDialog(rackTools));
    for (const tool of rackTools) expect(rendered).toContain(tool.name);
  });
});
