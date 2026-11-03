import {
  loadBosses,
  tierOf,
  locationKey,
  TIERS,
} from '../modules/characters.js';
import { escapeHtml, normalizeText } from '../utils/html.js';
import { t, getLang } from '../utils/i18n.js';

const PAGE_SIZE = 12;
const state = { category: 'all', tier: '', location: '', query: '', page: 0 };

let data;
let root;
let refs;
let locationOpen = false;
let locationQuery = '';
let lastResultsKey = '';
let searchTimer = 0;
let cleanups = [];

// ---------- разметка страницы (строится один раз за заход) ----------

function shell() {
  return `
    <section class="bosses">
      <div class="container">
        <header class="bosses__head">
          <p class="bosses__eyebrow" data-ref="eyebrow"></p>
          <h1 class="bosses__title" data-ref="title"></h1>
          <p class="bosses__subtitle" data-ref="subtitle"></p>
        </header>

        <nav class="bosses__categories" data-ref="categories"></nav>
        <nav class="bosses__tiers" data-ref="tiers"></nav>
        <p class="bosses__tier-note" data-ref="note"></p>

        <section class="bosses__toolbar">
          <input data-ref="search" type="search" autocomplete="off" />
          <div class="bosses__location-filter">
            <input data-ref="location" type="search" role="combobox" autocomplete="off"
              aria-autocomplete="list" aria-expanded="false" />
            <div class="bosses__location-options" data-ref="options" role="listbox" hidden></div>
          </div>
          <button type="button" data-ref="reset"></button>
          <p class="bosses__count" data-ref="count" aria-live="polite"></p>
        </section>

        <div class="bosses__message" data-ref="message" hidden></div>
        <div data-ref="results"></div>
        <nav class="pagination" data-ref="pagination"></nav>
      </div>
    </section>`;
}

// ---------- фильтрация ----------

const categoryBosses = () =>
  state.category === 'all'
    ? data.sorted
    : data.sorted.filter(
        (boss) => data.categoryOf.get(boss.id)?.id === state.category,
      );

function filter(withTier = true) {
  const words = normalizeText(state.query).split(' ').filter(Boolean);
  return categoryBosses().filter((boss) => {
    if (withTier && state.tier && tierOf(boss) !== state.tier) return false;
    if (state.location && locationKey(boss) !== state.location) return false;
    if (!words.length) return true;
    const haystack = data.searchText.get(boss.id);
    return words.every((word) => haystack.includes(word));
  });
}

const bossName = (boss) =>
  getLang() === 'ru' ? (data.ru(boss.id).name ?? boss.name_en) : boss.name_en;
const placeOf = (boss) =>
  `${boss.region ?? t('unknown')} — ${boss.location ?? t('unknown')}`;

// ---------- отрисовка кусочков ----------

function renderTexts() {
  refs.eyebrow.textContent = t('eyebrow');
  refs.title.textContent = t('title');
  refs.subtitle.textContent = t('subtitle');
  refs.note.textContent = t('difficultyNote');
  refs.search.placeholder = t('searchPlaceholder');
  refs.search.setAttribute('aria-label', t('searchPlaceholder'));
  refs.location.placeholder = t('searchLocations');
  refs.location.setAttribute('aria-label', t('searchLocations'));
  refs.reset.textContent = t('reset');
  refs.tiers.setAttribute('aria-label', t('filterDifficulty'));
  document.title = t('pageTitle');
}

function renderCategories() {
  refs.categories.innerHTML = [
    { id: 'all', label: 'catAll', bosses: data.all },
    ...data.categories,
  ]
    .map(
      (category) => `
        <button class="bosses__category${state.category === category.id ? ' is-active' : ''}"
          type="button" data-category="${category.id}" aria-pressed="${state.category === category.id}">
          <span>${escapeHtml(t(category.label))}</span>
          <span class="bosses__category-count">${category.bosses.length}</span>
        </button>`,
    )
    .join('');
}

function renderTiers() {
  const matches = filter(false);
  const counts = Object.fromEntries(TIERS.map((tier) => [tier, 0]));
  for (const boss of matches) counts[tierOf(boss)] += 1;
  const button = (tier, label, count) => `
    <button class="bosses__tier${state.tier === tier ? ' is-active' : ''}" type="button"
      data-tier-filter="${tier}" aria-pressed="${state.tier === tier}">
      <span>${escapeHtml(label)}</span><span class="bosses__tier-count">${count}</span>
    </button>`;
  refs.tiers.innerHTML =
    button('', t('allDifficulties'), matches.length) +
    TIERS.map((tier) => button(tier, tier, counts[tier])).join('');
}

