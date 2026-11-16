import { createCachedSearch } from './cached-search.js';
import { createDetails } from './details.js';
import { el } from './dom.js';
import { addToHistory, loadHistory, saveHistory } from './history.js';
import { createSearchController, type SearchState } from './search-controller.js';
import { searchCountries } from './search-countries.js';
import { renderHistory, renderState } from './view.js';

const details = createDetails();
const output = el('section', { className: 'output', ariaLive: 'polite' });
const historyNav = el('nav', { className: 'history', ariaLabel: 'Recent searches' });
const input = el('input', {
  type: 'search',
  className: 'search',
  placeholder: 'Search countries…',
  ariaLabel: 'Country name',
  autofocus: true,
});

let history = loadHistory();

const pick = (query: string): void => {
  input.value = query;
  controller.search(query);
};

const showHistory = (): void => historyNav.replaceChildren(...renderHistory(history, pick));

const remember = (query: string): void => {
  history = addToHistory(history, query);
  saveHistory(history);
  showHistory();
};

const render = (state: SearchState): void => {
  if (state.status === 'results') remember(state.query);
  output.replaceChildren(
    renderState(state, { onRetry: () => controller.retry(), onSelect: details.show }),
  );
};

const controller = createSearchController(createCachedSearch(searchCountries), render);

input.addEventListener('input', () => controller.input(input.value));

document.body.append(
  el(
    'main',
    { className: 'app' },
    el('h1', { textContent: 'Country Search' }),
    input,
    historyNav,
    output,
  ),
  details.element,
);

showHistory();
render({ status: 'idle' });
