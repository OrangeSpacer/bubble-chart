import { Stage, Layer } from 'react-konva';
import { CHART } from './constants/chart';
import { useBubbleChart } from './hooks/useBubbleChart';
import type { BubbleChartProps } from '../../types';
import { ZoneBackgrounds, ZoneAnnotations } from '../Zone/ChartZones';
import { ChartAxes } from '../Axis/ChartAxes';
import { BubbleMark } from '../Bubble/BubbleMark';
import { BubbleLabels, BubbleLabelConnectors } from '../Bubble/BubbleLabels';
import './styles/chart.css';

export function BubbleChart(props: BubbleChartProps) {
  const { selectedId, onSelect, axisLabels = { x: 'X', y: 'Y' } } = props;
  const { xAxis, yAxis, projectedZones, bubbleLabels, bubbles } = useBubbleChart(props);

  return (
    <div className="bubble-chart">
      <Stage width={CHART.width} height={CHART.height}>
        <Layer listening={false}>
          <ZoneBackgrounds zones={projectedZones} />
          <ChartAxes xAxis={xAxis} yAxis={yAxis} axisLabels={axisLabels} />
          <ZoneAnnotations zones={projectedZones} />
        </Layer>
        <Layer>
          <BubbleLabelConnectors labels={bubbleLabels} />
          {bubbles.map((mark) => (
            <BubbleMark
              key={mark.bubble.id}
              {...mark}
              selected={mark.bubble.id === selectedId}
              onSelect={onSelect}
            />
          ))}
          <BubbleLabels labels={bubbleLabels} />
        </Layer>
      </Stage>
    </div>
  );
}
