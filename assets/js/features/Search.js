import { normalizeText } from '../utils/html.js';

export function createFilters(bosses, onChange) {
  const input = document.querySelector('#boss-search');
  const select = document.querySelector('#boss-region');
  const reset = document.querySelector('#boss-reset');

  const state = { query: '', region: '' };

  function fillRegions(list) {
    if (!select) return;
    const regions = [...new Set(list.map((boss) => boss.region).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b),
    );
    select.innerHTML =
      '<option value="">Все регионы</option>' +
      regions.map((region) => `<option value="${region.replaceAll('"', '&quot;')}">${region}</option>`).join('');
    select.value = state.region;
  }

  fillRegions(bosses);

  let timer;

  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.query = normalizeText(input.value);
      onChange();
    }, 200);
  });

  select?.addEventListener('change', () => {
    state.region = select.value;
    onChange();
  });

  reset?.addEventListener('click', () => {
    state.query = '';
    state.region = '';
    if (input) input.value = '';
    if (select) select.value = '';
    onChange();
  });

  function filter(list) {
    return list.filter((boss) => {
      if (state.region && boss.region !== state.region) return false;
      if (!state.query) return true;

      const haystack = normalizeText(
        [boss.name, boss.region, boss.location, ...boss.drops].join(' '),
      );

      return state.query.split(' ').every((word) => haystack.includes(word));
    });
  }

  return { filter, state, refresh: fillRegions };
}
