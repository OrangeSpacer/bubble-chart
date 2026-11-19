import { useMemo } from 'react';
import { CHART, type ChartLayout } from '../constants/chart';
import type { BubbleChartProps, ChartZone } from '../../../types/chart';
import { useChartAxes } from '../../Axis/hooks/useChartAxes';
import { useBubbles } from '../../Bubble/hooks/useBubbles';
import { useChartZones } from '../../Zone/hooks/useChartZones';
import { createProjection } from '../utils/geometry';
import { getZoneFocusOpacity } from '../utils/zoneFocus';
import { useMedians } from '../../Median/hooks/useMedians';
import { resolveAxisSettings } from '../../Axis/utils/resolveAxisSettings';

const EMPTY_ZONES: readonly ChartZone[] = [];

/** Связывает хуки осей, пузырьков и зон, не завися от состояния и панелей демо. */
export function useBubbleChart(props: BubbleChartProps, layout: ChartLayout = CHART) {
  const {
    data,
    selectedId,
    labels = true,
    zones = EMPTY_ZONES,
    activeZoneId = null,
    medianSettings,
  } = props;
  const axes = resolveAxisSettings(props.axisSettings);
  const { xAxis, yAxis } = useChartAxes(data, {
    xMode: axes.x.mode,
    yMode: axes.y.mode,
    xStep: axes.x.step,
    yStep: axes.y.step,
    width: layout.plotWidth,
    height: layout.plotHeight,
    autoAxisGap: axes.autoGap,
  });
  const projection = useMemo(() => createProjection(xAxis, yAxis, layout), [xAxis, yAxis, layout]);
  const { projectedZones, labelObstacles } = useChartZones(zones, projection);
  const { medians, labelObstacles: allLabelObstacles } = useMedians(
    medianSettings,
    projection,
    projectedZones,
    labelObstacles,
  );
  const { bubbles, bubbleLabels } = useBubbles(
    data,
    projection,
    allLabelObstacles,
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
    axes,
    xAxis,
    yAxis,
    medians,
    projectedZones: focusedZones,
    bubbleLabels: focusedLabels,
    bubbles: focusedBubbles,
  };
}
