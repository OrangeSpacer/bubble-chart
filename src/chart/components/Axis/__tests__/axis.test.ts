import { describe, expect, it } from 'vitest';
import { createAxis } from '../utils/axis';

describe('createAxis', () => {
  it('скрывает конечное деление после последнего интервала с плюсом, сохраняя геометрию', () => {
    const axis = createAxis([8, 12, 16, 21, 25, 45], 400, 10, 'grouped');
    expect(axis.ticks.filter((tick) => !tick.hidden).map((tick) => tick.label)).toEqual([
      '0',
      '10',
      '20',
      '40+',
    ]);
    expect(axis.ticks.at(-1)).toMatchObject({ value: 50, hidden: true, pixel: 400 });
    expect(axis.max).toBe(50);
    expect(axis.position(40)).toBe(300);
    expect(axis.position(45)).toBe(350);
    expect(axis.position(50)).toBe(400);
  });

  it('сохраняет последнее деление в Linear и Grouped без завершающего разрыва', () => {
    for (const mode of ['linear', 'grouped'] as const) {
      const axis = createAxis([8, 18, 28, 38, 45], 400, 10, mode);
      expect(axis.ticks.at(-1)?.hidden).not.toBe(true);
      expect(axis.ticks.at(-1)?.label).toBe('50');
    }
    const exact = createAxis([8, 40], 100, 10, 'grouped');
    expect(exact.ticks.at(-1)).toMatchObject({ label: '40+', pixel: 100 });
    expect(exact.ticks.at(-1)?.hidden).not.toBe(true);
  });
  it('places linear ticks and interpolates coordinates', () => {
    const axis = createAxis([8, 45], 100, 10, 'linear');
    expect(axis.ticks.map((tick) => tick.value)).toEqual([0, 10, 20, 30, 40, 50]);
    expect(axis.position(25)).toBe(50);
    expect(axis.min).toBe(0);
    expect(axis.max).toBe(50);
  });

  it('compresses empty buckets and places values to the right of the range start', () => {
    const axis = createAxis([8, 45], 100, 10, 'grouped');
    expect(axis.ticks.map((tick) => tick.label)).toEqual(['0', '40+', '50']);
    expect(axis.ticks[1].breakBefore).toBe(true);
    expect(axis.position(45)).toBeCloseTo(75);
  });

  it.each([
    [10, ['0', '10', '20', '40+', '50']],
    [5, ['0', '5+', '10', '15', '20', '25', '45+']],
  ] as const)('skips empty tick starts in the current demo X data at step %s', (step, labels) => {
    const axis = createAxis([8, 12, 16, 12, 10, 21, 25, 45], 500, step, 'grouped');
    expect(axis.ticks.map((tick) => tick.label)).toEqual(labels);
    const gap = axis.ticks.findIndex((tick) => tick.label === (step === 10 ? '40+' : '45+'));
    expect(axis.ticks[gap].pixel - axis.ticks[gap - 1].pixel).toBeCloseTo(
      500 / (labels.length - 1),
    );
    expect(axis.position(45)).toBeGreaterThan(axis.position(25));
    if (step === 10) expect(axis.position(45)).toBeLessThan(axis.position(50));
    else expect(axis.position(45)).toBe(500);
  });

  it('keeps adjacent occupied starts and marks multiple gaps, including an exact maximum', () => {
    const axis = createAxis([1, 11, 41, 70], 100, 10, 'grouped');
    expect(axis.ticks.map((tick) => tick.label)).toEqual(['0', '10', '40+', '70+']);
    expect(axis.ticks.map((tick) => tick.value)).toEqual([0, 10, 40, 70]);
    expect(axis.position(70)).toBe(100);
  });

  it('restores a tick when a previously empty interval becomes occupied', () => {
    const axis = createAxis([8, 12, 16, 21, 25, 35, 45], 100, 10, 'grouped');
    expect(axis.ticks.map((tick) => tick.label)).toEqual(['0', '10', '20', '30', '40', '50']);
  });

  it('handles wide sparse grouped ranges without enumerating empty intervals', () => {
    const axis = createAxis([8, 1_000_000_005], 100, 10, 'grouped');
    expect(axis.ticks.map((tick) => tick.label)).toEqual(['0', '1000000000+', '1000000010']);
    expect(axis.position(1_000_000_005)).toBeCloseTo(75);
  });

  it.each(['linear', 'grouped'] as const)(
    'handles empty, invalid, negative and boundary values in %s mode',
    (mode) => {
      const empty = createAxis([NaN, Infinity], 100, 5, mode);
      expect(empty.ticks.map((tick) => tick.value)).toEqual([0, 5]);
      const axis = createAxis([-12, 0, 20], 100, 5, mode);
      expect(axis.min).toBe(-15);
      expect(axis.max).toBe(20);
      expect(axis.position(-15)).toBe(0);
      expect(axis.position(20)).toBe(100);
      const positions = [-15, -12, 0, 5, 20].map(axis.position);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(axis.ticks.every((tick) => Number.isFinite(tick.pixel))).toBe(true);
    },
  );

  it('keeps exact bucket boundaries unique', () => {
    const axis = createAxis([0, 10, 20], 100, 10, 'grouped');
    expect(axis.ticks.map((tick) => tick.value)).toEqual([0, 10, 20]);
  });

  it.each([0, -5, NaN, Infinity])('rejects an invalid step %s instead of hanging', (step) => {
    expect(() => createAxis([10], 100, step, 'linear')).toThrow(RangeError);
  });

  it.each([-1, NaN, Infinity])('rejects invalid length %s', (length) => {
    expect(() => createAxis([10], length, 5, 'grouped')).toThrow(RangeError);
  });
});
