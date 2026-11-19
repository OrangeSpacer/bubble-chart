import { Group, Line, Text } from 'react-konva';
import type { Axis } from './utils/axis';
import { CHART, type ChartLayout } from '../Chart/constants/chart';
import { formatTickLabel } from './utils/formatTickLabel';
import { createPlotClip } from '../Chart/utils/plotClip';

export function ChartAxes({
  xAxis,
  yAxis,
  axisLabels,
  tickSuffixes = { x: '', y: '' },
  layout = CHART,
  showAxisLines = true,
}: {
  xAxis: Axis;
  yAxis: Axis;
  axisLabels: { x: string; y: string };
  tickSuffixes?: { x: string; y: string };
  layout?: ChartLayout;
  showAxisLines?: boolean;
}) {
  const { left, top, plotWidth, plotHeight, height } = layout;
  const bottom = top + plotHeight;
  const clipPlot = createPlotClip(layout);
  const xStart = xAxis.ticks[0];
  const yStart = yAxis.ticks[0];
  // Общую начальную подпись рисуем у пересечения осей; разные единицы не объединяем.
  const sharedStartLabel = Boolean(
    xStart &&
    yStart &&
    !xStart.hidden &&
    !yStart.hidden &&
    xStart.value === yStart.value &&
    formatTickLabel(xStart.label, tickSuffixes.x) === formatTickLabel(yStart.label, tickSuffixes.y),
  );
  const xTickWidth = Math.max(
    1,
    Math.min(100, plotWidth / Math.max(1, xAxis.ticks.length - 1) - 4),
  );
  return (
    <>
      {xAxis.ticks
        .filter((tick) => !tick.hidden)
        .map((tick) => {
          const x = left + tick.pixel;
          return (
            <Group key={tick.value}>
              {tick.pixel < plotWidth && (showAxisLines || tick.pixel !== 0) && (
                <Group clipFunc={clipPlot}>
                  <Line points={[x, top, x, bottom]} stroke="#d5dbe2" />
                </Group>
              )}
              {!(sharedStartLabel && tick === xStart) && (
                <Text
                  x={x - xTickWidth / 2}
                  y={bottom + 10}
                  width={xTickWidth}
                  wrap="none"
                  ellipsis
                  align="center"
                  text={formatTickLabel(tick.label, tickSuffixes.x)}
                  fontSize={12}
                  fill="#485365"
                  fontStyle={tick.breakBefore ? 'bold' : 'normal'}
                />
              )}
            </Group>
          );
        })}
      {yAxis.ticks
        .filter((tick) => !tick.hidden)
        .map((tick) => {
          const y = bottom - tick.pixel;
          return (
            <Group key={tick.value}>
              {tick.pixel < plotHeight && (showAxisLines || tick.pixel !== 0) && (
                <Group clipFunc={clipPlot}>
                  <Line points={[left, y, left + plotWidth, y]} stroke="#d5dbe2" />
                </Group>
              )}
              {!(sharedStartLabel && tick === yStart) && (
                <Text
                  x={5}
                  y={y - 7}
                  width={left - 15}
                  wrap="none"
                  ellipsis
                  align="right"
                  text={formatTickLabel(tick.label, tickSuffixes.y)}
                  fontSize={12}
                  fill="#485365"
                  fontStyle={tick.breakBefore ? 'bold' : 'normal'}
                />
              )}
            </Group>
          );
        })}
      {showAxisLines && (
        <Group clipFunc={clipPlot}>
          <Line
            name="axis-lines"
            points={[left, top, left, bottom, left + plotWidth, bottom]}
            stroke="#aab4c2"
          />
        </Group>
      )}
      {sharedStartLabel && (
        <Text
          x={4}
          y={bottom + 4}
          width={Math.max(1, left - 12)}
          align="right"
          wrap="none"
          ellipsis
          text={formatTickLabel(xStart.label, tickSuffixes.x)}
          fontSize={12}
          fill="#485365"
        />
      )}
      <Text
        x={left}
        width={plotWidth}
        align="center"
        wrap="none"
        ellipsis
        y={height - 24}
        text={axisLabels.x}
        fill="#596575"
        fontSize={14}
      />
      <Text
        x={8}
        y={top + plotHeight}
        width={plotHeight}
        align="center"
        wrap="none"
        ellipsis
        rotation={-90}
        text={axisLabels.y}
        fill="#596575"
        fontSize={14}
      />
    </>
  );
}
