import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '../src/search-countries.js';
import { HttpError } from '../src/http-error.js';
import { jsonResponse, mockFetch } from './helpers/mock-fetch.js';
import spain from './fixtures/spain.json';

describe('searchCountries', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests the encoded query with a signal', () => {
    const { requests } = mockFetch();

    searchCountries('new zealand', new AbortController().signal);

    expect(requests[0].url).toBe('https://countries.dev/name/new%20zealand');
    expect(requests[0].signal).toBeInstanceOf(AbortSignal);
  });

  it('resolves with mapped countries', async () => {
    const { requests } = mockFetch();

    const result = searchCountries('spain', new AbortController().signal);
    requests[0].resolve(jsonResponse(spain));

    await expect(result).resolves.toMatchObject([{ name: 'Spain', capital: 'Madrid' }]);
  });

  it('resolves with an empty list on 404', async () => {
    const { requests } = mockFetch();

    const result = searchCountries('zzz', new AbortController().signal);
    requests[0].resolve(jsonResponse({ message: 'Not Found' }, 404));

    await expect(result).resolves.toEqual([]);
  });

  it('rejects with HttpError holding the status on other failures', async () => {
    const { requests } = mockFetch();

    const result = searchCountries('spain', new AbortController().signal);
    requests[0].resolve(jsonResponse({}, 500));

    await expect(result).rejects.toBeInstanceOf(HttpError);
    await expect(result).rejects.toMatchObject({ status: 500 });
  });

  it('rejects with AbortError when the caller aborts', async () => {
    mockFetch();
    const controller = new AbortController();

    const result = searchCountries('spain', controller.signal);
    controller.abort();

    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects with TimeoutError when the response takes too long', async () => {
    mockFetch();

    const result = searchCountries('spain', new AbortController().signal, 10);

    await expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});
