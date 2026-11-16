import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../src/map-country-response.js';
import spain from './fixtures/spain.json';
import antarctica from './fixtures/antarctica.json';

describe('mapCountryResponse', () => {
  it('maps a full api response to card data', () => {
    expect(mapCountryResponse(spain[0])).toEqual({
      code: 'ESP',
      name: 'Spain',
      nativeName: 'España',
      flag: 'https://flagcdn.com/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      subregion: 'Southern Europe',
      demonym: 'Spanish',
      population: 47351567,
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      languages: ['Spanish'],
      currencies: ['Euro (€)'],
    });
  });

  it('falls back for missing optional fields', () => {
    expect(mapCountryResponse(antarctica[0])).toMatchObject({
      name: 'Antarctica',
      capital: '—',
      borders: [],
      currencies: [],
      languages: ['English', 'Russian'],
    });
  });

  it('does not mutate the input', () => {
    const raw = structuredClone(spain[0]);
    mapCountryResponse(raw);
    expect(raw).toEqual(spain[0]);
  });
});
