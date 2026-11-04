import { getLang, t } from '../utils/i18n.js';

const API_ROOT = 'https://eldenring.fanapis.com/api';
const PAGE_SIZE = 16;
const FETCH_TIMEOUT = 8000;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function localizedValue(value) {
  const text = String(value ?? '');
  return getLang() === 'ru' ? t(text) : text;
}

const CATEGORIES = {
  weapons: {
    endpoint: ['weapons'],
    meta: (item) =>
      [
        localizedValue(item.category),
        item.weight != null ? `${t('Weight')} ${item.weight}` : '',
        formatStats(item.requiredAttributes, 'amount'),
        formatStats(item.attack, 'amount', ['Phy', 'Mag', 'Fire', 'Holy']),
      ]
        .filter(Boolean)
        .join(' · '),
  },
  armor: {
    endpoint: ['armors'],
    meta: (item) =>
      [
        localizedValue(item.category),
        item.weight != null ? `${t('Weight')} ${item.weight}` : '',
        formatStats(item.dmgNegation, 'amount', [
          'Phy',
          'Magic',
          'Fire',
          'Holy',
        ]),
        formatStats(item.resistance, 'amount', ['Poise']),
      ]
        .filter(Boolean)
        .join(' · '),
  },
  talismans: {
    endpoint: ['talismans'],
    meta: (item) => localizedValue(item.effect || 'Talisman'),
  },
  spells: {
    endpoint: ['sorceries', 'incantations'],
    meta: (item) =>
      [
        localizedValue(item.type),
        item.cost != null ? `${item.cost} ${t('FP')}` : '',
        item.slots != null
          ? `${item.slots} ${t(item.slots === 1 ? 'slot' : 'slots')}`
          : '',
        localizedValue(item.effects),
        formatStats(item.requires, 'amount'),
      ]
        .filter(Boolean)
        .join(' · '),
  },
  ashes: {
    endpoint: ['ashes'],
    meta: (item) =>
      [
        localizedValue(item.skill),
        item.affinity
          ? `${localizedValue(item.affinity)} ${t('Affinity')}`
          : '',
      ]
        .filter(Boolean)
        .join(' · '),
  },
  items: {
    endpoint: ['items'],
    meta: (item) =>
      [localizedValue(item.type), localizedValue(item.effect)]
        .filter(Boolean)
        .join(' · ') || t('Item'),
  },
};

const states = new Map();
const controllers = new Set();
let activePanel = null;
let rootElement = null;

function formatStats(values, valueKey, selectedNames) {
  if (!Array.isArray(values)) return '';
  return values
    .filter(
      (entry) =>
        entry &&
        entry[valueKey] != null &&
        (!selectedNames || selectedNames.includes(entry.name)),
    )
    .map((entry) => `${localizedValue(entry.name)} ${entry[valueKey]}`)
    .join(' / ');
}

function readCache(category) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(`er:database:v1:${category}`),
    );
    if (
      saved &&
      Date.now() - saved.time < CACHE_TTL &&
      Number.isInteger(saved.page) &&
      Array.isArray(saved.data)
    ) {
      return saved;
    }
  } catch (error) {
    console.warn(`Could not read the ${category} database cache.`, error);
  }
  return null;
}

function writeCache(category, state) {
  try {
    localStorage.setItem(
      `er:database:v1:${category}`,
      JSON.stringify({
        time: Date.now(),
        page: state.page,
        total: state.total,
        data: state.data,
      }),
    );
  } catch (error) {
    console.warn(`Could not save the ${category} database cache.`, error);
  }
}

function stateFor(category) {
  if (!states.has(category)) {
    const cached = readCache(category);
    states.set(
      category,
      cached
        ? { ...cached, loading: false, error: null, request: null }
        : {
            time: Date.now(),
            page: 0,
            total: 0,
            data: [],
            loading: false,
            error: null,
            request: null,
          },
    );
  }
  return states.get(category);
}

