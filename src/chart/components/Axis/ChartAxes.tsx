import { Group, Line, Rect, Text } from 'react-konva';
import type { Axis } from './utils/axis';
import { CHART } from '../Chart/constants/chart';

export function ChartAxes({
  xAxis,
  yAxis,
  axisLabels,
}: {
  xAxis: Axis;
  yAxis: Axis;
  axisLabels: { x: string; y: string };
}) {
  const { left, top, plotWidth, plotHeight, height } = CHART;
  const bottom = top + plotHeight;
  return (
    <>
      {xAxis.ticks.map((tick) => {
        const x = left + tick.pixel;
        return (
          <Group key={tick.value}>
            <Line points={[x, top, x, bottom]} stroke="#d5dbe2" />
            <Line points={[x, bottom, x, bottom + 5]} stroke="#5d6775" />
            <Text
              x={x - 23}
              y={bottom + 10}
              width={46}
              align="center"
              text={tick.label}
              fontSize={12}
              fill="#485365"
              fontStyle={tick.breakBefore ? 'bold' : 'normal'}
            />
            {tick.breakBefore && (
              <Text x={x - 18} y={bottom - 14} text="//" fontSize={13} fill="#8a650b" />
            )}
          </Group>
        );
      })}
      {yAxis.ticks.map((tick) => {
        const y = bottom - tick.pixel;
        return (
          <Group key={tick.value}>
            <Line points={[left, y, left + plotWidth, y]} stroke="#d5dbe2" />
            <Line points={[left - 5, y, left, y]} stroke="#5d6775" />
            <Text
              x={5}
              y={y - 7}
              width={left - 15}
              align="right"
              text={tick.label}
              fontSize={12}
              fill="#485365"
              fontStyle={tick.breakBefore ? 'bold' : 'normal'}
            />
            {tick.breakBefore && (
              <Text x={left + 4} y={y - 7} text="//" fontSize={13} fill="#8a650b" />
            )}
          </Group>
        );
      })}
      <Rect x={left} y={top} width={plotWidth} height={plotHeight} stroke="#aab4c2" />
      <Text
        x={left + plotWidth / 2 - 20}
        y={height - 24}
        text={axisLabels.x}
        fill="#596575"
        fontSize={14}
      />
      <Text
        x={8}
        y={top + plotHeight / 2 + 20}
        rotation={-90}
        text={axisLabels.y}
        fill="#596575"
        fontSize={14}
      />
    </>
  );
}
