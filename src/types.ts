export interface RawCountry {
  name: string;
  nativeName: string;
  alpha3Code: string;
  flags: { svg: string; png: string };
  capital?: string;
  region: string;
  subregion: string;
  demonym: string;
  population: number;
  area?: number;
  borders?: string[];
  languages: { name: string }[];
  currencies?: { name: string; symbol: string }[];
}

export interface Country {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  capital: string;
  region: string;
  subregion: string;
  demonym: string;
  population: number;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
}