function makeApiUrl(endpoint, page) {
  const query = new URLSearchParams({
    limit: String(PAGE_SIZE),
    page: String(page),
  });
  return `${API_ROOT}/${endpoint}?${query}`;
}

async function fetchPage(category, page, signal) {
  const endpoints = CATEGORIES[category].endpoint;
  const responses = await Promise.all(
    endpoints.map(async (endpoint) => {
      const timeout = new AbortController();
      const timer = setTimeout(() => timeout.abort(), FETCH_TIMEOUT);
      const onAbort = () => timeout.abort();
      signal.addEventListener('abort', onAbort, { once: true });
      let response;
      try {
        response = await fetch(makeApiUrl(endpoint, page), {
          signal: timeout.signal,
        });
      } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', onAbort);
      }
      if (!response.ok)
        throw new Error(`${endpoint} API returned HTTP ${response.status}`);
      const result = await response.json();
      if (!result.success || !Array.isArray(result.data))
        throw new Error(`Unexpected ${endpoint} API response`);
      return result;
    }),
  );
  return {
    data: responses.flatMap((response) => response.data),
    total: responses.reduce(
      (sum, response) => sum + Number(response.total || 0),
      0,
    ),
  };
}

function createText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function detailEntries(item, category) {
  const entries = [];
  const addStats = (label, values, valueKey = 'amount') => {
    const value = formatStats(values, valueKey);
    if (value) entries.push([label, value]);
  };
  const addValue = (label, value) => {
    if (value != null && value !== '')
      entries.push([label, localizedValue(value)]);
  };

  if (category === 'weapons') {
    addStats('Attack', item.attack);
    addStats('Guard', item.defence);
    addStats('Scaling', item.scalesWith, 'scaling');
    addStats('Requirements', item.requiredAttributes);
    addValue('Weight', item.weight);
  } else if (category === 'armor') {
    addStats('Damage negation', item.dmgNegation);
    addStats('Resistance', item.resistance);
    addValue('Weight', item.weight);
  } else if (category === 'spells') {
    addValue('Type', item.type);
    addValue('FP cost', item.cost);
    addValue('Memory slots', item.slots);
    addValue('Effect', item.effects);
    addStats('Requirements', item.requires);
  } else if (category === 'talismans') {
    addValue('Effect', item.effect);
  } else if (category === 'ashes') {
    addValue('Skill', item.skill);
    addValue('Affinity', item.affinity);
  } else if (category === 'items') {
    addValue('Type', item.type);
    addValue('Effect', item.effect);
  }

  return entries;
}

function createItemCard(item, category) {
  const card = document.createElement('details');
  card.className = 'database-item';
  card.name = `database-${category}`;

  const summary = document.createElement('summary');
  summary.className = 'database-item__summary';
  const art = createText(
    'span',
    'database-item__art',
    String(item.name || '?')
      .slice(0, 1)
      .toUpperCase(),
  );
  if (typeof item.image === 'string') {
    try {
      const imageUrl = new URL(item.image);
      if (imageUrl.protocol === 'https:') {
        const fallback = art.textContent;
        const image = document.createElement('img');
        image.src = imageUrl.href;
        image.alt = '';
        image.loading = 'lazy';
        image.addEventListener(
          'error',
          () => {
            image.remove();
            art.textContent = fallback;
          },
          { once: true },
        );
        art.replaceChildren(image);
      }
    } catch (error) {
      console.warn('Skipped an invalid database image URL.', error);
    }
  }
  summary.append(art);

  const content = document.createElement('div');
  content.append(
    createText(
      'h3',
      'database-item__name',
      localizedValue(item.name || 'Unknown entry'),
    ),
  );
  content.append(
    createText(
      'p',
      'database-item__meta',
      CATEGORIES[category].meta(item) || 'Details unavailable',
    ),
  );
  const label = createText('span', 'database-item__expand', t('Details'));
  label.setAttribute('aria-hidden', 'true');
  content.append(label);
  summary.append(content);
  card.append(summary);

  const details = document.createElement('div');
  details.className = 'database-item__details';
  if (item.description) {
    details.append(
      createText(
        'p',
        'database-item__description',
        localizedValue(item.description),
      ),
    );
  }

  const entries = detailEntries(item, category);
  if (entries.length) {
    const list = document.createElement('dl');
    list.className = 'database-item__stats';
    entries.forEach(([labelText, value]) => {
      list.append(createText('dt', '', t(labelText)));
      list.append(createText('dd', '', value));
    });
    details.append(list);
  }
  if (!item.description && !entries.length) {
    details.append(
      createText(
        'p',
        'database-item__description',
        t('No additional details available.'),
      ),
    );
  }
  card.append(details);
  return card;
}

