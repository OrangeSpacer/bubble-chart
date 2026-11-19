import type { Dispatch } from 'react';
import type { PlaygroundState } from '../model';
import type { Action } from '../state';

export function AxisSettings({
  state,
  dispatch,
}: {
  state: PlaygroundState;
  dispatch: Dispatch<Action>;
}) {
  return (
    <section className="card">
      <h2>Подписи осей</h2>
      <label>
        <input
          type="checkbox"
          checked={state.autoAxisGap}
          onChange={(event) =>
            dispatch({ type: 'settings', patch: { autoAxisGap: event.target.checked } })
          }
        />{' '}
        Автоматические отступы для пузырьков у краёв
      </label>
      <label>
        <input
          type="checkbox"
          checked={state.showAxisLines}
          onChange={(event) =>
            dispatch({ type: 'settings', patch: { showAxisLines: event.target.checked } })
          }
        />{' '}
        Показывать ведущие линии X и Y
      </label>
      <div className="columns">
        {(
          [
            { axis: 'X', title: 'xAxisTitle', suffix: 'xTickSuffix' },
            { axis: 'Y', title: 'yAxisTitle', suffix: 'yTickSuffix' },
          ] as const
        ).map(({ axis, title, suffix }) => (
          <div key={axis} className="fields">
            <label>
              Название оси {axis}
              <input
                type="text"
                value={state[title]}
                onChange={(event) =>
                  dispatch({ type: 'settings', patch: { [title]: event.target.value } })
                }
              />
            </label>
            <label>
              Знак делений оси {axis}
              <input
                type="text"
                value={state[suffix]}
                placeholder="%, ₽, шт."
                onChange={(event) =>
                  dispatch({ type: 'settings', patch: { [suffix]: event.target.value } })
                }
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
