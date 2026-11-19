import type { Axis } from './axis';

interface AxisBubble {
  value: number;
  radius: number;
}

/** Добавляет только необходимые пиксельные отступы, не меняя значения и интервалы шкалы. */
export function addBubbleGap(axis: Axis, length: number, bubbles: readonly AxisBubble[]): Axis {
  if (length <= 0 || bubbles.length === 0) return axis;
  const points = bubbles
    .filter((bubble) => Number.isFinite(bubble.value) && Number.isFinite(bubble.radius))
    .map((bubble) => ({
      t: Math.max(0, Math.min(1, axis.position(bubble.value) / length)),
      clearance: Math.max(0, bubble.radius) + 10,
    }));
  let start = 0;
  let end = 0;
  const limit = length * 0.45;
  // Отступы взаимозависимы: проверяем все пузырьки, а не только минимальное и максимальное значения.
  for (let iteration = 0; iteration < 32; iteration++) {
    const previous = start + end;
    for (const { t, clearance } of points) {
      if (t < 1)
        start = Math.max(start, Math.min(limit, (clearance - length * t + t * end) / (1 - t)));
      if (t > 0)
        end = Math.max(end, Math.min(limit, (clearance - length * (1 - t) + (1 - t) * start) / t));
    }
    if (start + end - previous < 0.000001) break;
  }
  if (start === 0 && end === 0) return axis;
  const pixel = (position: number) => start + (position / length) * (length - start - end);
  return {
    ...axis,
    ticks: axis.ticks.map((tick) => ({ ...tick, pixel: pixel(tick.pixel) })),
    position: (value) => pixel(axis.position(value)),
  };
}
