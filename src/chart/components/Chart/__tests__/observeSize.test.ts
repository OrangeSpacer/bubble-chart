import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeChartSize } from '../utils/observeSize';

afterEach(() => vi.unstubAllGlobals());

describe('измерение контейнера', () => {
  it('измеряет начальный размер, объединяет обновления и отключает наблюдение', () => {
    let notify!: ResizeObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();
    const pending = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
        constructor(callback: ResizeObserverCallback) {
          notify = callback;
        }
      },
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      pending.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const container = {
      getBoundingClientRect: () => ({ width: 800.9, height: 600.2 }),
    } as HTMLElement;
    const onSize = vi.fn();
    const stop = observeChartSize(container, onSize);
    expect(onSize).toHaveBeenLastCalledWith({ width: 800, height: 600 });
    expect(observe).toHaveBeenCalledWith(container);
    const resize = (width: number, height: number) =>
      notify([{ contentRect: { width, height } } as ResizeObserverEntry], {} as ResizeObserver);
    resize(1000, 700);
    resize(1200, 800);
    expect(pending.size).toBe(1);
    for (const callback of pending.values()) callback(0);
    pending.clear();
    expect(onSize).toHaveBeenLastCalledWith({ width: 1200, height: 800 });
    const calls = onSize.mock.calls.length;
    resize(0, 0);
    for (const callback of pending.values()) callback(0);
    pending.clear();
    expect(onSize).toHaveBeenCalledTimes(calls);
    resize(900, 500);
    stop();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(pending.size).toBe(0);
  });

  it('использует resize окна при отсутствии ResizeObserver', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('ResizeObserver', undefined);
    vi.stubGlobal('window', { addEventListener, removeEventListener });
    const container = { getBoundingClientRect: () => ({ width: 800, height: 600 }) } as HTMLElement;
    const stop = observeChartSize(container, vi.fn());
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    stop();
    expect(removeEventListener).toHaveBeenCalledWith('resize', addEventListener.mock.calls[0][1]);
  });
});
