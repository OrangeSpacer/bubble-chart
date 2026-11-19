import { describe, expect, it } from 'vitest';
import { CHART } from '../constants/chart';
import { createChartLayout } from '../utils/layout';
import { createProjection, getZoneGeometry } from '../utils/geometry';
import { createAxis } from '../../Axis/utils/axis';

describe('адаптивная геометрия', () => {
  it('сохраняет исходную геометрию для исходного размера', () => {
    expect(createChartLayout(760, 470)).toEqual(CHART);
  });

  it.each([
    [1400, 800],
    [320, 300],
    [120, 100],
    [1, 1],
  ])('заполняет контейнер %s x %s с корректными отступами', (width, height) => {
    const layout = createChartLayout(width, height);
    expect(layout.width).toBe(width);
    expect(layout.height).toBe(height);
    expect(layout.plotWidth).toBeGreaterThan(0);
    expect(layout.plotHeight).toBeGreaterThan(0);
    expect(layout.left + layout.plotWidth).toBeLessThan(width);
    expect(layout.top + layout.plotHeight).toBeLessThan(height);
    const projection = createProjection(
      createAxis([50], layout.plotWidth, 5, 'linear'),
      createAxis([80], layout.plotHeight, 5, 'linear'),
      layout,
    );
    expect(projection.x(50)).toBe(layout.left + layout.plotWidth);
    expect(projection.y(80)).toBeCloseTo(layout.top);
    const rectangle = getZoneGeometry(projection, {
      id: 'all',
      x1: -100,
      x2: 1000,
      y1: -100,
      y2: 1000,
      color: '#fff',
    });
    expect(rectangle?.x).toBeCloseTo(layout.left);
    expect(rectangle?.y).toBeCloseTo(layout.top);
    expect(rectangle?.width).toBeCloseTo(layout.plotWidth);
    expect(rectangle?.height).toBeCloseTo(layout.plotHeight);
  });

  it('нормализует некорректные и дробные размеры', () => {
    expect(createChartLayout(NaN, 0)).toEqual(CHART);
    expect(createChartLayout(800.9, 600.5)).toMatchObject({ width: 800, height: 600 });
  });
});
