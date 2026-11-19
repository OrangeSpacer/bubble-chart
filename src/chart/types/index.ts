import type { Mode } from '../components/Axis/utils/axis';

export interface Bubble {
  id: number;
  name: string;
  x: number;
  y: number;
  /** Исходное значение; радиус нормализуется по максимальному size в массиве данных. */
  size: number;
  color: string;
  /** Связь с зоной из данных бэка; без неё пузырёк не приглушается при выборе зоны. */
  zoneId?: ChartZone['id'] | null;
}

export interface ZoneTextPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'right';
}

export interface ChartZone {
  id: string | number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  color: string;
  title?: string;
  subtitle?: string;
  titlePosition?: ZoneTextPosition;
  /** По умолчанию совпадает с titlePosition; одинаковые позиции объединяют заголовок и подзаголовок в блок. */
  subtitlePosition?: ZoneTextPosition;
}

/** Управляемая диаграмма: данные, выбор объекта и настройки хранит вызывающее приложение. */
export interface BubbleChartProps {
  data: readonly Bubble[];
  selectedId?: number;
  onSelect?: (id: number) => void;
  mode?: Mode;
  /** Переопределяет общий тип шкалы для оси X. */
  xMode?: Mode;
  /** Переопределяет общий тип шкалы для оси Y. */
  yMode?: Mode;
  step?: number;
  labels?: boolean;
  zones?: readonly ChartZone[];
  /** Активная зона; null или отсутствие значения отключает приглушение. */
  activeZoneId?: ChartZone['id'] | null;
  axisLabels?: { x: string; y: string };
}
