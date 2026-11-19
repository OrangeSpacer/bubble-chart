import { useMemo } from 'react';
import type { ChartZone } from '../../../types/chart';
import type { Projection } from '../../Chart/utils/geometry';
import { projectZones } from '../utils/projectZones';
import { getZoneLabels } from '../utils/zoneLabels';

export function useChartZones(zones: readonly ChartZone[], projection: Projection) {
  const projectedZones = useMemo(() => projectZones(zones, projection), [zones, projection]);
  const labelObstacles = useMemo(
    () =>
      projectedZones.flatMap(({ zone, rectangle }) =>
        getZoneLabels(rectangle, zone).map((label) => ({
          x: rectangle.x + label.x,
          y: rectangle.y + label.y,
          width: label.width,
          height: label.height,
        })),
      ),
    [projectedZones],
  );
  return { projectedZones, labelObstacles };
}
