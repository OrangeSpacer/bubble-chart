import { Group, Text } from 'react-konva';
import type { MedianGeometry } from './utils/medianGeometry';
import { LABEL_FONT_FAMILY, LABEL_FONT_SIZE, LABEL_PADDING } from '../Bubble/utils/labelText';

export function MedianOverlay({ medians }: { medians: readonly MedianGeometry[] }) {
  return (
    <Group listening={false}>
      {medians.map(
        (median) =>
          median.label && (
            <Group key={median.axis} x={median.label.x} y={median.label.y}>
              <Text
                text={median.label.text}
                width={median.label.width}
                height={median.label.height}
                padding={LABEL_PADDING}
                fontFamily={LABEL_FONT_FAMILY}
                fontSize={LABEL_FONT_SIZE}
                fill="#485365"
                wrap="none"
                ellipsis
                verticalAlign="middle"
              />
            </Group>
          ),
      )}
    </Group>
  );
}
