export const LABEL_FONT_SIZE = 12;
export const LABEL_FONT_FAMILY = 'Arial';
export const LABEL_PADDING = 3;
export const LABEL_HEIGHT = 20;
const MAX_LABEL_WIDTH = 200;

let context: CanvasRenderingContext2D | null | undefined;

export function measureLabelWidth(text: string): number {
  if (context === undefined && typeof document !== 'undefined') {
    context = document.createElement('canvas').getContext('2d');
  }
  if (context) context.font = `${LABEL_FONT_SIZE}px ${LABEL_FONT_FAMILY}`;
  const width = context
    ? context.measureText(text).width
    : Array.from(text).length * LABEL_FONT_SIZE * 0.65;
  return Math.min(MAX_LABEL_WIDTH, Math.ceil(width) + LABEL_PADDING * 2);
}
