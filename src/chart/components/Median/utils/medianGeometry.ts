import type { MedianSettings } from '../../../types/chart';
import type { ProjectedZone } from '../../Zone/utils/projectZones';
import { getZoneBorderSegments } from '../../Zone/utils/zoneBorders';
import type { Projection, ZoneRectangle } from '../../Chart/utils/geometry';
import { LABEL_HEIGHT, measureLabelWidth } from '../../Bubble/utils/labelText';

export interface MedianGeometry {
  axis: 'x' | 'y';
  value: number;
  points: number[];
  label?: ZoneRectangle & { text: string };
}

function overlap(a: ZoneRectangle, b: ZoneRectangle) {
  return (
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  );
}

/** X — справа от вертикальной линии; Y — над горизонтальной. При нехватке места меняем сторону. */
export function getMedianGeometry(
  settings: MedianSettings | undefined,
  projection: Projection,
  zones: readonly ProjectedZone[],
  obstacles: readonly ZoneRectangle[] = [],
): MedianGeometry[] {
  const result: MedianGeometry[] = [];
  const { left, top, plotWidth, plotHeight } = projection.layout;
  const right = left + plotWidth;
  const bottom = top + plotHeight;
  const borders = zones.flatMap(({ rectangle }) =>
    getZoneBorderSegments(rectangle, projection.layout).map((points) => [
      points[0] + rectangle.x,
      points[1] + rectangle.y,
      points[2] + rectangle.x,
      points[3] + rectangle.y,
    ]),
  );
  for (const axis of ['x', 'y'] as const) {
    const setting = settings?.[axis];
    if (!setting || !Number.isFinite(setting.value)) continue;
    const candidates = borders.filter((points) =>
      axis === 'x' ? points[0] === points[2] : points[1] === points[3],
    );
    if (!candidates.length) continue;
    const target = axis === 'x' ? projection.x(setting.value) : projection.y(setting.value);
    const index = axis === 'x' ? 0 : 1;
    const closest = candidates.reduce((best, points) =>
      Math.abs(points[index] - target) < Math.abs(best[index] - target) ? points : best,
    );
    const coordinate = closest[index];
    const matching = candidates.filter((points) => Math.abs(points[index] - coordinate) < 0.01);
    const otherIndex = axis === 'x' ? 1 : 0;
    const start = Math.min(
      ...matching.map((points) => Math.min(points[otherIndex], points[otherIndex + 2])),
    );
    const end = Math.max(
      ...matching.map((points) => Math.max(points[otherIndex], points[otherIndex + 2])),
    );
    const median: MedianGeometry = {
      axis,
      value: setting.value,
      points:
        axis === 'x' ? [coordinate, start, coordinate, end] : [start, coordinate, end, coordinate],
    };
    if (plotWidth > 16 && plotHeight >= LABEL_HEIGHT + 16) {
      const text = `Медиана ${setting.value}${setting.sign ?? ''}`;
      const width = Math.min(measureLabelWidth(text), plotWidth - 16);
      const height = LABEL_HEIGHT;
      const candidates: ZoneRectangle[] = [];
      if (axis === 'x') {
        const x =
          coordinate + 8 + width <= right - 8
            ? coordinate + 8
            : Math.max(left + 8, coordinate - width - 8);
        for (let y = top + 8; y + height <= bottom - 8; y += height + 4)
          candidates.push({ x, y, width, height });
      } else {
        const y =
          coordinate - height - 4 >= top + 8
            ? coordinate - height - 4
            : Math.min(bottom - height - 8, coordinate + 4);
        for (let x = right - width - 8; x >= left + 8; x -= 24)
          candidates.push({ x, y, width, height });
      }
      const occupied = [
        ...obstacles,
        ...result.flatMap((item) => (item.label ? [item.label] : [])),
      ];
      let best = candidates[0];
      let bestOverlap = Infinity;
      for (const candidate of candidates) {
        const area = occupied.reduce((sum, obstacle) => sum + overlap(candidate, obstacle), 0);
        if (area < bestOverlap) {
          best = candidate;
          bestOverlap = area;
        }
        if (area === 0) break;
      }
      if (best) median.label = { ...best, text };
    }
    result.push(median);
  }
  return result;
}
