import type { ZoneRectangle } from '../../Chart/utils/geometry';

export interface LabelAnchor {
  id: number;
  text: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
}

export interface BubbleLabel extends ZoneRectangle {
  id: number;
  text: string;
  connector?: [number, number, number, number];
}

const GAP = 6;
const LABEL_GAP = 3;
const CONNECTOR_THRESHOLD = 14;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function overlapArea(a: ZoneRectangle, b: ZoneRectangle) {
  return (
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  );
}

function expand(rectangle: ZoneRectangle, padding: number): ZoneRectangle {
  return {
    x: rectangle.x - padding,
    y: rectangle.y - padding,
    width: rectangle.width + padding * 2,
    height: rectangle.height + padding * 2,
  };
}

function distanceToRectangle(point: { x: number; y: number }, rectangle: ZoneRectangle) {
  return Math.hypot(
    point.x - clamp(point.x, rectangle.x, rectangle.x + rectangle.width),
    point.y - clamp(point.y, rectangle.y, rectangle.y + rectangle.height),
  );
}

export function getLabelConnector(
  anchor: Pick<LabelAnchor, 'x' | 'y' | 'radius'>,
  rectangle: ZoneRectangle,
): BubbleLabel['connector'] {
  const x = clamp(anchor.x, rectangle.x, rectangle.x + rectangle.width);
  const y = clamp(anchor.y, rectangle.y, rectangle.y + rectangle.height);
  const distance = Math.hypot(x - anchor.x, y - anchor.y);
  if (distance - anchor.radius <= CONNECTOR_THRESHOLD) return undefined;
  return [
    anchor.x + ((x - anchor.x) * anchor.radius) / distance,
    anchor.y + ((y - anchor.y) * anchor.radius) / distance,
    x,
    y,
  ];
}

/** Детерминированный жадный алгоритм: сначала минимизируем пересечения, затем расстояние до своего пузырька.
 * Длинные подписи размещаем первыми; выбор объекта и порядок отрисовки не влияют на расположение. */
export function layoutBubbleLabels(
  anchors: readonly LabelAnchor[],
  bounds: ZoneRectangle,
  obstacles: readonly ZoneRectangle[] = [],
): BubbleLabel[] {
  if (bounds.width <= 0 || bounds.height <= 0) return [];
  const placed: BubbleLabel[] = [];
  const sorted = [...anchors]
    .filter((anchor) => anchor.text.trim())
    .sort((a, b) => b.width - a.width || a.id - b.id);

  for (const anchor of sorted) {
    const width = Math.min(anchor.width, bounds.width);
    const height = Math.min(anchor.height, bounds.height);
    const candidates: ZoneRectangle[] = [];
    const seen = new Set<string>();
    const add = (x: number, y: number) => {
      const rectangle = {
        x: clamp(x, bounds.x, bounds.x + bounds.width - width),
        y: clamp(y, bounds.y, bounds.y + bounds.height - height),
        width,
        height,
      };
      const key = `${rectangle.x}:${rectangle.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(rectangle);
      }
    };

    for (const offset of [GAP, 18, 36, 60, 96, 144, 216, 320, 480]) {
      const distance = anchor.radius + offset;
      add(anchor.x + distance, anchor.y - height / 2);
      add(anchor.x - distance - width, anchor.y - height / 2);
      add(anchor.x - width / 2, anchor.y - distance - height);
      add(anchor.x - width / 2, anchor.y + distance);
      add(anchor.x + distance, anchor.y - distance - height);
      add(anchor.x - distance - width, anchor.y - distance - height);
      add(anchor.x + distance, anchor.y + distance);
      add(anchor.x - distance - width, anchor.y + distance);
    }
    // Ищем место по всей области графика, если рядом с пузырьком тесно.
    for (let y = bounds.y; y <= bounds.y + bounds.height; y += 20) {
      for (let x = bounds.x; x <= bounds.x + bounds.width; x += 20) add(x, y);
    }

    let best = candidates[0];
    let bestCollisions = Infinity;
    let bestCost = Infinity;
    for (const rectangle of candidates) {
      let collisions = 0;
      let overlap = 0;
      for (const bubble of anchors) {
        const penetration = bubble.radius + GAP - distanceToRectangle(bubble, rectangle);
        if (penetration > 0) {
          collisions++;
          overlap += penetration * height;
        }
      }
      for (const obstacle of [...obstacles, ...placed]) {
        const area = overlapArea(rectangle, expand(obstacle, LABEL_GAP));
        if (area > 0) {
          collisions++;
          overlap += area;
        }
      }
      const distance = Math.max(0, distanceToRectangle(anchor, rectangle) - anchor.radius);
      const cost = overlap * 100 + distance;
      if (collisions < bestCollisions || (collisions === bestCollisions && cost < bestCost)) {
        best = rectangle;
        bestCollisions = collisions;
        bestCost = cost;
      }
    }
    placed.push({
      ...best,
      id: anchor.id,
      text: anchor.text,
      connector: getLabelConnector(anchor, best),
    });
  }
  return placed;
}