function renderLocations() {
  const places = new Map();
  for (const boss of categoryBosses())
    places.set(locationKey(boss), placeOf(boss));
  if (state.location && !places.has(state.location)) state.location = '';

  refs.location.value = locationOpen
    ? locationQuery
    : (places.get(state.location) ?? '');
  refs.location.setAttribute('aria-expanded', String(locationOpen));
  refs.options.hidden = !locationOpen;
  if (!locationOpen) return;

  const query = normalizeText(locationQuery);
  const list = [...places.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .filter(([, label]) => normalizeText(label).includes(query));
  refs.options.innerHTML =
    `<button type="button" role="option" aria-selected="${!state.location}" data-location="">${escapeHtml(t('allLocations'))}</button>` +
    list
      .map(
        ([value, label]) =>
          `<button type="button" role="option" aria-selected="${state.location === value}" data-location="${escapeHtml(value)}">${escapeHtml(label)}</button>`,
      )
      .join('');
}

function cardHtml(boss) {
  const tier = tierOf(boss);
  const lang = getLang();
  const reason = data.difficulty[boss.id]?.[lang] ?? '';
  const image = boss.media?.image;
  const href = `/pages/bosses/boss.html?id=${encodeURIComponent(boss.id)}`;
  return `
    <article class="boss-entry">
      <a class="boss-entry__artwork" href="${href}" aria-label="${escapeHtml(`${t('details')}: ${bossName(boss)}`)}">
        <span class="boss-entry__placeholder" aria-hidden="true"><span class="boss-entry__placeholder-mark">✦</span></span>
        ${image ? `<img class="boss-entry__image" src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async" />` : ''}
        <span class="boss-entry__artwork-shade" aria-hidden="true"></span>
        <span class="boss-entry__tier" aria-hidden="true">${tier}</span>
        <span class="boss-entry__caption">
          <span class="boss-entry__name">${escapeHtml(bossName(boss))}</span>
          <span class="boss-entry__location">${escapeHtml(placeOf(boss))}</span>
        </span>
      </a>
      <div class="boss-entry__more">
        ${reason ? `<p class="boss-entry__reason"><strong>${escapeHtml(t('whyTier'))}:</strong> ${escapeHtml(reason)}</p>` : ''}
        <div class="boss-entry__actions">
          <button class="boss-entry__filter" type="button" data-tier-filter="${tier}">${escapeHtml(t('difficulty'))} ${tier}</button>
          <a class="boss-entry__details" href="${href}">${escapeHtml(t('details'))}</a>
        </div>
      </div>
    </article>`;
}

function renderResults(pageBosses) {
  refs.results.innerHTML = TIERS.map((tier) => {
    const group = pageBosses.filter((boss) => tierOf(boss) === tier);
    if (!group.length) return '';
    return `
      <section class="bosses__difficulty-group">
        <header class="bosses__difficulty-heading">
          <h2><span>${tier}</span> ${escapeHtml(t('difficulty'))}</h2>
          <span>${group.length}</span>
        </header>
        <div class="bosses__grid">${group.map(cardHtml).join('')}</div>
      </section>`;
  }).join('');
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    refs.pagination.replaceChildren();
    return;
  }
  const shown = new Set([0, totalPages - 1]);
  for (
    let p = Math.max(0, state.page - 1);
    p <= Math.min(totalPages - 1, state.page + 1);
    p += 1
  )
    shown.add(p);

  const parts = [
    `<button type="button" data-page="${state.page - 1}" ${state.page === 0 ? 'disabled' : ''} aria-label="${escapeHtml(t('prevPage'))}">‹</button>`,
  ];
  let previous = -1;
  for (const page of [...shown].sort((a, b) => a - b)) {
    if (previous >= 0 && page - previous > 1)
      parts.push(
        '<span class="pagination__ellipsis" aria-hidden="true">…</span>',
      );
    parts.push(
      `<button type="button" data-page="${page}" class="${page === state.page ? 'active' : ''}" ${page === state.page ? 'aria-current="page"' : ''} aria-label="${escapeHtml(t('page'))} ${page + 1}">${page + 1}</button>`,
    );
    previous = page;
  }
  parts.push(
    `<button type="button" data-page="${state.page + 1}" ${state.page === totalPages - 1 ? 'disabled' : ''} aria-label="${escapeHtml(t('nextPage'))}">›</button>`,
  );
  refs.pagination.innerHTML = parts.join('');
}

// Главная перерисовка. Список карточек пересобирается только если что-то изменилось.
function render({ force = false } = {}) {
  renderCategories();
  renderTiers();
  renderLocations();

  const filtered = filter();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  state.page = Math.min(state.page, Math.max(totalPages - 1, 0));

  refs.count.textContent = `${filtered.length} ${filtered.length === 1 ? t('boss') : t('bosses')}`;
  refs.message.hidden = filtered.length !== 0;
  refs.message.textContent = filtered.length ? '' : t('noResults');

  const key = [
    getLang(),
    state.category,
    state.tier,
    state.location,
    state.query,
    state.page,
  ].join('|');
  if (force || key !== lastResultsKey) {
    lastResultsKey = key;
    const pageBosses = filtered.slice(
      state.page * PAGE_SIZE,
      (state.page + 1) * PAGE_SIZE,
    );
    if (pageBosses.length) renderResults(pageBosses);
    else refs.results.replaceChildren();
    renderPagination(totalPages);
  }
}

// ---------- события ----------

function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  cleanups.push(() => target.removeEventListener(type, handler, options));
}

function setFilters(patch) {
  Object.assign(state, patch, { page: patch.page ?? 0 });
  render();
}

function bind() {
  on(refs.categories, 'click', (event) => {
    const button = event.target.closest('[data-category]');
    if (button)
      setFilters({ category: button.dataset.category, location: '', tier: '' });
  });

  const tierClick = (event) => {
    const button = event.target.closest('[data-tier-filter]');
    if (button) setFilters({ tier: button.dataset.tierFilter });
  };
  on(refs.tiers, 'click', tierClick);
  on(refs.results, 'click', tierClick);

  // поиск с небольшой задержкой, чтобы не перерисовывать на каждую букву
  on(refs.search, 'input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
      () => setFilters({ query: refs.search.value }),
      120,
    );
  });

  on(refs.location, 'focus', () => {
    locationOpen = true;
    locationQuery = '';
    renderLocations();
  });
  on(refs.location, 'input', () => {
    locationOpen = true;
    locationQuery = refs.location.value;
    renderLocations();
  });
  on(refs.location, 'keydown', (event) => {
    if (event.key !== 'Escape') return;
    locationOpen = false;
    renderLocations();
    refs.location.blur();
  });
  on(refs.options, 'click', (event) => {
    const option = event.target.closest('[data-location]');
    if (!option) return;
    locationOpen = false;
    locationQuery = '';
    setFilters({ location: option.dataset.location });
  });
  on(document, 'pointerdown', (event) => {
    if (!locationOpen || event.target.closest('.bosses__location-filter'))
      return;
    locationOpen = false;
    renderLocations();
  });

  on(refs.reset, 'click', () => {
    locationOpen = false;
    refs.search.value = '';
    setFilters({ query: '', location: '', tier: '' });
  });

  on(refs.pagination, 'click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    setFilters({ page: Number(button.dataset.page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // картинка не нашлась — остаётся красивая заглушка
  on(
    refs.results,
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) event.target.hidden = true;
    },
    true,
  );

  on(window, 'lang-change', () => {
    renderTexts();
    render({ force: true });
  });
}

// ---------- вход / выход ----------

export async function mount(container) {
  data = await loadBosses();
  root = container;
  root.innerHTML = shell();
  refs = Object.fromEntries(
    [...root.querySelectorAll('[data-ref]')].map((el) => [el.dataset.ref, el]),
  );
  locationOpen = false;
  lastResultsKey = '';
  refs.search.value = state.query;

  renderTexts();
  bind();
  render({ force: true });
}

export function unmount() {
  clearTimeout(searchTimer);
  cleanups.forEach((off) => off());
  cleanups = [];
  root = refs = undefined;
}

// ---------- запуск ----------
const pageRoot = document.querySelector('#boss-root');
const loader = document.querySelector('#page-loader');

async function start() {
  try {
    await mount(pageRoot);
  } catch (error) {
    console.error(error);
    pageRoot.innerHTML = `<section class="bosses"><div class="container">
      <p class="bosses__message">${escapeHtml(t('loadError'))}</p>
      <p class="bosses__message"><button type="button" class="bosses__retry" onclick="location.reload()">${escapeHtml(t('retry'))}</button></p>
    </div></section>`;
  } finally {
    requestAnimationFrame(() => loader?.classList.add('is-hidden'));
  }
}

if (pageRoot) start();
