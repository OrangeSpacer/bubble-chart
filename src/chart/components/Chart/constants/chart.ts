export interface ChartLayout {
  width: number;
  height: number;
  left: number;
  top: number;
  plotWidth: number;
  plotHeight: number;
}

/** Исходный размер используется до первого измерения контейнера. */
export const CHART: ChartLayout = {
  width: 760,
  height: 470,
  left: 65,
  top: 22,
  plotWidth: 635,
  plotHeight: 375,
};
