import type { AxesSettings } from './axisSettings';
import type { MedianSettings } from './medianSettings';
export type { AxisSettings, AxesSettings } from './axisSettings';
export type { MedianSettings, MedianAxisSettings } from './medianSettings';
import type { CSSProperties } from 'react';

export interface Bubble {
  id: number;
  name: string;
  x: number;
  y: number;
  /** Исходное значение; радиус нормализуется по максимальному size в массиве данных. */
  size: number;
  color: string;
  /** Связь с зоной из данных бэка; без неё пузырёк приглушается при выборе любой зоны. */
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
  axisSettings?: AxesSettings;
  /** Значения медиан приходят извне и не участвуют в расчёте диапазонов осей. */
  medianSettings?: MedianSettings;
  /** Класс контейнера для оформления, в том числе через styled(BubbleChart). */
  className?: string;
  /** Высота контейнера; по умолчанию занимает высоту родителя, минимум 280 px. */
  height?: CSSProperties['height'];
  data: readonly Bubble[];
  selectedId?: number;
  onSelect?: (id: number) => void;
  labels?: boolean;
  zones?: readonly ChartZone[];
  /** Активная зона; null или отсутствие значения отключает приглушение. */
  activeZoneId?: ChartZone['id'] | null;
}
