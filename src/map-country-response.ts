import type { Country, RawCountry } from './types.js';

const MISSING = '—';

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    code: raw.alpha3Code,
    name: raw.name,
    nativeName: raw.nativeName,
    flag: raw.flags.svg,
    capital: raw.capital ?? MISSING,
    region: raw.region,
    subregion: raw.subregion,
    demonym: raw.demonym,
    population: raw.population,
    area: raw.area ?? null,
    borders: raw.borders ?? [],
    languages: raw.languages.map(({ name }) => name),
    currencies: (raw.currencies ?? []).map(({ name, symbol }) => `${name} (${symbol})`),
  };
}
