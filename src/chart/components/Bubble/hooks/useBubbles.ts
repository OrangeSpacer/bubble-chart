import { useMemo } from 'react';
import type { Bubble } from '../../../types/chart';
import type { Projection, ZoneRectangle } from '../../Chart/utils/geometry';
import { createBubbleRadiusScale } from '../utils/bubbleSize';
import { layoutBubbleLabels } from '../utils/labelLayout';
import { LABEL_HEIGHT, measureLabelWidth } from '../utils/labelText';

export function useBubbles(
  data: readonly Bubble[],
  projection: Projection,
  obstacles: readonly ZoneRectangle[],
  labels: boolean,
  selectedId?: number,
) {
  const radiusForSize = useMemo(() => createBubbleRadiusScale(data), [data]);
  const positionedBubbles = useMemo(
    () =>
      data.map((bubble) => ({
        bubble,
        x: projection.x(bubble.x),
        y: projection.y(bubble.y),
        radius: radiusForSize(bubble.size),
      })),
    [data, projection, radiusForSize],
  );

  const bubbleLabels = useMemo(() => {
    if (!labels) return [];
    const { left, top, plotWidth, plotHeight } = projection.layout;
    const anchors = positionedBubbles.map(({ bubble, x, y, radius }) => ({
      id: bubble.id,
      text: bubble.name,
      x,
      y,
      radius,
      width: measureLabelWidth(bubble.name),
      height: LABEL_HEIGHT,
    }));
    return layoutBubbleLabels(
      anchors,
      {
        x: left + 4,
        y: top + 4,
        width: Math.max(0, plotWidth - 8),
        height: Math.max(0, plotHeight - 8),
      },
      obstacles,
    );
  }, [positionedBubbles, projection, obstacles, labels]);

  const bubbles = useMemo(
    () =>
      [...positionedBubbles].sort(
        (a, b) => Number(a.bubble.id === selectedId) - Number(b.bubble.id === selectedId),
      ),
    [positionedBubbles, selectedId],
  );
  return { bubbles, bubbleLabels };
}
