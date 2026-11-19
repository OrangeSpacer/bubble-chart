import type { Bubble, ChartZone } from '../../../types';

export function getZoneBounds(zone: Pick<ChartZone, 'x1' | 'x2' | 'y1' | 'y2'>) {
  if (![zone.x1, zone.x2, zone.y1, zone.y2].every(Number.isFinite)) return null;
  const x1 = Math.min(zone.x1, zone.x2);
  const x2 = Math.max(zone.x1, zone.x2);
  const y1 = Math.min(zone.y1, zone.y2);
  const y2 = Math.max(zone.y1, zone.y2);
  return x1 < x2 && y1 < y2 ? { x1, x2, y1, y2 } : null;
}

/** Полуоткрытые интервалы исключают двойной подсчёт на общей границе соседних зон. */
export function isPointInZone(point: Pick<Bubble, 'x' | 'y'>, zone: ChartZone): boolean {
  const bounds = getZoneBounds(zone);
  return (
    bounds !== null &&
    point.x >= bounds.x1 &&
    point.x < bounds.x2 &&
    point.y >= bounds.y1 &&
    point.y < bounds.y2
  );
}

export function getZonesForBubble(
  point: Pick<Bubble, 'x' | 'y'>,
  zones: readonly ChartZone[],
): ChartZone[] {
  return zones.filter((zone) => isPointInZone(point, zone));
}

export function countZones(data: readonly Bubble[], zones: readonly ChartZone[]): number[] {
  return zones.map((zone) => data.filter((bubble) => isPointInZone(bubble, zone)).length);
}
