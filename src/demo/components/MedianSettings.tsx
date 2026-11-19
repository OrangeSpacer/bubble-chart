import type { Dispatch } from 'react';
import type { PlaygroundState } from '../model';
import type { Action } from '../state';

export function MedianSettingsPanel({
  state,
  dispatch,
}: {
  state: PlaygroundState;
  dispatch: Dispatch<Action>;
}) {
  return (
    <section className="card">
      <h2>Медианы</h2>
      <div className="columns">
        {(['x', 'y'] as const).map((axis) => {
          const settings = state.medianSettings[axis];
          return (
            <div key={axis} className="fields">
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={settings != null}
                    onChange={(event) =>
                      dispatch({
                        type: 'set-median',
                        axis,
                        settings: event.target.checked
                          ? { value: axis === 'x' ? state.cutX : state.cutY, sign: '' }
                          : null,
                      })
                    }
                  />{' '}
                  Медиана {axis.toUpperCase()}
                </span>
              </label>
              <label>
                Значение медианы {axis.toUpperCase()}
                <input
                  type="number"
                  step="any"
                  disabled={!settings}
                  value={settings?.value ?? ''}
                  onChange={(event) => {
                    const value = event.target.valueAsNumber;
                    if (settings && Number.isFinite(value))
                      dispatch({ type: 'set-median', axis, settings: { ...settings, value } });
                  }}
                />
              </label>
              <label>
                Знак медианы {axis.toUpperCase()}
                <input
                  type="text"
                  disabled={!settings}
                  value={settings?.sign ?? ''}
                  placeholder="%, ₽, шт."
                  onChange={(event) => {
                    if (settings)
                      dispatch({
                        type: 'set-median',
                        axis,
                        settings: { ...settings, sign: event.target.value },
                      });
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
