import { useMemo } from 'react';
import type { Bubble } from '../../../types';
import { createAxis, type Mode } from '../utils/axis';

interface Options {
  xMode: Mode;
  yMode: Mode;
  step: number;
  width: number;
  height: number;
}

export function useChartAxes(
  data: readonly Bubble[],
  { xMode, yMode, step, width, height }: Options,
) {
  // Занятость интервалов определяют только координаты пузырьков; зоны не должны менять шкалы.
  const xAxis = useMemo(
    () =>
      createAxis(
        data.map((bubble) => bubble.x),
        width,
        step,
        xMode,
      ),
    [data, width, step, xMode],
  );
  const yAxis = useMemo(
    () =>
      createAxis(
        data.map((bubble) => bubble.y),
        height,
        step,
        yMode,
      ),
    [data, height, step, yMode],
  );
  return { xAxis, yAxis };
}
