import type { Mode } from '../components/Axis/utils/axis';

/** Настройки одной оси. */
export interface AxisSettings {
  title?: string;
  tickSuffix?: string;
  mode?: Mode;
  step?: number;
}

/** Общие настройки осей и независимые переопределения для X и Y. */
export interface AxesSettings {
  x?: AxisSettings;
  y?: AxisSettings;
  mode?: Mode;
  step?: number;
  showLines?: boolean;
  autoGap?: boolean;
}

export interface ResolvedAxesSettings {
  x: Required<AxisSettings>;
  y: Required<AxisSettings>;
  showLines: boolean;
  autoGap: boolean;
}
