const numberFormat = new Intl.NumberFormat('en-US');

export const formatNumber = (value: number): string => numberFormat.format(value);

export const formatList = (items: string[]): string => items.join(', ') || '—';

export const formatArea = (area: number | null): string =>
  area === null ? '—' : `${formatNumber(area)} km²`;
