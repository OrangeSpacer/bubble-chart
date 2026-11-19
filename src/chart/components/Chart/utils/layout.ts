import { CHART, type ChartLayout } from '../constants/chart';

export function createChartLayout(width: number, height: number): ChartLayout {
  width = Number.isFinite(width) && width > 0 ? Math.max(1, Math.floor(width)) : CHART.width;
  height = Number.isFinite(height) && height > 0 ? Math.max(1, Math.floor(height)) : CHART.height;
  // Сохраняем место для осей; в очень маленьком контейнере уменьшаем и отступы.
  const horizontalScale = Math.min(1, width / 240);
  const verticalScale = Math.min(1, height / 160);
  const left = CHART.left * horizontalScale;
  const right = (CHART.width - CHART.left - CHART.plotWidth) * horizontalScale;
  const top = CHART.top * verticalScale;
  const bottom = (CHART.height - CHART.top - CHART.plotHeight) * verticalScale;
  return {
    width,
    height,
    left,
    top,
    plotWidth: width - left - right,
    plotHeight: height - top - bottom,
  };
}
