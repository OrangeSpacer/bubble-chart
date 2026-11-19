import type { Bubble } from '../../../types';

const MIN_RADIUS = 5;
const MAX_RADIUS = 28;

/** Нормализуем радиус по максимальному конечному положительному значению в текущих данных. */
export function createBubbleRadiusScale(data: readonly Pick<Bubble, 'size'>[]) {
  const maxSize = data.reduce(
    (max, bubble) => (Number.isFinite(bubble.size) && bubble.size > max ? bubble.size : max),
    0,
  );

  return (size: number): number => {
    if (maxSize === 0 || !Number.isFinite(size) || size <= 0) return MIN_RADIUS;
    const ratio = Math.min(size / maxSize, 1);
    return MIN_RADIUS + Math.sqrt(ratio) * (MAX_RADIUS - MIN_RADIUS);
  };
}
