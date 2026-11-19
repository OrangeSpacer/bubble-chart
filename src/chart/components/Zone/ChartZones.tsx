import { Group, Rect, Text } from 'react-konva';
import type { ProjectedZone } from './utils/projectZones';
import { getZoneLabels } from './utils/zoneLabels';

interface Props {
  zones: readonly (ProjectedZone & { opacity?: number })[];
}

export function ZoneBackgrounds({ zones }: Props) {
  return (
    <>
      {zones.map(({ zone, rectangle, opacity = 1 }) => (
        <Rect key={zone.id} {...rectangle} fill={zone.color} opacity={opacity} />
      ))}
    </>
  );
}

export function ZoneAnnotations({ zones }: Props) {
  return (
    <>
      {zones.map(({ zone, rectangle, opacity = 1 }) => (
        <Group
          key={zone.id}
          opacity={opacity}
          x={rectangle.x}
          y={rectangle.y}
          clipX={0}
          clipY={0}
          clipWidth={rectangle.width}
          clipHeight={rectangle.height}
        >
          <Rect width={rectangle.width} height={rectangle.height} stroke="#667487" dash={[5, 5]} />
          {getZoneLabels(rectangle, zone).map((label, index) => (
            <Text key={index} {...label} fill="#485365" wrap="none" ellipsis />
          ))}
        </Group>
      ))}
    </>
  );
}
