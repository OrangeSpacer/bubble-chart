import { Group, Line, Rect, Text } from 'react-konva';
import type { ProjectedZone } from './utils/projectZones';
import { getZoneLabels } from './utils/zoneLabels';
import { getZoneBorderSegments } from './utils/zoneBorders';
import { CHART, type ChartLayout } from '../Chart/constants/chart';

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

export function ZoneAnnotations({ zones, layout = CHART }: Props & { layout?: ChartLayout }) {
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
          {getZoneBorderSegments(rectangle, layout).map((points, index) => (
            <Line key={index} points={points} stroke="#667487" dash={[5, 5]} />
          ))}
          {getZoneLabels(rectangle, zone).map((label, index) => (
            <Text key={index} {...label} fill="#485365" wrap="none" ellipsis />
          ))}
        </Group>
      ))}
    </>
  );
}
