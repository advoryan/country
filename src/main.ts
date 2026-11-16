import { createCachedSearch } from './cached-search.js';
import { createDetails } from './details.js';
import { el } from './dom.js';
import { createSearchController, type SearchState } from './search-controller.js';
import { searchCountries } from './search-countries.js';
import { renderState } from './view.js';

const details = createDetails();
const output = el('section', { className: 'output', ariaLive: 'polite' });
const input = el('input', {
  type: 'search',
  className: 'search',
  placeholder: 'Search countries…',
  ariaLabel: 'Country name',
  autofocus: true,
});

const render = (state: SearchState): void => {
  output.replaceChildren(
    renderState(state, { onRetry: () => controller.retry(), onSelect: details.show }),
  );
};

const controller = createSearchController(createCachedSearch(searchCountries), render);

input.addEventListener('input', () => controller.input(input.value));

document.body.append(
  el('main', { className: 'app' }, el('h1', { textContent: 'Country Search' }), input, output),
  details.element,
);

render({ status: 'idle' });
