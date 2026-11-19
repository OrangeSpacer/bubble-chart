import { scaleLinear } from 'd3-scale';
export type Mode = 'linear' | 'grouped';
export interface Tick {
  value: number;
  label: string;
  pixel: number;
  breakBefore?: boolean;
  /** Служебная граница для интерполяции, которую не нужно рисовать. */
  hidden?: boolean;
}
export interface Axis {
  ticks: Tick[];
  position: (value: number) => number;
  min: number;
  max: number;
}
/** В режиме Grouped сохраняем начала занятых интервалов и границы шкалы.
 * Начала пустых интервалов пропускаем; 40+ отмечает занятый интервал после разрыва. */
export function createAxis(values: number[], length: number, step: number, mode: Mode): Axis {
  if (!Number.isFinite(step) || step <= 0)
    throw new RangeError('Axis step must be finite and positive');
  if (!Number.isFinite(length) || length < 0)
    throw new RangeError('Axis length must be finite and non-negative');
  const clean = values.filter(Number.isFinite);
  const min = Math.min(0, ...clean);
  const max = Math.max(step, ...clean);
  const start = Math.floor(min / step) * step;
  const end = Math.max(start + step, Math.ceil(max / step) * step);
  if (mode === 'linear') {
    const regular: number[] = [];
    for (let v = start; v <= end + step * 1e-6; v += step) regular.push(v);
    const scale = scaleLinear().domain([start, end]).range([0, length]);
    return {
      ticks: regular.map((value) => ({ value, label: String(value), pixel: scale(value) })),
      position: scale,
      min: start,
      max: end,
    };
  }
  const occupied = new Set<number>();
  for (const value of clean) {
    const bucket = Math.max(0, Math.floor((value - start) / step));
    occupied.add(bucket);
  }
  const kept: Omit<Tick, 'pixel'>[] = [{ value: start, label: String(start) }];
  let previousBucket = -1;
  for (const bucket of [...occupied].sort((a, b) => a - b)) {
    if (bucket > 0) {
      const value = start + bucket * step;
      const breakBefore = bucket > previousBucket + 1;
      kept.push({ value, label: `${value}${breakBefore ? '+' : ''}`, breakBefore });
    }
    previousBucket = bucket;
  }
  const last = kept[kept.length - 1];
  if (last.value < end) {
    // После последнего интервала с «+» граница нужна только для расчёта координат.
    kept.push({ value: end, label: String(end), hidden: last.breakBefore === true });
  }
  const unit = length / Math.max(1, kept.length - 1);
  const ticks = kept.map((t, index) => ({ ...t, pixel: index * unit }));
  const position = (value: number) => {
    if (value <= ticks[0].value) return 0;
    for (let k = 0; k < ticks.length - 1; k++) {
      const a = ticks[k],
        b = ticks[k + 1];
      if (value <= b.value)
        return a.pixel + ((value - a.value) / (b.value - a.value)) * (b.pixel - a.pixel);
    }
    return length;
  };
  return { ticks, position, min: start, max: end };
}
