import type { ZoneRectangle } from '../../Chart/utils/geometry';
import type { ChartZone, ZoneTextPosition } from '../../../types';

const PADDING = 8;
const GAP = 4;
const DEFAULT_POSITION: ZoneTextPosition = { vertical: 'top', horizontal: 'left' };

export function getZoneLabels(rectangle: ZoneRectangle, zone: ChartZone) {
  const titlePosition = zone.titlePosition ?? DEFAULT_POSITION;
  const subtitlePosition = zone.subtitlePosition ?? titlePosition;
  const entries = [
    { text: zone.title, position: titlePosition, fontSize: 14, height: 18, fontStyle: 'bold' },
    {
      text: zone.subtitle,
      position: subtitlePosition,
      fontSize: 12,
      height: 16,
      fontStyle: 'normal',
    },
  ].filter((entry): entry is typeof entry & { text: string } => Boolean(entry.text));
  const width = Math.max(0, rectangle.width - 2 * PADDING);
  if (width === 0) return [];

  return entries.map((entry, index) => {
    const sameCorner = entries.filter(
      (other) =>
        other.position.vertical === entry.position.vertical &&
        other.position.horizontal === entry.position.horizontal,
    );
    const blockHeight =
      sameCorner.reduce((sum, other) => sum + other.height, 0) + GAP * (sameCorner.length - 1);
    const previous = entries.slice(0, index).filter((other) => sameCorner.includes(other));
    const offset = previous.reduce((sum, other) => sum + other.height + GAP, 0);
    const y =
      entry.position.vertical === 'top'
        ? PADDING
        : Math.max(PADDING, rectangle.height - PADDING - blockHeight);
    return {
      text: entry.text,
      x: PADDING,
      y: y + offset,
      width,
      height: entry.height,
      fontSize: entry.fontSize,
      fontStyle: entry.fontStyle,
      align: entry.position.horizontal,
    };
  });
}
