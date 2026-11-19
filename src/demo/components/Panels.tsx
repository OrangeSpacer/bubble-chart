import type { Dispatch } from 'react';
import type { ChartZone } from '../../chart';
import {
  countZones,
  getZonesForBubble,
  type Bubble,
  type BubblePatch,
  type PlaygroundState,
} from '../model';
import type { Action } from '../state';

interface EditorProps {
  bubble: Bubble | undefined;
  zones: readonly ChartZone[];
  onChange: (patch: BubblePatch) => void;
}

export function BubbleEditor({ bubble, zones, onChange }: EditorProps) {
  return (
    <section className="card">
      <h2>Выбранный пузырёк</h2>
      {bubble && (
        <div className="fields">
          <label>
            Название
            <input
              type="text"
              value={bubble.name}
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </label>
          <div className="two">
            {(['x', 'y'] as const).map((coordinate) => (
              <label key={coordinate}>
                {coordinate.toUpperCase()}
                <input
                  type="number"
                  step="any"
                  value={bubble[coordinate]}
                  onChange={(event) => {
                    const value = event.target.valueAsNumber;
                    if (Number.isFinite(value)) onChange({ [coordinate]: value });
                  }}
                />
              </label>
            ))}
          </div>
          <label>
            Размер: {bubble.size}
            <input
              type="range"
              min="5"
              max="100"
              value={bubble.size}
              onChange={(event) => onChange({ size: event.target.valueAsNumber })}
            />
          </label>
          <p className="hint">
            Зоны:{' '}
            {getZonesForBubble(bubble, zones)
              .map((zone) => zone.title ?? zone.id)
              .join(', ') || 'Вне зон'}
          </p>
        </div>
      )}
    </section>
  );
}

export function ZoneSettings({
  state,
  dispatch,
  zones,
}: {
  state: PlaygroundState;
  dispatch: Dispatch<Action>;
  zones: readonly ChartZone[];
}) {
  const counts = countZones(state.data, zones);
  return (
    <section className="card">
      <h2>Зоны</h2>
      <label>
        <input
          type="checkbox"
          checked={state.zones}
          onChange={(event) =>
            dispatch({ type: 'settings', patch: { zones: event.target.checked } })
          }
        />{' '}
        Показывать зоны
      </label>
      <div className="fields">
        {(['cutX', 'cutY'] as const).map((key) => (
          <label key={key}>
            Граница {key === 'cutX' ? 'X' : 'Y'}: {state[key]}
            <input
              type="range"
              min="0"
              max={key === 'cutX' ? 50 : 80}
              value={state[key]}
              onChange={(event) =>
                dispatch({ type: 'settings', patch: { [key]: event.target.valueAsNumber } })
              }
            />
          </label>
        ))}
      </div>
      <div className="toolbar">
        <span className="hint">Выберите тег зоны</span>
        <button
          disabled={state.activeZoneId === null}
          onClick={() => dispatch({ type: 'reset-zone' })}
        >
          Сбросить активную зону
        </button>
      </div>
      <div className="zone-grid" role="group" aria-label="Активная зона">
        {zones.map((zone, index) => (
          <button
            key={zone.id}
            style={{ background: zone.color }}
            className={state.activeZoneId === zone.id ? 'active' : ''}
            aria-pressed={state.activeZoneId === zone.id}
            onClick={() => dispatch({ type: 'select-zone', id: zone.id })}
          >
            {zone.title ?? zone.id}: {counts[index]}
          </button>
        ))}
      </div>
    </section>
  );
}

interface ListProps {
  data: readonly Bubble[];
  selectedId: number;
  onSelect: (id: number) => void;
  onAdd: () => void;
}

export function BubbleList({ data, selectedId, onSelect, onAdd }: ListProps) {
  return (
    <section className="card">
      <div className="toolbar">
        <h2>Объекты</h2>
        <button onClick={onAdd}>+ Добавить</button>
      </div>
      <div className="chips">
        {data.map((bubble) => (
          <button
            key={bubble.id}
            className={bubble.id === selectedId ? 'active' : ''}
            aria-pressed={bubble.id === selectedId}
            onClick={() => onSelect(bubble.id)}
          >
            {bubble.name}
          </button>
        ))}
      </div>
    </section>
  );
}
