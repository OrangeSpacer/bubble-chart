import { useMemo } from 'react';
import type { MedianSettings } from '../../../types/chart';
import type { ProjectedZone } from '../../Zone/utils/projectZones';
import type { Projection, ZoneRectangle } from '../../Chart/utils/geometry';
import { getMedianGeometry } from '../utils/medianGeometry';

export function useMedians(
  settings: MedianSettings | undefined,
  projection: Projection,
  zones: readonly ProjectedZone[],
  obstacles: readonly ZoneRectangle[],
) {
  const medians = useMemo(
    () => getMedianGeometry(settings, projection, zones, obstacles),
    [settings, projection, zones, obstacles],
  );
  const labelObstacles = useMemo(
    () => [...obstacles, ...medians.flatMap((median) => (median.label ? [median.label] : []))],
    [obstacles, medians],
  );
  return { medians, labelObstacles };
}
