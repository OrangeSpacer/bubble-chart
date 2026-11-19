import { describe, expect, it } from 'vitest';
import { formatTickLabel } from '../utils/formatTickLabel';

describe('знак значения деления', () => {
  it.each([
    ['10', '%', '10%'],
    ['-10', '%', '-10%'],
    ['0', ' ₽', '0 ₽'],
    ['40+', ' шт.', '40+ шт.'],
    ['-40+', '%', '-40+%'],
    ['10', '', '10'],
  ])('форматирует %s со знаком %s', (label, suffix, expected) => {
    expect(formatTickLabel(label, suffix)).toBe(expected);
  });
});
