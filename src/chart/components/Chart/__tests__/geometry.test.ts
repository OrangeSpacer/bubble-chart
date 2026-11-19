import { describe, expect, it } from 'vitest';
import { createAxis } from '../../Axis/utils/axis';
import { CHART } from '../constants/chart';
import { createProjection, getZoneGeometry } from '../utils/geometry';
import type { ChartZone } from '../../../types/chart';

const zone: ChartZone = { id: 'test', x1: 10, x2: 40, y1: 20, y2: 60, color: '#fff' };

describe('zone projection', () => {
  it('projects data bounds with an inverted Y axis', () => {
    const projection = createProjection(
      createAxis([50], 635, 5, 'linear'),
      createAxis([80], 375, 5, 'linear'),
    );
    expect(getZoneGeometry(projection, zone)).toEqual({
      x: 65 + 127,
      y: 22 + 93.75,
      width: 381,
      height: 187.5,
    });
    expect(getZoneGeometry(projection, { ...zone, x1: 40, x2: 10, y1: 60, y2: 20 })).toEqual(
      getZoneGeometry(projection, zone),
    );
  });

  it.each(['linear', 'grouped'] as const)(
    'clips independent rectangles without changing %s axes',
    (mode) => {
      const xAxis = createAxis([8, 12, 45], CHART.plotWidth, 5, mode);
      const yAxis = createAxis([21, 44, 72], CHART.plotHeight, 5, mode);
      const before = structuredClone([xAxis.ticks, yAxis.ticks]);
      const projection = createProjection(xAxis, yAxis);
      expect(
        getZoneGeometry(projection, { ...zone, x1: -100, x2: 1000, y1: -100, y2: 1000 }),
      ).toEqual({ x: CHART.left, y: CHART.top, width: CHART.plotWidth, height: CHART.plotHeight });
      expect(getZoneGeometry(projection, { ...zone, x1: 100, x2: 200 })).toBeNull();
      expect(getZoneGeometry(projection, { ...zone, x1: -20, x2: -10 })).toBeNull();
      expect(getZoneGeometry(projection, { ...zone, y1: 100, y2: 200 })).toBeNull();
      expect([xAxis.ticks, yAxis.ticks]).toEqual(before);
    },
  );

  it.each([{ x1: NaN }, { y2: Infinity }, { x1: 40 }, { y1: 60 }])(
    'ignores invalid or zero-area bounds %j',
    (patch) => {
      const projection = createProjection(
        createAxis([50], 635, 5, 'linear'),
        createAxis([80], 375, 5, 'linear'),
      );
      expect(getZoneGeometry(projection, { ...zone, ...patch })).toBeNull();
    },
  );
});
