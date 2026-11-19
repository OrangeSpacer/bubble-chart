import type { Dispatch, ReactNode } from 'react';
import type { PlaygroundState, TickStep } from '../model';
import type { Action } from '../state';

interface Props {
  state: PlaygroundState;
  dispatch: Dispatch<Action>;
  children: ReactNode;
}

export function ChartControls({ state, dispatch, children }: Props) {
  const { step, labels } = state;
  return (
    <>
      <div className="toolbar">
        {(['xMode', 'yMode'] as const).map((key) => (
          <div key={key} role="group" aria-label={`Тип оси ${key === 'xMode' ? 'X' : 'Y'}`}>
            Ось {key === 'xMode' ? 'X' : 'Y'}:{' '}
            {(['linear', 'grouped'] as const).map((value) => (
              <button
                key={value}
                className={state[key] === value ? 'active' : ''}
                aria-pressed={state[key] === value}
                onClick={() => dispatch({ type: 'settings', patch: { [key]: value } })}
              >
                {value === 'linear' ? 'Linear' : 'Grouped'}
              </button>
            ))}
          </div>
        ))}
        <label>
          <input
            type="checkbox"
            checked={labels}
            onChange={(event) =>
              dispatch({ type: 'settings', patch: { labels: event.target.checked } })
            }
          />{' '}
          Названия
        </label>
      </div>
      {children}
      <div className="toolbar">
        <div>
          Шаг делений:{' '}
          {([5, 10] satisfies TickStep[]).map((value) => (
            <button
              key={value}
              className={step === value ? 'active' : ''}
              aria-pressed={step === value}
              onClick={() => dispatch({ type: 'settings', patch: { step: value } })}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="hint">
          Linear — непрерывная шкала; Grouped — пустые интервалы сжаты. Тип задаётся отдельно для X
          и Y.
        </span>
      </div>
    </>
  );
}
