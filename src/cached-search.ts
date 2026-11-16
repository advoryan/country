import type { Country, Search } from './types.js';

interface PendingRequest {
  promise: Promise<Country[]>;
  controller: AbortController;
  subscribers: number;
}

export function createCachedSearch(search: Search): Search {
  const cache = new Map<string, Country[]>();
  const pending = new Map<string, PendingRequest>();

  const request = (key: string, query: string): PendingRequest => {
    const controller = new AbortController();
    const entry: PendingRequest = {
      controller,
      subscribers: 0,
      promise: search(query, controller.signal)
        .then((countries) => {
          cache.set(key, countries);
          return countries;
        })
        .finally(() => {
          if (pending.get(key) === entry) pending.delete(key);
        }),
    };
    pending.set(key, entry);
    return entry;
  };

  return (query, signal) => {
    const key = query.toLowerCase();
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached);

    const entry = pending.get(key) ?? request(key, query);
    entry.subscribers += 1;

    return new Promise((resolve, reject) => {
      const onAbort = (): void => {
        reject(signal.reason);
        entry.subscribers -= 1;
        if (entry.subscribers > 0) return;
        pending.delete(key);
        entry.controller.abort();
      };

      signal.addEventListener('abort', onAbort, { once: true });
      entry.promise
        .then(resolve, reject)
        .finally(() => signal.removeEventListener('abort', onAbort));
    });
  };
}
