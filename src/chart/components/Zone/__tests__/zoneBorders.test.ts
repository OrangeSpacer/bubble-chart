import { describe, expect, it } from 'vitest';
import { getZoneBorderSegments } from '../utils/zoneBorders';
import { createChartLayout } from '../../Chart/utils/layout';

describe('внутренние границы зон', () => {
  it.each([
    [760, 470],
    [1400, 800],
    [320, 300],
  ])('не рисует пунктир по краям графика %s x %s', (width, height) => {
    const layout = createChartLayout(width, height);
    expect(
      getZoneBorderSegments(
        { x: layout.left, y: layout.top, width: layout.plotWidth, height: layout.plotHeight },
        layout,
      ),
    ).toEqual([]);
    const rectangle = {
      x: layout.left,
      y: layout.top,
      width: layout.plotWidth / 2,
      height: layout.plotHeight / 2,
    };
    expect(getZoneBorderSegments(rectangle, layout)).toEqual([
      [rectangle.width, 0, rectangle.width, rectangle.height],
      [0, rectangle.height, rectangle.width, rectangle.height],
    ]);
    expect(
      getZoneBorderSegments(
        { x: layout.left + 10, y: layout.top + 10, width: 20, height: 20 },
        layout,
      ),
    ).toHaveLength(4);
  });
});
