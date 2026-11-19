import { describe, expect, it } from 'vitest';
import { createBubbleRadiusScale } from '../utils/bubbleSize';

describe('bubble radius scale', () => {
  it('uses the dataset maximum instead of a fixed 100', () => {
    const radius = createBubbleRadiusScale([{ size: 1000 }, { size: 250 }]);
    expect(radius(1000)).toBe(28);
    expect(radius(250)).toBe(16.5);
    expect(radius(0)).toBe(5);
  });

  it('preserves sizes when all values are multiplied by the same factor', () => {
    const small = createBubbleRadiusScale([{ size: 0.004 }, { size: 0.001 }]);
    const large = createBubbleRadiusScale([{ size: 40000 }, { size: 10000 }]);
    expect(small(0.004)).toBe(large(40000));
    expect(small(0.001)).toBe(large(10000));
  });

  it('assigns the maximum radius to a single positive value or equal positive values', () => {
    expect(createBubbleRadiusScale([{ size: 7 }])(7)).toBe(28);
    expect(createBubbleRadiusScale([{ size: 7 }, { size: 7 }])(7)).toBe(28);
  });

  it('recalculates relative radii when the dataset maximum changes', () => {
    const before = createBubbleRadiusScale([{ size: 100 }, { size: 25 }]);
    const after = createBubbleRadiusScale([{ size: 25 }]);
    expect(before(25)).toBe(16.5);
    expect(after(25)).toBe(28);
  });

  it('ignores invalid sizes when determining the maximum', () => {
    const radius = createBubbleRadiusScale([
      { size: Infinity },
      { size: NaN },
      { size: -100 },
      { size: 0 },
      { size: 40 },
    ]);
    expect(radius(40)).toBe(28);
    for (const size of [Infinity, -Infinity, NaN, -100, 0]) expect(radius(size)).toBe(5);
  });

  it('handles empty or entirely nonpositive datasets without division by zero', () => {
    expect(createBubbleRadiusScale([])(0)).toBe(5);
    expect(createBubbleRadiusScale([{ size: 0 }, { size: -1 }, { size: NaN }])(0)).toBe(5);
  });

  it('keeps finite radii for very large values', () => {
    const radius = createBubbleRadiusScale([
      { size: Number.MAX_VALUE },
      { size: Number.MAX_VALUE / 4 },
    ]);
    expect(radius(Number.MAX_VALUE)).toBe(28);
    expect(radius(Number.MAX_VALUE / 4)).toBe(16.5);
  });
});
