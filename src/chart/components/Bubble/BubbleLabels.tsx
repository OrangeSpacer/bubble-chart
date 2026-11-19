import { Group, Line, Rect, Text } from 'react-konva';
import type { BubbleLabel } from './utils/labelLayout';
import { LABEL_FONT_FAMILY, LABEL_FONT_SIZE, LABEL_PADDING } from './utils/labelText';

type DisplayLabel = BubbleLabel & { opacity?: number };

export function BubbleLabelConnectors({ labels }: { labels: readonly DisplayLabel[] }) {
  return (
    <Group listening={false}>
      {labels.map(
        (label) =>
          label.connector && (
            <Line
              key={label.id}
              points={label.connector}
              stroke="#667387"
              strokeWidth={1}
              opacity={0.8 * (label.opacity ?? 1)}
            />
          ),
      )}
    </Group>
  );
}

export function BubbleLabels({ labels }: { labels: readonly DisplayLabel[] }) {
  return (
    <Group listening={false}>
      {labels.map((label) => (
        <Group key={label.id} x={label.x} y={label.y} opacity={label.opacity ?? 1}>
          <Rect
            width={label.width}
            height={label.height}
            fill="white"
            opacity={0.88}
            cornerRadius={3}
          />
          <Text
            width={label.width}
            height={label.height}
            padding={LABEL_PADDING}
            text={label.text}
            fontSize={LABEL_FONT_SIZE}
            fontFamily={LABEL_FONT_FAMILY}
            verticalAlign="middle"
            fill="#243145"
            wrap="none"
            ellipsis
          />
        </Group>
      ))}
    </Group>
  );
}
