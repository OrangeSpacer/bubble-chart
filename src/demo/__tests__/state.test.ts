import { describe, expect, it } from 'vitest';
import { createInitialState, playgroundReducer } from '../state';
import type { PlaygroundState } from '../model';

describe('playgroundReducer', () => {
  it.each(['magnets', 'red', 0, ''])(
    'выбирает зону с id %s и сбрасывает выбор отдельным действием',
    (id) => {
      const initial = createInitialState();
      const selected = playgroundReducer(initial, { type: 'select-zone', id });
      expect(selected.activeZoneId).toBe(id);
      expect(selected.data).toBe(initial.data);
      expect(selected.selectedId).toBe(initial.selectedId);
      expect(initial.activeZoneId).toBeNull();
      const reset = playgroundReducer(selected, { type: 'reset-zone' });
      expect(reset).toEqual(initial);
      expect(reset.data).toBe(selected.data);
    },
  );

  it('переключает активную зону и допускает сброс без выбора', () => {
    const initial = createInitialState();
    const selected = playgroundReducer(initial, { type: 'select-zone', id: 'magnets' });
    const switched = playgroundReducer(selected, { type: 'select-zone', id: 'red' });
    expect(switched.activeZoneId).toBe('red');
    expect(playgroundReducer(initial, { type: 'reset-zone' })).toEqual(initial);
  });
  it('updates axis modes independently', () => {
    const initial = createInitialState();
    const changedX = playgroundReducer(initial, { type: 'settings', patch: { xMode: 'linear' } });
    expect(changedX.xMode).toBe('linear');
    expect(changedX.yMode).toBe('grouped');
    const changedY = playgroundReducer(changedX, { type: 'settings', patch: { yMode: 'linear' } });
    expect(changedY.xMode).toBe('linear');
    expect(changedY.yMode).toBe('linear');
    expect(initial.xMode).toBe('grouped');
    expect(playgroundReducer(changedY, { type: 'reset' })).toEqual(initial);
  });
  it('updates only the selected bubble without mutating previous data', () => {
    const initial = createInitialState();
    const next = playgroundReducer(initial, { type: 'update', patch: { name: 'Edited', x: -2.5 } });
    expect(next.data.find((bubble) => bubble.id === 8)).toMatchObject({ name: 'Edited', x: -2.5 });
    expect(next.data[0]).toBe(initial.data[0]);
    expect(initial.data[7].x).toBe(45);
  });

  it('adds unique IDs and selects each new bubble, including with empty data', () => {
    let state: PlaygroundState = { ...createInitialState(), data: [] };
    for (let id = 1; id <= 3; id++) {
      state = playgroundReducer(state, { type: 'add' });
      expect(state.selectedId).toBe(id);
      expect(state.data.at(-1)?.id).toBe(id);
    }
  });

  it('selects existing objects and ignores unknown IDs', () => {
    const initial = createInitialState();
    expect(playgroundReducer(initial, { type: 'select', id: 1 }).selectedId).toBe(1);
    expect(playgroundReducer(initial, { type: 'select', id: 999 })).toBe(initial);
  });

  it.each([{ x: NaN }, { y: Infinity }, { size: -1 }, { size: 101 }])(
    'rejects invalid edits %j',
    (patch) => {
      const initial = createInitialState();
      expect(playgroundReducer(initial, { type: 'update', patch })).toBe(initial);
    },
  );

  it('resets data, selection and every setting', () => {
    let state = playgroundReducer(createInitialState(), { type: 'add' });
    state = playgroundReducer(state, { type: 'select-zone', id: 'magnets' });
    state = playgroundReducer(state, {
      type: 'settings',
      patch: {
        xMode: 'linear',
        yMode: 'linear',
        step: 10,
        labels: false,
        zones: false,
        cutX: 1,
        cutY: 2,
      },
    });
    const reset = playgroundReducer(state, { type: 'reset' });
    expect(reset).toEqual(createInitialState());
    expect(reset.data).not.toBe(createInitialState().data);
  });
});
