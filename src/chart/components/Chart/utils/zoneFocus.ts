import type { ChartZone } from '../../../types';

const INACTIVE_OPACITY = 0.25;

/** Отсутствие связи с зоной сохраняет обычную прозрачность объекта. */
export function getZoneFocusOpacity(
  zoneId: ChartZone['id'] | null | undefined,
  activeZoneId: ChartZone['id'] | null | undefined,
): number {
  return activeZoneId == null || zoneId == null || zoneId === activeZoneId ? 1 : INACTIVE_OPACITY;
}
