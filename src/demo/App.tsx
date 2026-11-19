import { useReducer } from 'react';
import { BubbleChart } from '../chart';
import { ChartControls } from './components/ChartControls';
import { AxisSettings } from './components/AxisSettings';
import { MedianSettingsPanel } from './components/MedianSettings';
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
      <section className="card chart-card" aria-label="Диаграмма">
        <ChartControls state={state} dispatch={dispatch}>
          <BubbleChart
            data={state.data}
            selectedId={state.selectedId}
            activeZoneId={state.activeZoneId}
            labels={state.labels}
            zones={state.zones ? zones : undefined}
            axisSettings={{
              x: { title: state.xAxisTitle, tickSuffix: state.xTickSuffix, mode: state.xMode },
              y: { title: state.yAxisTitle, tickSuffix: state.yTickSuffix, mode: state.yMode },
              step: state.step,
              showLines: state.showAxisLines,
              autoGap: state.autoAxisGap,
            }}
            medianSettings={state.medianSettings}
            onSelect={(id) => dispatch({ type: 'select', id })}
          />
        </ChartControls>
      </section>
      <AxisSettings state={state} dispatch={dispatch} />
      <MedianSettingsPanel state={state} dispatch={dispatch} />
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