function renderCategory(panel) {
  const category = panel.dataset.dbCategory;
  const state = stateFor(category);
  const list = panel.querySelector('[data-database-items]');
  const status = panel.querySelector('[data-database-status]');
  const more = panel.querySelector('[data-database-more]');
  const typeFilter = panel.querySelector('[data-database-type-filter]');
  const selectedType = typeFilter?.value || 'all';
  if (typeFilter) {
    const categories = [
      ...new Set(
        state.data
          .map((item) => String(item.category ?? '').trim())
          .filter(Boolean),
      ),
    ].sort((a, b) =>
      localizedValue(a).localeCompare(localizedValue(b), getLang()),
    );
    const options = [createText('option', '', t('All weapon types'))];
    options[0].value = 'all';
    categories.forEach((value) => {
      const option = createText('option', '', localizedValue(value));
      option.value = value;
      options.push(option);
    });
    typeFilter.replaceChildren(...options);
    typeFilter.value = categories.includes(selectedType) ? selectedType : 'all';
  }
  const activeType = typeFilter?.value || 'all';
  const query = panel
    .querySelector('[data-database-search]')
    .value.trim()
    .toLocaleLowerCase();
  const filtered = state.data.filter((item) => {
    const meta = CATEGORIES[category].meta(item);
    return (
      (activeType === 'all' || item.category === activeType) &&
      `${item.name || ''} ${meta}`.toLocaleLowerCase().includes(query)
    );
  });

  list.replaceChildren(
    ...filtered.map((item) => createItemCard(item, category)),
  );
  if (state.error) {
    status.replaceChildren(
      document.createTextNode(`${t('Could not load catalog data.')} `),
    );
    const retry = createText('button', 'database-retry', t('Retry'));
    retry.type = 'button';
    retry.dataset.databaseRetry = '';
    status.append(retry);
  } else if (state.loading && !state.data.length) {
    status.textContent = t('Loading catalog entries…');
  } else if (
    query &&
    filtered.length === 0 &&
    state.data.length < state.total
  ) {
    status.textContent =
      getLang() === 'ru'
        ? `Среди загруженных записей нет совпадений с «${panel.querySelector('[data-database-search]').value}». Загрузите ещё, чтобы продолжить поиск.`
        : `No loaded entries match “${panel.querySelector('[data-database-search]').value}”. Load more to search further.`;
  } else if (query || activeType !== 'all') {
    status.textContent =
      getLang() === 'ru'
        ? `Найдено: ${filtered.length} среди ${state.data.length} загруженных записей.`
        : `${filtered.length} matches among ${state.data.length} loaded entries.`;
  } else if (state.data.length) {
    status.textContent =
      getLang() === 'ru'
        ? `Показано ${state.data.length} из ${state.total} записей.`
        : `Showing ${state.data.length} of ${state.total} entries.`;
  } else {
    status.textContent = '';
  }

  more.hidden = state.data.length >= state.total;
  more.disabled = state.loading;
  if (state.loading && state.data.length) more.textContent = t('Loading…');
  else
    more.textContent = `${t('Load more')} ${panel.querySelector('h2').textContent}`;
}

