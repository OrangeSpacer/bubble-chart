import { getZoneGeometry, type Projection, type ZoneRectangle } from '../../Chart/utils/geometry';
import type { ChartZone } from '../../../types/chart';

export interface ProjectedZone {
  zone: ChartZone;
  rectangle: ZoneRectangle;
}

export function projectZones(zones: readonly ChartZone[], projection: Projection): ProjectedZone[] {
  return zones.flatMap((zone) => {
    const rectangle = getZoneGeometry(projection, zone);
    return rectangle ? [{ zone, rectangle }] : [];
  });
}
