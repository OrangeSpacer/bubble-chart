import { describe, expect, it } from 'vitest';
import { getMedianGeometry } from '../utils/medianGeometry';
import { createAxis } from '../../Axis/utils/axis';
import { addBubbleGap } from '../../Axis/utils/bubbleGap';
import { createProjection } from '../../Chart/utils/geometry';
import { createChartLayout } from '../../Chart/utils/layout';
import { projectZones } from '../../Zone/utils/projectZones';
import type { ChartZone } from '../../../types/chart';

function rectangles(cutX = 20, cutY = 40): ChartZone[] {
  return [
    { id: 1, x1: 0, x2: cutX, y1: 0, y2: cutY, color: '#fff' },
    { id: 2, x1: cutX, x2: 50, y1: 0, y2: cutY, color: '#fff' },
    { id: 3, x1: 0, x2: cutX, y1: cutY, y2: 80, color: '#fff' },
    { id: 4, x1: cutX, x2: 50, y1: cutY, y2: 80, color: '#fff' },
  ];
}

describe('медианы на границах зон', () => {
  const layout = createChartLayout(760, 470);
  const xAxis = createAxis([8, 45], layout.plotWidth, 10, 'linear');
  const yAxis = createAxis([21, 72], layout.plotHeight, 10, 'linear');
  const projection = createProjection(xAxis, yAxis, layout);
  const zones = projectZones(rectangles(), projection);

  it('привязывает подписи к текущим границам, сохраняя переданные значения', () => {
    const settings = { x: { value: 15, sign: '%' }, y: { value: 35, sign: ' ₽' } };
    const [x, y] = getMedianGeometry(settings, projection, zones);
    expect(x.points).toEqual([
      projection.x(20),
      layout.top,
      projection.x(20),
      layout.top + layout.plotHeight,
    ]);
    expect(y.points).toEqual([
      layout.left,
      projection.y(40),
      layout.left + layout.plotWidth,
      projection.y(40),
    ]);
    expect(x.label?.text).toBe('Медиана 15%');
    expect(y.label?.text).toBe('Медиана 35 ₽');
    const [movedX, movedY] = getMedianGeometry(
      settings,
      projection,
      projectZones(rectangles(25, 50), projection),
    );
    expect(movedX.points[0]).toBe(projection.x(25));
    expect(movedY.points[1]).toBe(projection.y(50));
    expect(movedX.label?.text).toBe(x.label?.text);
  });

  it('без внутренних границ или настроек ничего не рисует', () => {
    expect(getMedianGeometry(undefined, projection, zones)).toEqual([]);
    expect(getMedianGeometry({ x: { value: 15 } }, projection, [])).toEqual([]);
    const full = projectZones(
      [{ id: 'full', x1: 0, x2: 50, y1: 0, y2: 80, color: '#fff' }],
      projection,
    );
    expect(getMedianGeometry({ x: { value: 15 }, y: { value: 40 } }, projection, full)).toEqual([]);
  });

  it('поддерживает null, ноль и значения вне диапазона как текст, пропуская NaN', () => {
    const result = getMedianGeometry({ x: { value: 0 }, y: null }, projection, zones);
    expect(result).toHaveLength(1);
    expect(result[0].label?.text).toBe('Медиана 0');
    expect(getMedianGeometry({ x: { value: 1000 } }, projection, zones)[0].points[0]).toBe(
      projection.x(20),
    );
    expect(
      getMedianGeometry({ x: { value: NaN }, y: { value: Infinity } }, projection, zones),
    ).toEqual([]);
  });

  it('выбирает ближайшую из нескольких внутренних границ', () => {
    const many = projectZones(
      [...rectangles(10, 40), { id: 5, x1: 30, x2: 50, y1: 0, y2: 80, color: '#fff' }],
      projection,
    );
    expect(getMedianGeometry({ x: { value: 28 } }, projection, many)[0].points[0]).toBe(
      projection.x(30),
    );
  });

  it.each(['linear', 'grouped'] as const)(
    'совпадает с границей зон в %s при gap и изменении размера',
    (mode) => {
      const resized = createChartLayout(1200, 700);
      const x = addBubbleGap(
        createAxis([-20, 45], resized.plotWidth, 10, mode),
        resized.plotWidth,
        [{ value: -20, radius: 28 }],
      );
      const y = createAxis([-40, 80], resized.plotHeight, 10, mode);
      const projected = createProjection(x, y, resized);
      const projectedZones = projectZones(
        [{ id: 'a', x1: -20, x2: -5, y1: -40, y2: 80, color: '#fff' }],
        projected,
      );
      const [median] = getMedianGeometry({ x: { value: -10 } }, projected, projectedZones);
      expect(median.points[0]).toBe(projected.x(-5));
      expect(median.label?.text).toBe('Медиана -10');
    },
  );

  it('учитывает области заголовков зон', () => {
    const obstacle = { x: layout.left, y: layout.top, width: layout.plotWidth, height: 48 };
    const [median] = getMedianGeometry({ x: { value: 15 } }, projection, zones, [obstacle]);
    expect(median.label!.y).toBeGreaterThanOrEqual(layout.top + 48);
  });
});
