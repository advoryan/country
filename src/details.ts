import { el, infoList } from './dom.js';
import { formatArea, formatList, formatNumber } from './format.js';
import type { Country } from './types.js';
import { flag } from './view.js';

export function createDetails(): { element: HTMLDialogElement; show: (country: Country) => void } {
  const element = el('dialog', { className: 'details' });

  element.addEventListener('click', (event) => {
    if (event.target === element) element.close();
  });

  const show = (country: Country): void => {
    element.replaceChildren(
      el(
        'form',
        { method: 'dialog' },
        el('button', { className: 'close', textContent: '×', ariaLabel: 'Close' }),
      ),
      flag(country),
      el('h2', { textContent: country.name }),
      el('p', {
        className: 'description',
        textContent: `${country.nativeName} is located in ${country.subregion}, ${country.region}. Its people are called ${country.demonym}.`,
      }),
      infoList([
        ['Capital', country.capital],
        ['Population', formatNumber(country.population)],
        ['Area', formatArea(country.area)],
        ['Borders', formatList(country.borders)],
        ['Languages', formatList(country.languages)],
        ['Currencies', formatList(country.currencies)],
      ]),
    );
    element.showModal();
  };

  return { element, show };
}
