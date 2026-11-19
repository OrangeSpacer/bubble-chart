import { CHART, type ChartLayout } from '../constants/chart';
import type { Axis } from '../../Axis/utils/axis';
import type { ChartZone } from '../../../types/chart';
import { getZoneBounds } from '../../Zone/utils/zones';

export function createProjection(xAxis: Axis, yAxis: Axis, layout: ChartLayout = CHART) {
  return {
    layout,
    x: (value: number) => layout.left + xAxis.position(value),
    y: (value: number) => layout.top + layout.plotHeight - yAxis.position(value),
    // Заливки крайних зон заполняют и защитный отступ вокруг данных.
    zoneX: (value: number) =>
      value <= xAxis.min
        ? layout.left
        : value >= xAxis.max
          ? layout.left + layout.plotWidth
          : layout.left + xAxis.position(value),
    zoneY: (value: number) =>
      value <= yAxis.min
        ? layout.top + layout.plotHeight
        : value >= yAxis.max
          ? layout.top
          : layout.top + layout.plotHeight - yAxis.position(value),
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
  const { left, top, plotWidth, plotHeight } = projection.layout;
  const right = left + plotWidth;
  const bottom = top + plotHeight;
  const x = Math.max(left, Math.min(right, projection.zoneX(bounds.x1)));
  const x2 = Math.max(left, Math.min(right, projection.zoneX(bounds.x2)));
  const y = Math.max(top, Math.min(bottom, projection.zoneY(bounds.y2)));
  const y2 = Math.max(top, Math.min(bottom, projection.zoneY(bounds.y1)));
  return x2 > x && y2 > y ? { x, y, width: x2 - x, height: y2 - y } : null;
}
