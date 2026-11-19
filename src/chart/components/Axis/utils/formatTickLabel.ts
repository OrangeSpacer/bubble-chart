/** Знак относится только к отображению: число и маркер разрыва Grouped сохраняются. */
export function formatTickLabel(label: string, suffix = ''): string {
  return `${label}${suffix}`;
}
