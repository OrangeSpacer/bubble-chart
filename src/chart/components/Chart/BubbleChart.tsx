import { Stage, Layer, Group } from 'react-konva';
import { createPlotClip } from './utils/plotClip';
import { useChartSize } from './hooks/useChartSize';
import { useBubbleChart } from './hooks/useBubbleChart';
import type { BubbleChartProps } from '../../types/chart';
import { ZoneBackgrounds, ZoneAnnotations } from '../Zone/ChartZones';
import { ChartAxes } from '../Axis/ChartAxes';
import { BubbleMark } from '../Bubble/BubbleMark';
import { BubbleLabels, BubbleLabelConnectors } from '../Bubble/BubbleLabels';
import { ChartContainer } from './styles/Chart.styles';
import { MedianOverlay } from '../Median/MedianOverlay';

export function BubbleChart(props: BubbleChartProps) {
  const { selectedId, onSelect } = props;
  const { containerRef, layout } = useChartSize();
  const clipPlot = createPlotClip(layout);
  const { axes, xAxis, yAxis, projectedZones, bubbleLabels, bubbles, medians } = useBubbleChart(
    props,
    layout,
  );

  return (
    <ChartContainer
      className={props.className ? `bubble-chart ${props.className}` : 'bubble-chart'}
      ref={containerRef}
      style={props.height === undefined ? undefined : { height: props.height }}
    >
      <Stage width={layout.width} height={layout.height}>
        <Layer listening={false}>
          <Group clipFunc={clipPlot}>
            <ZoneBackgrounds zones={projectedZones} />
          </Group>
          <ChartAxes
            xAxis={xAxis}
            yAxis={yAxis}
            axisLabels={{ x: axes.x.title, y: axes.y.title }}
            tickSuffixes={{ x: axes.x.tickSuffix, y: axes.y.tickSuffix }}
            layout={layout}
            showAxisLines={axes.showLines}
          />
          <Group clipFunc={clipPlot}>
            <ZoneAnnotations zones={projectedZones} layout={layout} />
            <MedianOverlay medians={medians} />
          </Group>
        </Layer>
        <Layer>
          <Group clipFunc={clipPlot}>
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
          </Group>
        </Layer>
      </Stage>
    </ChartContainer>
  );
}
