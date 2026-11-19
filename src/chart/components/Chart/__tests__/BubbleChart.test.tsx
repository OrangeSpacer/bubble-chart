import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BubbleChart } from '../BubbleChart';
import { createAxis } from '../../Axis/utils/axis';
import { CHART } from '../constants/chart';
import { createChartLayout } from '../utils/layout';
import * as sizeHooks from '../hooks/useChartSize';
import type { Bubble, BubbleChartProps, ChartZone } from '../../../types/chart';
// Проверяем координаты, переданные в Konva, без браузера и Canvas.
vi.mock('react-konva', () => {
  const Container = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    Stage: ({
      children,
      width,
      height,
    }: {
      children?: ReactNode;
      width: number;
      height: number;
    }) => (
      <div data-stage-width={width} data-stage-height={height}>
        {children}
      </div>
    ),
    Layer: Container,
    Group: ({ children, opacity = 1 }: { children?: ReactNode; opacity?: number }) => (
      <section data-opacity={opacity}>{children}</section>
    ),
    Rect: ({ fill, opacity = 1 }: { fill?: string; opacity?: number }) => (
      <i data-fill={fill} data-opacity={opacity} />
    ),
    Line: ({
      stroke,
      opacity,
      name,
      points,
    }: {
      stroke: string;
      opacity?: number;
      name?: string;
      points?: number[];
    }) =>
      stroke === '#667387' ? (
        <i data-connector="true" data-opacity={opacity} />
      ) : name ? (
        <i data-line-name={name} />
      ) : stroke === '#d5dbe2' ? (
        <i data-grid-points={points?.join(',')} />
      ) : null,
    Text: ({ text, x, y, width }: { text: string; x?: number; y?: number; width?: number }) => (
      <span data-text={text} data-label-x={x} data-label-y={y} data-label-width={width} />
    ),
    Circle: ({ x, y, fill }: { x: number; y: number; fill?: string }) => (
      <span data-x={x} data-y={y} data-fill={fill} />
    ),
  };
});
const data: Bubble[] = [
  { id: 1, name: 'A', x: 8, y: 8, size: 10, color: '#000' },
  { id: 2, name: 'B', x: 45, y: 45, size: 20, color: '#000' },
];
function firstPosition(props: Omit<BubbleChartProps, 'data'>) {
  const html = renderToStaticMarkup(
    <BubbleChart
      data={data}
      {...props}
      axisSettings={{ step: 10, autoGap: false, ...props.axisSettings }}
    />,
  );
  const match = html.match(/data-x="([^"]+)" data-y="([^"]+)"/);
  if (!match) throw new Error('No bubble rendered');
  return { x: Number(match[1]), y: Number(match[2]) };
}
describe('активная зона', () => {
  const zones: ChartZone[] = [
    { id: 'a', x1: 0, x2: 20, y1: 0, y2: 50, color: '#aaa', title: 'Zone A' },
    { id: 'b', x1: 20, x2: 50, y1: 0, y2: 50, color: '#bbb', title: 'Zone B' },
  ];
  const linked: Bubble[] = [
    { ...data[0], name: 'Active', color: '#111', zoneId: 'a' },
    { ...data[1], name: 'Inactive', color: '#222', zoneId: 'b' },
    { ...data[0], id: 3, name: 'Unlinked', color: '#333' },
    { ...data[1], id: 4, name: 'Null link', color: '#444', zoneId: null },
  ];
  function bubbleOpacities(html: string) {
    return Object.fromEntries(
      [
        ...html.matchAll(
          /<section data-opacity="([^"]+)"><span data-x="[^"]+" data-y="[^"]+" data-fill="([^"]+)"/g,
        ),
      ].map((match) => [match[2], Number(match[1])]),
    );
  }
  it('приглушает фон и заголовок неактивной зоны, связанные пузырьки и их подписи', () => {
    const html = renderToStaticMarkup(
      <BubbleChart data={linked} zones={zones} activeZoneId="a" selectedId={2} />,
    );
    expect(html).toContain('data-fill="#aaa" data-opacity="1"');
    expect(html).toContain('data-fill="#bbb" data-opacity="0.25"');
    expect(html).toContain('<section data-opacity="0.25"><span data-text="Zone B"');
    expect(html).toContain(
      '<section data-opacity="0.25"><i data-fill="white" data-opacity="0.88"></i><span data-text="Inactive"',
    );
    expect(bubbleOpacities(html)).toEqual({ '#111': 1, '#222': 0.25, '#333': 0.25, '#444': 0.25 });
    expect(html).toContain(
      '<section data-opacity="0.25"><i data-fill="white" data-opacity="0.88"></i><span data-text="Unlinked"',
    );
  });
  it('смена активной зоны и null обновляют приглушение без изменения геометрии', () => {
    const first = renderToStaticMarkup(
      <BubbleChart data={linked} zones={zones} activeZoneId="a" />,
    );
    const second = renderToStaticMarkup(
      <BubbleChart data={linked} zones={zones} activeZoneId="b" />,
    );
    const cleared = renderToStaticMarkup(
      <BubbleChart data={linked} zones={zones} activeZoneId={null} />,
    );
    expect(bubbleOpacities(second)).toEqual({
      '#111': 0.25,
      '#222': 1,
      '#333': 0.25,
      '#444': 0.25,
    });
    expect(bubbleOpacities(cleared)).toEqual({ '#111': 1, '#222': 1, '#333': 1, '#444': 1 });
    expect(cleared).toBe(renderToStaticMarkup(<BubbleChart data={linked} zones={zones} />));
    const positions = (html: string) =>
      [...html.matchAll(/data-x="([^"]+)" data-y="([^"]+)"/g)].map((match) => match.slice(1));
    expect(positions(first)).toEqual(positions(second));
    expect(positions(first)).toEqual(positions(cleared));
  });
  it('приглушает соединительные линии пузырьков других зон', () => {
    const cluster = Array.from({ length: 8 }, (_, id) => ({
      ...linked[1],
      id,
      name: `Linked ${id}`,
      x: 5,
      y: 5,
    }));
    const html = renderToStaticMarkup(<BubbleChart data={cluster} activeZoneId="a" />);
    expect(html).toContain('data-connector="true" data-opacity="0.2"');
  });
});
describe('independent axis modes', () => {
  it('принимает названия, знаки, режимы и разные шаги внутри axisSettings', () => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          x: { title: 'Стоимость', tickSuffix: ' ₽', mode: 'linear', step: 10 },
          y: { title: 'Эффект', tickSuffix: '%', mode: 'linear', step: 20 },
          showLines: false,
          autoGap: false,
        }}
      />,
    );
    expect(html).toContain('data-text="Стоимость"');
    expect(html).toContain('data-text="Эффект"');
    expect(html).toContain('data-text="10 ₽"');
    expect(html).toContain('data-text="20%"');
    expect(html).not.toContain('data-text="10%"');
    expect(html).not.toContain('data-line-name="axis-lines"');
    expect(
      firstPosition({
        axisSettings: { x: { mode: 'linear' }, y: { mode: 'grouped' }, step: 10, autoGap: false },
      }),
    ).toEqual(
      firstPosition({
        axisSettings: {
          step: 10,
          autoGap: false,
          x: { mode: 'linear' },
          y: { mode: 'grouped' },
        },
      }),
    );
  });
  it('рисует подписи медиан на границах зон без отдельных линий и белой подложки', () => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        zones={[{ id: 'a', x1: 0, x2: 20, y1: 0, y2: 30, color: '#abc' }]}
        medianSettings={{ x: { value: 15, sign: '%' }, y: { value: 40, sign: ' ₽' } }}
        axisSettings={{
          showLines: false,
        }}
      />,
    );
    expect(html).not.toContain('data-line-name="median-');
    expect(html).not.toContain('data-opacity="0.92"');
    expect(html).toContain('data-text="Медиана 15%"');
    expect(html).toContain('data-text="Медиана 40 ₽"');
    expect(firstPosition({ medianSettings: { x: { value: 15 }, y: { value: 40 } } })).toEqual(
      firstPosition({}),
    );
    expect(renderToStaticMarkup(<BubbleChart data={data} />)).not.toContain(
      'data-line-name="median-',
    );
    expect(
      renderToStaticMarkup(
        <BubbleChart data={data} medianSettings={{ x: { value: 15 }, y: { value: 40 } }} />,
      ),
    ).not.toContain('Медиана');
  });
  it.each(['linear', 'grouped'] as const)(
    'автоматически отодвигает крайние пузырьки и допускает отключение gap в %s',
    (mode) => {
      const edgeData = [
        { ...data[0], x: -10, y: -10, size: 100 },
        { ...data[1], x: 10, y: 10, size: 100 },
      ];
      const html = renderToStaticMarkup(
        <BubbleChart
          data={edgeData}
          selectedId={1}
          axisSettings={{
            mode: mode,
          }}
        />,
      );
      const points = [...html.matchAll(/data-x="([^"]+)" data-y="([^"]+)"/g)];
      expect(points).toHaveLength(3);
      for (const point of points) {
        const x = Number(point[1]),
          y = Number(point[2]);
        expect(x - 34).toBeGreaterThanOrEqual(CHART.left);
        expect(x + 34).toBeLessThanOrEqual(CHART.left + CHART.plotWidth);
        expect(y - 34).toBeGreaterThanOrEqual(CHART.top);
        expect(y + 34).toBeLessThanOrEqual(CHART.top + CHART.plotHeight);
      }
      const disabled = renderToStaticMarkup(
        <BubbleChart
          data={edgeData}
          axisSettings={{
            mode: mode,
            autoGap: false,
          }}
        />,
      );
      expect(disabled).toContain(`data-x="${CHART.left}" data-y="${CHART.top + CHART.plotHeight}"`);
      const texts = (value: string) =>
        [...value.matchAll(/data-text="([^"]*)"/g)].map((match) => match[1]);
      expect(texts(html)).toEqual(texts(disabled));
    },
  );
  it('скрывает ведущие линии и совпадающие линии сетки, сохраняя подписи и остальную сетку', () => {
    const visible = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          mode: 'linear',
        }}
      />,
    );
    const hidden = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          mode: 'linear',
          showLines: false,
        }}
      />,
    );
    expect(visible).toContain('data-line-name="axis-lines"');
    expect(hidden).not.toContain('data-line-name="axis-lines"');
    expect(hidden).not.toContain('data-line-name="plot-border"');
    expect(visible).not.toContain('data-line-name="plot-border"');
    expect(hidden).toContain('data-grid-points=');
    const bottom = CHART.top + CHART.plotHeight;
    const right = CHART.left + CHART.plotWidth;
    for (const html of [visible, hidden]) {
      expect(html).not.toContain(`data-grid-points="${right},${CHART.top},${right},${bottom}"`);
      expect(html).not.toContain(
        `data-grid-points="${CHART.left},${CHART.top},${right},${CHART.top}"`,
      );
    }
    expect(hidden).not.toContain(
      `data-grid-points="${CHART.left},${CHART.top},${CHART.left},${bottom}"`,
    );
    expect(hidden).not.toContain(
      `data-grid-points="${CHART.left},${bottom},${CHART.left + CHART.plotWidth},${bottom}"`,
    );
    const texts = (html: string) =>
      [...html.matchAll(/data-text="([^"]*)"/g)].map((match) => match[1]);
    expect(texts(hidden)).toEqual(texts(visible));
    expect(
      firstPosition({
        axisSettings: {
          showLines: false,
        },
      }),
    ).toEqual(firstPosition({}));
  });
  it('размещает общий ноль у пересечения осей, слева и ниже угла графика', () => {
    const html = renderToStaticMarkup(<BubbleChart data={data} />);
    const match = html.match(
      /data-text="0" data-label-x="([^"]+)" data-label-y="([^"]+)" data-label-width="([^"]+)"/,
    );
    expect(match).not.toBeNull();
    expect(Number(match![1]) + Number(match![3])).toBe(CHART.left - 8);
    expect(Number(match![2])).toBe(CHART.top + CHART.plotHeight + 4);
    expect(html.match(/data-text="0"/g)).toHaveLength(1);
  });
  it.each([
    ['linear', 'linear'],
    ['linear', 'grouped'],
    ['grouped', 'linear'],
    ['grouped', 'grouped'],
  ] as const)('рисует общий начальный ноль один раз: X=%s Y=%s', (xMode, yMode) => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          x: { mode: xMode },
          y: { mode: yMode },
        }}
      />,
    );
    expect(html.match(/data-text="0"/g)).toHaveLength(1);
  });
  it('объединяет одинаковое отрицательное начало, но не нули в разных точках осей', () => {
    const negative = data.map((bubble) => ({ ...bubble, x: -12, y: -12 }));
    const same = renderToStaticMarkup(
      <BubbleChart
        data={negative}
        axisSettings={{
          mode: 'linear',
          step: 10,
        }}
      />,
    );
    expect(same.match(/data-text="-20"/g)).toHaveLength(1);
    const different = renderToStaticMarkup(
      <BubbleChart
        data={[{ ...data[0], x: -12 }, data[1]]}
        axisSettings={{
          mode: 'linear',
          step: 10,
        }}
      />,
    );
    expect(different.match(/data-text="0"/g)).toHaveLength(2);
  });
  it('сохраняет обе начальные подписи при разных единицах осей', () => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          x: { tickSuffix: '%' },
          y: { tickSuffix: ' \u20BD' },
        }}
      />,
    );
    expect(html.match(/data-text="0%"/g)).toHaveLength(1);
    expect(html.match(/data-text="0 ₽"/g)).toHaveLength(1);
  });
  it.each([
    ['grouped', 'linear'],
    ['linear', 'grouped'],
    ['grouped', 'grouped'],
  ] as const)('скрывает завершающее деление только на Grouped: X=%s Y=%s', (xMode, yMode) => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          step: 10,
          x: { mode: xMode, tickSuffix: 'X' },
          y: { mode: yMode, tickSuffix: 'Y' },
        }}
      />,
    );
    for (const [mode, suffix] of [
      [xMode, 'X'],
      [yMode, 'Y'],
    ]) {
      if (mode === 'grouped') {
        expect(html).toContain(`data-text="40+${suffix}"`);
        expect(html).not.toContain(`data-text="50${suffix}"`);
      } else {
        expect(html).toContain(`data-text="50${suffix}"`);
      }
    }
  });
  it('показывает независимые названия и единицы осей, сохраняя маркер Grouped', () => {
    const html = renderToStaticMarkup(
      <BubbleChart
        data={data}
        axisSettings={{
          step: 10,
          x: {
            mode: 'linear',
            title: '\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C',
            tickSuffix: ' \u20BD',
          },
          y: { mode: 'grouped', title: '\u042D\u0444\u0444\u0435\u043A\u0442', tickSuffix: '%' },
        }}
      />,
    );
    expect(html).toContain('data-text="Стоимость"');
    expect(html).toContain('data-text="Эффект"');
    expect(html).toContain('data-text="10 ₽"');
    expect(html).toContain('data-text="40+%"');
    expect(
      firstPosition({
        axisSettings: {
          x: { tickSuffix: ' ₽', title: 'Стоимость' },
          y: { tickSuffix: '%' },
        },
      }),
    ).toEqual(firstPosition({}));
  });
  it('пересчитывает Canvas и координаты при расширении и сужении контейнера', () => {
    const spy = vi.spyOn(sizeHooks, 'useChartSize');
    try {
      for (const [width, height] of [
        [1400, 800],
        [320, 300],
      ]) {
        const layout = createChartLayout(width, height);
        spy.mockReturnValue({ containerRef: { current: null }, layout });
        const point = firstPosition({
          axisSettings: {
            x: { mode: 'linear' },
            y: { mode: 'linear' },
          },
        });
        expect(point.x).toBeCloseTo(layout.left + (layout.plotWidth * 8) / 50);
        expect(point.y).toBeCloseTo(layout.top + layout.plotHeight * (1 - 8 / 50));
        const html = renderToStaticMarkup(<BubbleChart data={data} />);
        expect(html).toContain(`data-stage-width="${width}" data-stage-height="${height}"`);
      }
    } finally {
      spy.mockRestore();
    }
  });
  it('renders relocated labels and connectors for a dense cluster, and hides both with labels=false', () => {
    const cluster = Array.from({ length: 8 }, (_, id) => ({
      id,
      name: `Cluster ${id}`,
      x: 5,
      y: 5,
      size: 10,
      color: '#000',
    }));
    const visible = renderToStaticMarkup(<BubbleChart data={cluster} />);
    expect(visible).toContain('data-text="Cluster 0"');
    expect(visible).toContain('data-connector="true"');
    const hidden = renderToStaticMarkup(<BubbleChart data={cluster} labels={false} />);
    expect(hidden).not.toContain('Cluster');
    expect(hidden).not.toContain('data-connector');
  });
  it.each([
    ['linear', 'linear'],
    ['linear', 'grouped'],
    ['grouped', 'linear'],
    ['grouped', 'grouped'],
  ] as const)('renders X=%s and Y=%s', (xMode, yMode) => {
    const point = firstPosition({
      axisSettings: {
        x: { mode: xMode },
        y: { mode: yMode },
      },
    });
    expect(point.x).toBeCloseTo(
      CHART.left + createAxis([8, 45], CHART.plotWidth, 10, xMode).position(8),
    );
    expect(point.y).toBeCloseTo(
      CHART.top + CHART.plotHeight - createAxis([8, 45], CHART.plotHeight, 10, yMode).position(8),
    );
  });
  it('changes only X when xMode changes and only Y when yMode changes', () => {
    const original = firstPosition({
      axisSettings: {
        x: { mode: 'grouped' },
        y: { mode: 'grouped' },
      },
    });
    const changeX = firstPosition({
      axisSettings: {
        x: { mode: 'linear' },
        y: { mode: 'grouped' },
      },
    });
    const changeY = firstPosition({
      axisSettings: {
        x: { mode: 'grouped' },
        y: { mode: 'linear' },
      },
    });
    expect(changeX.y).toBe(original.y);
    expect(changeX.x).not.toBe(original.x);
    expect(changeY.x).toBe(original.x);
    expect(changeY.y).not.toBe(original.y);
  });
  it('keeps shared mode as a fallback with independent overrides', () => {
    expect(firstPosition({})).toEqual(
      firstPosition({
        axisSettings: {
          x: { mode: 'grouped' },
          y: { mode: 'grouped' },
        },
      }),
    );
    expect(
      firstPosition({
        axisSettings: {
          mode: 'linear',
        },
      }),
    ).toEqual(
      firstPosition({
        axisSettings: {
          x: { mode: 'linear' },
          y: { mode: 'linear' },
        },
      }),
    );
    expect(
      firstPosition({
        axisSettings: {
          mode: 'linear',
          x: { mode: 'grouped' },
        },
      }),
    ).toEqual(
      firstPosition({
        axisSettings: {
          x: { mode: 'grouped' },
          y: { mode: 'linear' },
        },
      }),
    );
    expect(
      firstPosition({
        axisSettings: {
          mode: 'linear',
          y: { mode: 'grouped' },
        },
      }),
    ).toEqual(
      firstPosition({
        axisSettings: {
          x: { mode: 'linear' },
          y: { mode: 'grouped' },
        },
      }),
    );
  });
});
