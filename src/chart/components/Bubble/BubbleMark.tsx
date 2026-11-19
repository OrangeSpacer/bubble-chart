import { Circle, Group } from 'react-konva';
import type { Bubble } from '../../types';

interface MarkProps {
  bubble: Bubble;
  radius: number;
  x: number;
  y: number;
  selected: boolean;
  opacity?: number;
  onSelect?: (id: number) => void;
}

export function BubbleMark({ bubble, radius, x, y, selected, onSelect, opacity = 1 }: MarkProps) {
  return (
    <Group
      opacity={opacity}
      onClick={() => onSelect?.(bubble.id)}
      onTap={() => onSelect?.(bubble.id)}
    >
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={bubble.color}
        opacity={selected ? 0.75 : 0.43}
        stroke={bubble.color}
        strokeWidth={2}
      />
      {selected && (
        <Circle
          x={x}
          y={y}
          radius={radius + 5}
          stroke={bubble.color}
          dash={[4, 3]}
          listening={false}
        />
      )}
    </Group>
  );
}
