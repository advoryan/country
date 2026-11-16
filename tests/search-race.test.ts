import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSearchController,
  SEARCH_DELAY_MS,
  type SearchState,
} from '../src/search-controller.js';
import { searchCountries } from '../src/search-countries.js';
import { jsonResponse, mockFetch } from './helpers/mock-fetch.js';
import spain from './fixtures/spain.json';
import antarctica from './fixtures/antarctica.json';

describe('request race', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows only the latest result when an earlier response arrives later', async () => {
    const { requests } = mockFetch();
    const states: SearchState[] = [];
    const controller = createSearchController(searchCountries, (state) => states.push(state));

    controller.input('sp');
    vi.advanceTimersByTime(SEARCH_DELAY_MS);
    controller.input('spain');
    expect(requests[0].signal.aborted).toBe(true);
    vi.advanceTimersByTime(SEARCH_DELAY_MS);
    expect(requests).toHaveLength(2);

    requests[1].resolve(jsonResponse(spain));
    await vi.waitFor(() => expect(states.at(-1)?.status).toBe('results'));
    requests[0].resolve(jsonResponse(antarctica));
    await new Promise(setImmediate);

    expect(states.at(-1)).toMatchObject({ query: 'spain', countries: [{ name: 'Spain' }] });
    expect(states.some((state) => state.status === 'error')).toBe(false);
    expect(states.filter((state) => state.status === 'results')).toHaveLength(1);
  });
});
