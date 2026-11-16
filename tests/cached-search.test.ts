import { describe, expect, it, vi } from 'vitest';
import { createCachedSearch } from '../src/cached-search.js';
import type { Country } from '../src/types.js';

const countries = [{ name: 'Spain' }] as Country[];

function deferredSearch() {
  const calls: { signal: AbortSignal; resolve: (value: Country[]) => void }[] = [];
  const search = vi.fn(
    (_query: string, signal: AbortSignal) =>
      new Promise<Country[]>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        calls.push({ signal, resolve });
      }),
  );
  return { search, calls };
}

describe('createCachedSearch', () => {
  it('returns a cached result without a new request', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);

    const first = cached('spain', new AbortController().signal);
    calls[0].resolve(countries);
    await first;

    await expect(cached('Spain', new AbortController().signal)).resolves.toBe(countries);
    expect(search).toHaveBeenCalledOnce();
  });

  it('shares an in-flight request between callers', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);

    const first = cached('spain', new AbortController().signal);
    const second = cached('spain', new AbortController().signal);
    calls[0].resolve(countries);

    await expect(Promise.all([first, second])).resolves.toEqual([countries, countries]);
    expect(search).toHaveBeenCalledOnce();
  });

  it('aborting one caller does not break the shared request for others', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);
    const quitter = new AbortController();

    const first = cached('spain', quitter.signal);
    const second = cached('spain', new AbortController().signal);
    quitter.abort();
    calls[0].resolve(countries);

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toBe(countries);
    expect(calls[0].signal.aborted).toBe(false);
  });

  it('aborts the request when every caller has aborted', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);
    const controller = new AbortController();

    const result = cached('spain', controller.signal);
    controller.abort();

    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    expect(calls[0].signal.aborted).toBe(true);

    const retry = cached('spain', new AbortController().signal);
    calls[1].resolve(countries);
    await expect(retry).resolves.toBe(countries);
  });

  it('does not cache failures', async () => {
    const search = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue(countries);
    const cached = createCachedSearch(search);

    await expect(cached('spain', new AbortController().signal)).rejects.toThrow('boom');
    await expect(cached('spain', new AbortController().signal)).resolves.toBe(countries);
    expect(search).toHaveBeenCalledTimes(2);
  });
});
