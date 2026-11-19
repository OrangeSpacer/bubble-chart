import { useReducer } from 'react';
import { BubbleChart } from '../chart';
import { ChartControls } from './components/ChartControls';
import { BubbleEditor, BubbleList, ZoneSettings } from './components/Panels';
import { createInitialState, playgroundReducer } from './state';
import { createDemoZones } from './zones';
import './style.css';

export function App() {
  const [state, dispatch] = useReducer(playgroundReducer, undefined, createInitialState);
  const selectedBubble = state.data.find((bubble) => bubble.id === state.selectedId);
  const zones = createDemoZones(state.cutX, state.cutY);

  return (
    <main>
      <header>
        <div>
          <h1>Bubble Chart Playground</h1>
          <p>React + TypeScript + D3 scales + Konva Canvas</p>
        </div>
        <button onClick={() => dispatch({ type: 'reset' })}>↺ Сбросить</button>
      </header>
      <section className="card" aria-label="Диаграмма">
        <ChartControls state={state} dispatch={dispatch}>
          <BubbleChart
            data={state.data}
            selectedId={state.selectedId}
            activeZoneId={state.activeZoneId}
            xMode={state.xMode}
            yMode={state.yMode}
            step={state.step}
            labels={state.labels}
            zones={state.zones ? zones : undefined}
            axisLabels={{ x: 'Ось X', y: 'Ось Y' }}
            onSelect={(id) => dispatch({ type: 'select', id })}
          />
        </ChartControls>
      </section>
      <div className="columns">
        <BubbleEditor
          bubble={selectedBubble}
          zones={zones}
          onChange={(patch) => dispatch({ type: 'update', patch })}
        />
        <ZoneSettings state={state} dispatch={dispatch} zones={zones} />
      </div>
      <BubbleList
        data={state.data}
        selectedId={state.selectedId}
        onSelect={(id) => dispatch({ type: 'select', id })}
        onAdd={() => dispatch({ type: 'add' })}
      />
    </main>
  );
}
