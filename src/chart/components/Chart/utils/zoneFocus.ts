import type { ChartZone } from '../../../types/chart';

const INACTIVE_OPACITY = 0.25;

/** При активной зоне обычную прозрачность сохраняют только объекты с совпадающим id. */
export function getZoneFocusOpacity(
  zoneId: ChartZone['id'] | null | undefined,
  activeZoneId: ChartZone['id'] | null | undefined,
): number {
  return activeZoneId == null || zoneId === activeZoneId ? 1 : INACTIVE_OPACITY;
}
