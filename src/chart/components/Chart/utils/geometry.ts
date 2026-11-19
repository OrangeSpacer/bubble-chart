import { CHART } from '../constants/chart';
import type { Axis } from '../../Axis/utils/axis';
import type { ChartZone } from '../../../types';
import { getZoneBounds } from '../../Zone/utils/zones';

export function createProjection(xAxis: Axis, yAxis: Axis) {
  return {
    x: (value: number) => CHART.left + xAxis.position(value),
    y: (value: number) => CHART.top + CHART.plotHeight - yAxis.position(value),
  };
}

export type Projection = ReturnType<typeof createProjection>;

export interface ZoneRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getZoneGeometry(projection: Projection, zone: ChartZone): ZoneRectangle | null {
  const bounds = getZoneBounds(zone);
  if (!bounds) return null;
  const { left, top, plotWidth, plotHeight } = CHART;
  const right = left + plotWidth;
  const bottom = top + plotHeight;
  const x = Math.max(left, Math.min(right, projection.x(bounds.x1)));
  const x2 = Math.max(left, Math.min(right, projection.x(bounds.x2)));
  const y = Math.max(top, Math.min(bottom, projection.y(bounds.y2)));
  const y2 = Math.max(top, Math.min(bottom, projection.y(bounds.y1)));
  return x2 > x && y2 > y ? { x, y, width: x2 - x, height: y2 - y } : null;
}