async function loadCategory(panel) {
  const category = panel.dataset.dbCategory;
  const state = stateFor(category);
  if (state.loading || (state.data.length >= state.total && state.page > 0))
    return;

  const controller = new AbortController();
  controllers.add(controller);
  state.loading = true;
  state.error = null;
  state.request = controller;
  renderCategory(panel);

  try {
    const nextPage = state.page + 1;
    const result = await fetchPage(category, nextPage, controller.signal);
    if (!rootElement?.isConnected) return;
    state.data.push(...result.data);
    state.total = result.total;
    state.page = nextPage;
    state.time = Date.now();
    writeCache(category, state);
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(`Failed to load ${category} database entries.`, error);
      state.error = error;
    }
  } finally {
    controllers.delete(controller);
    state.loading = false;
    state.request = null;
    if (rootElement?.isConnected) renderCategory(panel);
  }
}

function setActiveCategory(id) {
  const tabs = rootElement.querySelectorAll('.database-tabs a');
  const panels = rootElement.querySelectorAll(
    '[data-db-category], .database-map',
  );
  const panel = rootElement.querySelector(`#${CSS.escape(id)}`);
  if (!panel || ![...panels].includes(panel)) return;

  activePanel = panel;
  panels.forEach((entry) => {
    entry.hidden = entry !== panel;
  });
  tabs.forEach((tab) => {
    if (tab.hash === `#${id}`) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });

  if (panel.dataset.dbCategory) {
    const state = stateFor(panel.dataset.dbCategory);
    renderCategory(panel);
    if (!state.page || state.error) loadCategory(panel);
  }
}

function onHashChange() {
  const id = decodeURIComponent(location.hash.slice(1));
  setActiveCategory(id || 'weapons');
}

export function mount(
  root = document.querySelector('#page[data-page="database"]'),
) {
  rootElement = root;
  if (!rootElement) return;

  const onClick = (event) => {
    const tab = event.target.closest('.database-tabs a');
    if (tab && rootElement.contains(tab)) {
      event.preventDefault();
      const id = tab.hash.slice(1);
      if (location.hash !== tab.hash)
        history.pushState(history.state, '', tab.hash);
      setActiveCategory(id);
      activePanel.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
      return;
    }

    const button = event.target.closest(
      '[data-database-more], [data-database-retry]',
    );
    if (!button || !rootElement.contains(button)) return;
    const panel = button.closest('[data-db-category]');
    if (panel) loadCategory(panel);
  };
  let searchTimer;
  const onInput = (event) => {
    if (event.target.matches('[data-database-search]')) {
      const panel = event.target.closest('[data-db-category]');
      clearTimeout(searchTimer);
      if (panel) searchTimer = setTimeout(() => renderCategory(panel), 250);
    }
  };
  const onChange = (event) => {
    if (event.target.matches('[data-database-type-filter]')) {
      const panel = event.target.closest('[data-db-category]');
      if (panel) renderCategory(panel);
    }
  };
  const onLanguageChange = () => {
    if (activePanel?.dataset.dbCategory) renderCategory(activePanel);
  };

  rootElement.addEventListener('click', onClick);
  rootElement.addEventListener('input', onInput);
  rootElement.addEventListener('change', onChange);
  window.addEventListener('lang-change', onLanguageChange);
  window.addEventListener('hashchange', onHashChange);
  onHashChange();

  return () => {
    clearTimeout(searchTimer);
    rootElement.removeEventListener('click', onClick);
    rootElement.removeEventListener('input', onInput);
    rootElement.removeEventListener('change', onChange);
    window.removeEventListener('lang-change', onLanguageChange);
    window.removeEventListener('hashchange', onHashChange);
    controllers.forEach((controller) => controller.abort());
    controllers.clear();
    states.clear();
    activePanel = null;
    rootElement = null;
  };
}
