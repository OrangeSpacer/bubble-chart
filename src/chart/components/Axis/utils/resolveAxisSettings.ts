import type { AxesSettings, ResolvedAxesSettings } from '../../../types/axisSettings';

/** Дополняет настройки значениями по умолчанию и учитывает переопределения отдельных осей. */
export function resolveAxisSettings(settings?: AxesSettings): ResolvedAxesSettings {
  const mode = settings?.mode ?? 'grouped';
  const step = settings?.step ?? 5;
  return {
    x: {
      title: settings?.x?.title ?? 'X',
      tickSuffix: settings?.x?.tickSuffix ?? '',
      mode: settings?.x?.mode ?? mode,
      step: settings?.x?.step ?? step,
    },
    y: {
      title: settings?.y?.title ?? 'Y',
      tickSuffix: settings?.y?.tickSuffix ?? '',
      mode: settings?.y?.mode ?? mode,
      step: settings?.y?.step ?? step,
    },
    showLines: settings?.showLines ?? true,
    autoGap: settings?.autoGap ?? true,
  };
}
