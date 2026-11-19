export interface ContainerSize {
  width: number;
  height: number;
}

/** Измеряет контейнер и объединяет частые события изменения размера в один кадр. */
export function observeChartSize(container: HTMLElement, onSize: (size: ContainerSize) => void) {
  let frame = 0;
  const update = (width: number, height: number) => {
    // При скрытии контейнера сохраняем последнюю корректную геометрию.
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    onSize({ width: Math.max(1, Math.floor(width)), height: Math.max(1, Math.floor(height)) });
  };
  const measure = () => {
    const rectangle = container.getBoundingClientRect();
    update(rectangle.width, rectangle.height);
  };
  measure();
  if (typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(entry.contentRect.width, entry.contentRect.height));
  });
  observer.observe(container);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}
