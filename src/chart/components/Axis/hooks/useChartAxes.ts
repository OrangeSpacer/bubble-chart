import { useMemo } from 'react';
import type { Bubble } from '../../../types/chart';
import { createAxis, type Mode } from '../utils/axis';
import { addBubbleGap } from '../utils/bubbleGap';
import { createBubbleRadiusScale } from '../../Bubble/utils/bubbleSize';

interface Options {
  xMode: Mode;
  yMode: Mode;
  xStep: number;
  yStep: number;
  width: number;
  height: number;
  autoAxisGap?: boolean;
}

export function useChartAxes(
  data: readonly Bubble[],
  { xMode, yMode, xStep, yStep, width, height, autoAxisGap = true }: Options,
) {
  const radiusForSize = useMemo(() => createBubbleRadiusScale(data), [data]);
  // Занятость интервалов определяют только координаты пузырьков; зоны не должны менять шкалы.
  const xAxis = useMemo(() => {
    const axis = createAxis(
      data.map((bubble) => bubble.x),
      width,
      xStep,
      xMode,
    );
    return autoAxisGap
      ? addBubbleGap(
          axis,
          width,
          data.map((bubble) => ({ value: bubble.x, radius: radiusForSize(bubble.size) })),
        )
      : axis;
  }, [data, width, xStep, xMode, autoAxisGap, radiusForSize]);
  const yAxis = useMemo(() => {
    const axis = createAxis(
      data.map((bubble) => bubble.y),
      height,
      yStep,
      yMode,
    );
    return autoAxisGap
      ? addBubbleGap(
          axis,
          height,
          data.map((bubble) => ({ value: bubble.y, radius: radiusForSize(bubble.size) })),
        )
      : axis;
  }, [data, height, yStep, yMode, autoAxisGap, radiusForSize]);
  return { xAxis, yAxis };
}
