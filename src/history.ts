const STORAGE_KEY = 'country-search-history';
const HISTORY_LIMIT = 8;

export function addToHistory(history: string[], query: string, limit = HISTORY_LIMIT): string[] {
  const rest = history.filter((item) => item.toLowerCase() !== query.toLowerCase());
  return [query, ...rest].slice(0, limit);
}

export function loadHistory(storage: Storage = localStorage): string[] {
  try {
    const data: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(data) ? data.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: string[], storage: Storage = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    return;
  }
}
