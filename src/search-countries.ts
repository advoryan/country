import { HttpError } from './http-error.js';
import { mapCountryResponse } from './map-country-response.js';
import type { Country, RawCountry } from './types.js';

const API_URL = 'https://countries.dev/name/';
const REQUEST_TIMEOUT_MS = 8000;
const NOT_FOUND = 404;

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Country[]> {
  const response = await fetch(API_URL + encodeURIComponent(query), {
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });

  if (response.status === NOT_FOUND) return [];
  if (!response.ok) throw new HttpError(response.status);

  const data: RawCountry[] = await response.json();
  return data.map(mapCountryResponse);
}
