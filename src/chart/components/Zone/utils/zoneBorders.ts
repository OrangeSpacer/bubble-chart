import type { ChartLayout } from '../../Chart/constants/chart';
import type { ZoneRectangle } from '../../Chart/utils/geometry';

/** Рисуем только внутренние стороны зоны, исключая пунктир на внешних краях графика. */
export function getZoneBorderSegments(rectangle: ZoneRectangle, layout: ChartLayout): number[][] {
  const { x, y, width, height } = rectangle;
  const right = layout.left + layout.plotWidth;
  const bottom = layout.top + layout.plotHeight;
  const segments: number[][] = [];
  const epsilon = 0.01;
  if (x > layout.left + epsilon) segments.push([0, 0, 0, height]);
  if (x + width < right - epsilon) segments.push([width, 0, width, height]);
  if (y > layout.top + epsilon) segments.push([0, 0, width, 0]);
  if (y + height < bottom - epsilon) segments.push([0, height, width, height]);
  return segments;
}
