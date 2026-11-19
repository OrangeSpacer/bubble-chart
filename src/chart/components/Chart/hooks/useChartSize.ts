import { useEffect, useMemo, useRef, useState } from 'react';
import { CHART } from '../constants/chart';
import { createChartLayout } from '../utils/layout';
import { observeChartSize } from '../utils/observeSize';

export function useChartSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: CHART.width, height: CHART.height });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return observeChartSize(container, (next) =>
      setSize((previous) =>
        previous.width === next.width && previous.height === next.height ? previous : next,
      ),
    );
  }, []);

  const layout = useMemo(
    () => createChartLayout(size.width, size.height),
    [size.width, size.height],
  );
  return { containerRef, layout };
}
