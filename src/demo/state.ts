import type { BubblePatch, PlaygroundState } from './model';
import type { MedianAxisSettings } from '../chart';

export function createInitialState(): PlaygroundState {
  return {
    data: [
      { id: 1, name: 'Технологии', x: 8, y: 44, size: 90, color: '#2697c1', zoneId: 'magnets' },
      { id: 2, name: 'Маркетинг', x: 12, y: 42, size: 80, color: '#d4a034', zoneId: 'magnets' },
      { id: 3, name: 'Генеративный ИИ', x: 16, y: 72, size: 28, color: '#d4a034', zoneId: 'leak' },
      { id: 4, name: 'КИБ', x: 12, y: 36, size: 52, color: '#c64e6b', zoneId: 'core' },
      { id: 5, name: 'Сервисы', x: 10, y: 21, size: 55, color: '#c64e6b', zoneId: 'core' },
      { id: 6, name: 'Внутренний аудит', x: 21, y: 31, size: 16, color: '#c64e6b', zoneId: 'red' },
      { id: 7, name: 'Стратегия', x: 25, y: 56, size: 26, color: '#2697c1', zoneId: 'leak' },
      { id: 8, name: 'Отдельный объект', x: 45, y: 61, size: 35, color: '#d4a034' },
    ],
    selectedId: 8,
    activeZoneId: null,
    xMode: 'grouped',
    yMode: 'grouped',
    xAxisTitle: 'Ось X',
    yAxisTitle: 'Ось Y',
    xTickSuffix: '',
    autoAxisGap: true,
    medianSettings: { x: { value: 15, sign: '' }, y: { value: 40, sign: '' } },
    yTickSuffix: '',
    showAxisLines: false,
    step: 5,
    labels: true,
    zones: true,
    cutX: 15,
    cutY: 40,
  };
}

type Settings = Pick<
  PlaygroundState,
  | 'xMode'
  | 'yMode'
  | 'step'
  | 'labels'
  | 'zones'
  | 'cutX'
  | 'cutY'
  | 'xAxisTitle'
  | 'yAxisTitle'
  | 'xTickSuffix'
  | 'yTickSuffix'
  | 'showAxisLines'
  | 'autoAxisGap'
>;
export type Action =
  | { type: 'reset' }
  | { type: 'select'; id: number }
  | { type: 'select-zone'; id: NonNullable<PlaygroundState['activeZoneId']> }
  | { type: 'reset-zone' }
  | { type: 'set-median'; axis: 'x' | 'y'; settings: MedianAxisSettings | null }
  | { type: 'add' }
  | { type: 'update'; patch: BubblePatch }
  | { type: 'settings'; patch: Partial<Settings> };

export function playgroundReducer(state: PlaygroundState, action: Action): PlaygroundState {
  switch (action.type) {
    case 'reset':
      return createInitialState();
    case 'select-zone':
      return { ...state, activeZoneId: action.id };
    case 'reset-zone':
      return { ...state, activeZoneId: null };
    case 'set-median':
      if (action.settings && !Number.isFinite(action.settings.value)) return state;
      return {
        ...state,
        medianSettings: { ...state.medianSettings, [action.axis]: action.settings },
      };
    case 'select':
      return state.data.some((bubble) => bubble.id === action.id)
        ? { ...state, selectedId: action.id }
        : state;
    case 'settings':
      return { ...state, ...action.patch };
    case 'add': {
      const id = state.data.reduce((max, bubble) => Math.max(max, bubble.id), 0) + 1;
      return {
        ...state,
        selectedId: id,
        data: [
          ...state.data,
          { id, name: 'Новый объект', x: 35, y: 50, size: 30, color: '#6b80c8' },
        ],
      };
    }
    case 'update': {
      const { patch } = action;
      if (
        [patch.x, patch.y, patch.size].some(
          (value) => value !== undefined && !Number.isFinite(value),
        )
      )
        return state;
      if (patch.size !== undefined && (patch.size < 5 || patch.size > 100)) return state;
      return {
        ...state,
        data: state.data.map((bubble) =>
          bubble.id === state.selectedId ? { ...bubble, ...patch } : bubble,
        ),
      };
    }
  }
}
