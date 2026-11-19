import { describe, expect, it } from 'vitest';
import { countZones, getZonesForBubble, isPointInZone } from '../utils/zones';
import type { Bubble, ChartZone } from '../../../types';

const zones: ChartZone[] = [
  { id: 'left', x1: 0, x2: 15, y1: 0, y2: 40, color: '#fff' },
  { id: 'right', x1: 15, x2: 50, y1: 0, y2: 40, color: '#fff' },
  { id: 'upper', x1: 0, x2: 50, y1: 40, y2: 80, color: '#fff' },
];

describe('zone classification', () => {
  it('uses half-open bounds to assign shared edges once', () => {
    expect(getZonesForBubble({ x: 15, y: 39 }, zones).map((zone) => zone.id)).toEqual(['right']);
    expect(getZonesForBubble({ x: 15, y: 40 }, zones).map((zone) => zone.id)).toEqual(['upper']);
    expect(getZonesForBubble({ x: 50, y: 80 }, zones)).toEqual([]);
    expect(getZonesForBubble({ x: -1, y: 0 }, zones)).toEqual([]);
  });

  it('supports arbitrary counts, overlapping zones and reversed corners', () => {
    const overlapping = [...zones, { ...zones[0], id: 'overlap', x1: 20, x2: 0 }];
    const point: Bubble = { id: 1, name: 'A', x: 10, y: 20, size: 30, color: '#000' };
    expect(countZones([point], overlapping)).toEqual([1, 0, 0, 1]);
    expect(countZones([], zones)).toEqual([0, 0, 0]);
    expect(countZones([point], [])).toEqual([]);
    expect(isPointInZone(point, { ...zones[0], x2: NaN })).toBe(false);
    expect(isPointInZone(point, { ...zones[0], x2: 0 })).toBe(false);
  });
});
