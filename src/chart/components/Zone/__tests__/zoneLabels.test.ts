import { describe, expect, it } from 'vitest';
import { getZoneLabels } from '../utils/zoneLabels';
import type { ChartZone } from '../../../types';

const rectangle = { x: 100, y: 100, width: 200, height: 120 };
const zone: ChartZone = {
  id: 'a',
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 10,
  color: '#fff',
  title: 'Title',
  subtitle: 'Subtitle',
};

describe('zone labels', () => {
  it.each(['top', 'bottom'] as const)(
    'places a title/subtitle block at %s + left/right',
    (vertical) => {
      for (const horizontal of ['left', 'right'] as const) {
        const labels = getZoneLabels(rectangle, {
          ...zone,
          titlePosition: { vertical, horizontal },
        });
        expect(labels.map((label) => label.align)).toEqual([horizontal, horizontal]);
        expect(labels.map((label) => label.text)).toEqual(['Title', 'Subtitle']);
        expect(labels[0].y).toBe(vertical === 'top' ? 8 : 74);
        expect(labels[1].y).toBe(labels[0].y + 22);
        expect(labels[1].y + labels[1].height).toBeLessThanOrEqual(rectangle.height - 8);
      }
    },
  );

  it('supports independent positions for title and subtitle', () => {
    const labels = getZoneLabels(rectangle, {
      ...zone,
      titlePosition: { vertical: 'top', horizontal: 'left' },
      subtitlePosition: { vertical: 'bottom', horizontal: 'right' },
    });
    expect(labels[0]).toMatchObject({ align: 'left', y: 8 });
    expect(labels[1]).toMatchObject({ align: 'right', y: 96 });
  });

  it('handles missing text and narrow rectangles', () => {
    expect(getZoneLabels(rectangle, { ...zone, title: '', subtitle: undefined })).toEqual([]);
    expect(getZoneLabels({ ...rectangle, width: 10 }, zone)).toEqual([]);
    expect(getZoneLabels(rectangle, { ...zone, title: undefined })).toHaveLength(1);
    expect(getZoneLabels({ ...rectangle, height: 10 }, zone).every((label) => label.y >= 8)).toBe(
      true,
    );
  });
});
