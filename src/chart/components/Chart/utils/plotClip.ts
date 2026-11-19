import type { ChartLayout } from '../constants/chart';

interface ClipContext {
  beginPath(): void;
  roundRect(x: number, y: number, width: number, height: number, radius: number): void;
  closePath(): void;
}

/** Скругляем область данных, не обрезая подписи и названия осей снаружи. */
export function createPlotClip(layout: ChartLayout) {
  return (context: ClipContext) => {
    const { left, top, plotWidth, plotHeight } = layout;
    context.beginPath();
    context.roundRect(left, top, plotWidth, plotHeight, Math.min(8, plotWidth / 2, plotHeight / 2));
    context.closePath();
  };
}
