import type { ChartZone } from '../chart';

/** Mock backend payload; the sliders only adjust this demo's rectangles. */
export function createDemoZones(cutX: number, cutY: number): ChartZone[] {
  return [
    {
      id: 'magnets',
      x1: 0,
      x2: cutX,
      y1: cutY,
      y2: 80,
      color: '#ddeef7',
      title: 'Магниты',
      subtitle: 'Высокий эффект',
      titlePosition: { vertical: 'top', horizontal: 'left' },
    },
    {
      id: 'leak',
      x1: cutX,
      x2: 50,
      y1: cutY,
      y2: 80,
      color: '#f8efd9',
      title: 'Утечка',
      subtitle: 'Требует внимания',
      titlePosition: { vertical: 'top', horizontal: 'right' },
    },
    {
      id: 'core',
      x1: 0,
      x2: cutX,
      y1: 0,
      y2: cutY,
      color: '#e8effb',
      title: 'Зрелое ядро',
      subtitle: 'Стабильная основа',
      titlePosition: { vertical: 'bottom', horizontal: 'left' },
    },
    {
      id: 'red',
      x1: cutX,
      x2: 50,
      y1: 0,
      y2: cutY,
      color: '#f9e5e8',
      title: 'Красная зона',
      subtitle: 'Низкий эффект',
      titlePosition: { vertical: 'bottom', horizontal: 'right' },
    },
  ];
}
