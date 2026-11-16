import { describe, expect, it } from 'vitest';
import { addToHistory, loadHistory, saveHistory } from '../src/history.js';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  } as Storage;
}

describe('history', () => {
  it('adds the query to the front without duplicates', () => {
    expect(addToHistory(['france', 'Spain'], 'spain')).toEqual(['spain', 'france']);
  });

  it('keeps only the latest entries', () => {
    expect(addToHistory(['b', 'c'], 'a', 2)).toEqual(['a', 'b']);
  });

  it('saves and loads history', () => {
    const storage = memoryStorage();

    saveHistory(['spain'], storage);

    expect(loadHistory(storage)).toEqual(['spain']);
  });

  it('returns an empty history for missing or broken data', () => {
    expect(loadHistory(memoryStorage())).toEqual([]);
    expect(loadHistory(memoryStorage({ 'country-search-history': '{oops' }))).toEqual([]);
    expect(loadHistory(memoryStorage({ 'country-search-history': '{}' }))).toEqual([]);
  });
});
