import { describe, expect, it } from 'vitest';
import { createAxis } from '../utils/axis';
import { addBubbleGap } from '../utils/bubbleGap';

describe('динамический отступ для пузырьков', () => {
  it.each(['linear', 'grouped'] as const)(
    'сохраняет пузырьки и обводку внутри %s шкалы',
    (mode) => {
      const original = createAxis([-10, -9, 10], 400, 5, mode);
      const bubbles = [
        { value: -10, radius: 28 },
        { value: -9, radius: 12 },
        { value: 10, radius: 28 },
      ];
      const padded = addBubbleGap(original, 400, bubbles);
      for (const bubble of bubbles) {
        expect(padded.position(bubble.value) - bubble.radius).toBeGreaterThanOrEqual(9.99);
        expect(padded.position(bubble.value) + bubble.radius).toBeLessThanOrEqual(390.01);
      }
      expect(padded.ticks.map((tick) => [tick.value, tick.label, tick.hidden])).toEqual(
        original.ticks.map((tick) => [tick.value, tick.label, tick.hidden]),
      );
      expect(padded.min).toBe(original.min);
      expect(padded.max).toBe(original.max);
      expect(original.position(-10)).toBe(0);
      expect(padded.position(-10)).toBeCloseTo(38);
      expect(padded.position(10)).toBeCloseTo(362);
    },
  );

  it('не добавляет отступ, если пузырьки уже помещаются', () => {
    const original = createAxis([50], 400, 10, 'linear');
    expect(addBubbleGap(original, 400, [{ value: 25, radius: 28 }])).toBe(original);
    expect(addBubbleGap(original, 400, [])).toBe(original);
  });

  it('проверяет крупный пузырёк рядом с краем, а не только крайнюю точку', () => {
    const original = createAxis([100], 400, 10, 'linear');
    const bubbles = [
      { value: 0, radius: 5 },
      { value: 1, radius: 28 },
      { value: 100, radius: 5 },
    ];
    const padded = addBubbleGap(original, 400, bubbles);
    expect(padded.position(1) - 28).toBeGreaterThanOrEqual(9.99);
    expect(padded.position(0)).toBeGreaterThan(15);
  });

  it('пересчитывает отступы при изменении ширины и не вырождает слишком узкую шкалу', () => {
    for (const length of [400, 160, 20]) {
      const axis = addBubbleGap(createAxis([0, 10], length, 5, 'grouped'), length, [
        { value: 0, radius: 28 },
        { value: 10, radius: 28 },
      ]);
      expect(axis.position(0)).toBeGreaterThan(0);
      expect(axis.position(10)).toBeLessThan(length);
      expect(axis.position(10)).toBeGreaterThan(axis.position(0));
      expect(axis.ticks.every((tick) => Number.isFinite(tick.pixel))).toBe(true);
    }
  });
});
