import { el, infoList } from './dom.js';
import { formatNumber } from './format.js';
import type { SearchState } from './search-controller.js';
import type { Country } from './types.js';

export interface ViewHandlers {
  onRetry: () => void;
  onSelect: (country: Country) => void;
}

const message = (className: string, text: string): HTMLParagraphElement =>
  el('p', { className: `message ${className}`, textContent: text });

export const flag = (country: Country): HTMLImageElement =>
  el('img', { className: 'flag', src: country.flag, alt: `Flag of ${country.name}` });

function card(country: Country, onSelect: ViewHandlers['onSelect']): HTMLLIElement {
  return el(
    'li',
    {},
    el(
      'button',
      { type: 'button', className: 'card', onclick: () => onSelect(country) },
      flag(country),
      el('h2', { textContent: country.name }),
      infoList([
        ['Capital', country.capital],
        ['Region', country.region],
        ['Population', formatNumber(country.population)],
      ]),
    ),
  );
}

export function renderState(state: SearchState, { onRetry, onSelect }: ViewHandlers): Node {
  switch (state.status) {
    case 'idle':
      return message('hint', 'Start typing a country name.');
    case 'loading':
      return el('div', { className: 'loader', role: 'status', ariaLabel: 'Loading' });
    case 'empty':
      return message('empty', `Nothing found for “${state.query}”. Try another name.`);
    case 'error':
      return el(
        'div',
        { className: 'error', role: 'alert' },
        el('p', { textContent: state.message }),
        el('button', {
          type: 'button',
          className: 'retry',
          textContent: 'Retry',
          onclick: onRetry,
        }),
      );
    case 'results':
      return el('ul', { className: 'cards' }, ...state.countries.map((c) => card(c, onSelect)));
  }
}

export const renderHistory = (history: string[], onPick: (query: string) => void): Node[] =>
  history.map((query) =>
    el('button', {
      type: 'button',
      className: 'chip',
      textContent: query,
      onclick: () => onPick(query),
    }),
  );
