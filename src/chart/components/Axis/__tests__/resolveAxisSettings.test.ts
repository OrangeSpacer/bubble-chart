import { describe, expect, it } from 'vitest';
import { resolveAxisSettings } from '../utils/resolveAxisSettings';

describe('настройки осей', () => {
  it('сохраняет значения по умолчанию', () => {
    expect(resolveAxisSettings()).toEqual({
      x: { title: 'X', tickSuffix: '', mode: 'grouped', step: 5 },
      y: { title: 'Y', tickSuffix: '', mode: 'grouped', step: 5 },
      showLines: true,
      autoGap: true,
    });
  });

  it('независимо задаёт оси и переопределяет общие настройки', () => {
    const axes = resolveAxisSettings({
      mode: 'grouped',
      step: 10,
      x: { title: 'Стоимость', tickSuffix: ' ₽', mode: 'linear', step: 5 },
      y: { title: 'Эффект', tickSuffix: '%' },
      showLines: false,
      autoGap: false,
    });
    expect(axes.x).toEqual({ title: 'Стоимость', tickSuffix: ' ₽', mode: 'linear', step: 5 });
    expect(axes.y).toEqual({ title: 'Эффект', tickSuffix: '%', mode: 'grouped', step: 10 });
    expect(axes.showLines).toBe(false);
    expect(axes.autoGap).toBe(false);
  });

  it('не заменяет пустые строки и false значениями по умолчанию', () => {
    expect(
      resolveAxisSettings({ x: { title: '', tickSuffix: '' }, showLines: false, autoGap: false }),
    ).toMatchObject({ x: { title: '', tickSuffix: '' }, showLines: false, autoGap: false });
  });
});
