import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BubbleChart } from '../BubbleChart';
import { createAxis } from '../../Axis/utils/axis';
import { CHART } from '../constants/chart';
import type { Bubble, BubbleChartProps, ChartZone } from '../../../types';

// Проверяем координаты, переданные в Konva, без браузера и Canvas.
vi.mock('react-konva', () => {
  const Container = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    Stage: Container,
    Layer: Container,
    Group: ({ children, opacity = 1 }: { children?: ReactNode; opacity?: number }) => (
      <section data-opacity={opacity}>{children}</section>
    ),
    Rect: ({ fill, opacity = 1 }: { fill?: string; opacity?: number }) => (
      <i data-fill={fill} data-opacity={opacity} />
    ),
    Line: ({ stroke, opacity }: { stroke: string; opacity?: number }) =>
      stroke === '#667387' ? <i data-connector="true" data-opacity={opacity} /> : null,
    Text: ({ text }: { text: string }) => <span data-text={text} />,
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
  const html = renderToStaticMarkup(<BubbleChart data={data} step={10} {...props} />);
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
    expect(html).toContain(
      '<section data-opacity="0.25"><i data-opacity="1"></i><span data-text="Zone B"',
    );
    expect(html).toContain(
      '<section data-opacity="0.25"><i data-fill="white" data-opacity="0.88"></i><span data-text="Inactive"',
    );
    expect(bubbleOpacities(html)).toEqual({ '#111': 1, '#222': 0.25, '#333': 1, '#444': 1 });
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
    expect(bubbleOpacities(second)).toEqual({ '#111': 0.25, '#222': 1, '#333': 1, '#444': 1 });
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
    const point = firstPosition({ xMode, yMode });
    expect(point.x).toBeCloseTo(
      CHART.left + createAxis([8, 45], CHART.plotWidth, 10, xMode).position(8),
    );
    expect(point.y).toBeCloseTo(
      CHART.top + CHART.plotHeight - createAxis([8, 45], CHART.plotHeight, 10, yMode).position(8),
    );
  });

  it('changes only X when xMode changes and only Y when yMode changes', () => {
    const original = firstPosition({ xMode: 'grouped', yMode: 'grouped' });
    const changeX = firstPosition({ xMode: 'linear', yMode: 'grouped' });
    const changeY = firstPosition({ xMode: 'grouped', yMode: 'linear' });
    expect(changeX.y).toBe(original.y);
    expect(changeX.x).not.toBe(original.x);
    expect(changeY.x).toBe(original.x);
    expect(changeY.y).not.toBe(original.y);
  });

  it('keeps shared mode as a fallback with independent overrides', () => {
    expect(firstPosition({})).toEqual(firstPosition({ xMode: 'grouped', yMode: 'grouped' }));
    expect(firstPosition({ mode: 'linear' })).toEqual(
      firstPosition({ xMode: 'linear', yMode: 'linear' }),
    );
    expect(firstPosition({ mode: 'linear', xMode: 'grouped' })).toEqual(
      firstPosition({ xMode: 'grouped', yMode: 'linear' }),
    );
    expect(firstPosition({ mode: 'linear', yMode: 'grouped' })).toEqual(
      firstPosition({ xMode: 'linear', yMode: 'grouped' }),
    );
  });
});
