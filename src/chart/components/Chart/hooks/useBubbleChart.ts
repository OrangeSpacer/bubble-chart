import { useMemo } from 'react';
import { CHART } from '../constants/chart';
import type { BubbleChartProps, ChartZone } from '../../../types';
import { useChartAxes } from '../../Axis/hooks/useChartAxes';
import { useBubbles } from '../../Bubble/hooks/useBubbles';
import { useChartZones } from '../../Zone/hooks/useChartZones';
import { createProjection } from '../utils/geometry';
import { getZoneFocusOpacity } from '../utils/zoneFocus';

const EMPTY_ZONES: readonly ChartZone[] = [];

/** Связывает хуки осей, пузырьков и зон, не завися от состояния и панелей демо. */
export function useBubbleChart({
  data,
  selectedId,
  mode = 'grouped',
  xMode = mode,
  yMode = mode,
  step = 5,
  labels = true,
  zones = EMPTY_ZONES,
  activeZoneId = null,
}: BubbleChartProps) {
  const { xAxis, yAxis } = useChartAxes(data, {
    xMode,
    yMode,
    step,
    width: CHART.plotWidth,
    height: CHART.plotHeight,
  });
  const projection = useMemo(() => createProjection(xAxis, yAxis), [xAxis, yAxis]);
  const { projectedZones, labelObstacles } = useChartZones(zones, projection);
  const { bubbles, bubbleLabels } = useBubbles(
    data,
    projection,
    labelObstacles,
    labels,
    selectedId,
  );
  const focusedZones = useMemo(
    () =>
      projectedZones.map((item) => ({
        ...item,
        opacity: getZoneFocusOpacity(item.zone.id, activeZoneId),
      })),
    [projectedZones, activeZoneId],
  );
  const focusedBubbles = useMemo(
    () =>
      bubbles.map((item) => ({
        ...item,
        opacity: getZoneFocusOpacity(item.bubble.zoneId, activeZoneId),
      })),
    [bubbles, activeZoneId],
  );
  const focusedLabels = useMemo(() => {
    const opacities = new Map(
      data.map((bubble) => [bubble.id, getZoneFocusOpacity(bubble.zoneId, activeZoneId)]),
    );
    return bubbleLabels.map((label) => ({ ...label, opacity: opacities.get(label.id) ?? 1 }));
  }, [data, bubbleLabels, activeZoneId]);
  return {
    xAxis,
    yAxis,
    projectedZones: focusedZones,
    bubbleLabels: focusedLabels,
    bubbles: focusedBubbles,
  };
}
