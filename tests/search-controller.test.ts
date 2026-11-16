import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSearchController,
  SEARCH_DELAY_MS,
  type SearchState,
} from '../src/search-controller.js';
import { searchCountries } from '../src/search-countries.js';
import { jsonResponse, mockFetch } from './helpers/mock-fetch.js';
import spain from './fixtures/spain.json';

const flush = () => new Promise(setImmediate);

describe('createSearchController', () => {
  let states: SearchState[];
  let requests: ReturnType<typeof mockFetch>['requests'];
  let controller: ReturnType<typeof createSearchController>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    requests = mockFetch().requests;
    states = [];
    controller = createSearchController(searchCountries, (state) => states.push(state));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not request on empty input and resets to idle', () => {
    controller.input('sp');
    controller.input('   ');
    vi.advanceTimersByTime(SEARCH_DELAY_MS);

    expect(requests).toHaveLength(0);
    expect(states.at(-1)).toEqual({ status: 'idle' });
  });

  it('shows loading right after input and while the request is in flight', () => {
    controller.input('sp');
    expect(states).toEqual([{ status: 'loading', query: 'sp' }]);

    vi.advanceTimersByTime(SEARCH_DELAY_MS);
    expect(states).toEqual([{ status: 'loading', query: 'sp' }]);
  });

  it('does not report own cancellation as an error', async () => {
    controller.input('spain');
    vi.advanceTimersByTime(SEARCH_DELAY_MS);
    controller.input('');
    await flush();

    expect(requests[0].signal.aborted).toBe(true);
    expect(states.at(-1)).toEqual({ status: 'idle' });
    expect(states.some((state) => state.status === 'error')).toBe(false);
  });

  it('shows empty state on 404', async () => {
    controller.search('zzz');
    requests[0].resolve(jsonResponse({}, 404));
    await flush();

    expect(states.at(-1)).toEqual({ status: 'empty', query: 'zzz' });
  });

  it('shows an error and retries the last entered query', async () => {
    controller.search('spain');
    requests[0].resolve(jsonResponse({}, 500));
    await flush();

    expect(states.at(-1)).toMatchObject({ status: 'error', query: 'spain' });

    controller.retry();
    requests[1].resolve(jsonResponse(spain));
    await flush();

    expect(requests[1].url).toMatch(/spain$/);
    expect(states.at(-1)).toMatchObject({ status: 'results', query: 'spain' });
  });

  it('shows a network error', async () => {
    controller.search('spain');
    requests[0].reject(new TypeError('Failed to fetch'));
    await flush();

    expect(states.at(-1)).toMatchObject({ status: 'error' });
  });
});
