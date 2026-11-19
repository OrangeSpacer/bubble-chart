import { describe, expect, it } from 'vitest';
import { getLabelConnector, layoutBubbleLabels, type LabelAnchor } from '../utils/labelLayout';
import type { ZoneRectangle } from '../../Chart/utils/geometry';

const bounds = { x: 0, y: 0, width: 600, height: 400 };
const anchor: LabelAnchor = {
  id: 1,
  text: 'Name',
  x: 300,
  y: 200,
  radius: 20,
  width: 100,
  height: 20,
};

function intersects(a: ZoneRectangle, b: ZoneRectangle) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function overlapsBubble(rectangle: ZoneRectangle, bubble: LabelAnchor) {
  const x = Math.max(rectangle.x, Math.min(bubble.x, rectangle.x + rectangle.width));
  const y = Math.max(rectangle.y, Math.min(bubble.y, rectangle.y + rectangle.height));
  return Math.hypot(x - bubble.x, y - bubble.y) < bubble.radius;
}

describe('bubble label placement', () => {
  it('keeps an isolated label next to its bubble without a connector', () => {
    const [label] = layoutBubbleLabels([anchor], bounds);
    expect(label.x).toBe(anchor.x + anchor.radius + 6);
    expect(label.connector).toBeUndefined();
    expect(overlapsBubble(label, anchor)).toBe(false);
  });

  it('finds separate free positions for coincident bubbles and adds distant connectors', () => {
    const anchors = Array.from({ length: 12 }, (_, id) => ({ ...anchor, id }));
    const layout = layoutBubbleLabels(anchors, bounds);
    expect(layout).toHaveLength(12);
    expect(layout.some((label) => label.connector)).toBe(true);
    for (const [index, label] of layout.entries()) {
      expect(label.x).toBeGreaterThanOrEqual(bounds.x);
      expect(label.y).toBeGreaterThanOrEqual(bounds.y);
      expect(label.x + label.width).toBeLessThanOrEqual(bounds.width);
      expect(label.y + label.height).toBeLessThanOrEqual(bounds.height);
      expect(anchors.some((bubble) => overlapsBubble(label, bubble))).toBe(false);
      expect(layout.slice(index + 1).some((other) => intersects(label, other))).toBe(false);
    }
  });

  it('avoids neighbouring circles and reserved zone title rectangles', () => {
    const neighbour = { ...anchor, id: 2, text: '', x: 390, radius: 30 };
    const obstacle = { x: 174, y: 185, width: 100, height: 30 };
    const [label] = layoutBubbleLabels([anchor, neighbour], bounds, [obstacle]);
    expect(intersects(label, obstacle)).toBe(false);
    expect(overlapsBubble(label, neighbour)).toBe(false);
    expect(overlapsBubble(label, anchor)).toBe(false);
  });

  it.each([
    [0, 0],
    [600, 0],
    [0, 400],
    [600, 400],
  ])('keeps edge labels inside the plot at %s,%s', (x, y) => {
    const [label] = layoutBubbleLabels([{ ...anchor, x, y, width: 180 }], bounds);
    expect(label.x).toBeGreaterThanOrEqual(0);
    expect(label.y).toBeGreaterThanOrEqual(0);
    expect(label.x + label.width).toBeLessThanOrEqual(600);
    expect(label.y + label.height).toBeLessThanOrEqual(400);
  });

  it('connects the circumference to the nearest point on the label', () => {
    const connector = getLabelConnector(anchor, { x: 400, y: 190, width: 100, height: 20 });
    expect(connector).toEqual([320, 200, 400, 200]);
    const diagonal = getLabelConnector(anchor, { x: 400, y: 300, width: 100, height: 20 })!;
    expect(Math.hypot(diagonal[0] - anchor.x, diagonal[1] - anchor.y)).toBeCloseTo(anchor.radius);
    expect(diagonal.slice(2)).toEqual([400, 300]);
    expect(getLabelConnector(anchor, { x: 325, y: 190, width: 100, height: 20 })).toBeUndefined();
  });

  it('is deterministic, independent of input order and does not mutate anchors', () => {
    const anchors = [anchor, { ...anchor, id: 2, width: 80 }];
    const before = structuredClone(anchors);
    expect(layoutBubbleLabels(anchors, bounds)).toEqual(
      layoutBubbleLabels([...anchors].reverse(), bounds),
    );
    expect(anchors).toEqual(before);
  });

  it('handles empty names, no data and impossible packing within a small plot', () => {
    expect(layoutBubbleLabels([], bounds)).toEqual([]);
    expect(layoutBubbleLabels([{ ...anchor, text: '  ' }], bounds)).toEqual([]);
    const labels = layoutBubbleLabels([anchor, { ...anchor, id: 2 }], {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    expect(labels).toHaveLength(2);
    expect(
      labels.every(
        (label) => label.width === 10 && label.height === 10 && Number.isFinite(label.x),
      ),
    ).toBe(true);
    expect(layoutBubbleLabels([anchor], { ...bounds, width: 0 })).toEqual([]);
  });
});
