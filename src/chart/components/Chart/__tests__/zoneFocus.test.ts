import { describe, expect, it } from 'vitest';
import { getZoneFocusOpacity } from '../utils/zoneFocus';

describe('прозрачность при выборе зоны', () => {
  it.each([null, undefined])(
    'не приглушает объекты, если активная зона равна %s',
    (activeZoneId) => {
      for (const zoneId of ['a', 0, '', null, undefined])
        expect(getZoneFocusOpacity(zoneId, activeZoneId)).toBe(1);
    },
  );

  it('приглушает только связанные объекты из других зон', () => {
    expect(getZoneFocusOpacity('a', 'a')).toBe(1);
    expect(getZoneFocusOpacity('b', 'a')).toBe(0.25);
    expect(getZoneFocusOpacity(undefined, 'a')).toBe(1);
    expect(getZoneFocusOpacity(null, 'a')).toBe(1);
  });

  it('поддерживает нулевой и пустой id и сравнивает идентификаторы без приведения типов', () => {
    expect(getZoneFocusOpacity(0, 0)).toBe(1);
    expect(getZoneFocusOpacity('', '')).toBe(1);
    expect(getZoneFocusOpacity('0', 0)).toBe(0.25);
    expect(getZoneFocusOpacity('a', '')).toBe(0.25);
  });
});
