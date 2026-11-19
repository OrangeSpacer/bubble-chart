import type { AxisMode, Bubble, ChartZone } from '../chart';

export type { Bubble } from '../chart';
export { countZones, getZonesForBubble } from '../chart';

export type BubblePatch = Partial<Pick<Bubble, 'name' | 'x' | 'y' | 'size'>>;
export type TickStep = 5 | 10;

export interface PlaygroundState {
  data: Bubble[];
  selectedId: number;
  activeZoneId: ChartZone['id'] | null;
  xMode: AxisMode;
  yMode: AxisMode;
  step: TickStep;
  labels: boolean;
  zones: boolean;
  cutX: number;
  cutY: number;
}
