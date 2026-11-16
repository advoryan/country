import { classifyError, type ErrorKind } from './classify-error.js';
import { debounce } from './debounce.js';
import type { Country } from './types.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'results'; query: string; countries: Country[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string };

export type Search = (query: string, signal: AbortSignal) => Promise<Country[]>;

export const SEARCH_DELAY_MS = 350;

const ERROR_MESSAGES: Record<Exclude<ErrorKind, 'abort'>, string> = {
  timeout: 'The server is taking too long to respond.',
  http: 'The server responded with an error.',
  network: 'Network error. Check your connection.',
};

export function createSearchController(
  search: Search,
  onChange: (state: SearchState) => void,
  delay = SEARCH_DELAY_MS,
) {
  let controller: AbortController | undefined;
  let lastQuery = '';

  const run = async (query: string): Promise<void> => {
    controller = new AbortController();
    onChange({ status: 'loading', query });

    try {
      const countries = await search(query, controller.signal);
      onChange(
        countries.length ? { status: 'results', query, countries } : { status: 'empty', query },
      );
    } catch (error) {
      const kind = classifyError(error);
      if (kind !== 'abort') onChange({ status: 'error', query, message: ERROR_MESSAGES[kind] });
    }
  };

  const debouncedRun = debounce(run, delay);

  const update = (value: string, immediate: boolean): void => {
    controller?.abort();
    debouncedRun.cancel();
    lastQuery = value.trim();

    if (!lastQuery) onChange({ status: 'idle' });
    else if (immediate) void run(lastQuery);
    else debouncedRun(lastQuery);
  };

  return {
    input: (value: string) => update(value, false),
    search: (value: string) => update(value, true),
    retry: () => update(lastQuery, true),
  };
}
