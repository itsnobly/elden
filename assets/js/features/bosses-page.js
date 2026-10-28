import { escapeHtml, normalizeText } from '../utils/html.js';

const loader = document.querySelector('#page-loader');
const loaderImage = document.querySelector('.page-loader__bonfire');
const loaderAnimationReady = loaderImage.decode().catch((error) => {
  console.warn('Bonfire loading animation could not be decoded.', error);
  loader.classList.add('page-loader--no-animation');
});

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
  }
  return response.json();
}

let data;
try {
  data = await Promise.all([
    loadJson('/data/main.json'),
    loadJson('/data/dlc.json'),
    loadJson('/data/optional.json'),
    loadJson('/data/ru.json'),
    loadJson('/data/items.json'),
    loadJson('/data/difficulty.json'),
    loaderAnimationReady,
  ]);
  if (
    !Array.isArray(data[0]) ||
    !Array.isArray(data[1]) ||
    !Array.isArray(data[2]) ||
    !data[3]?.bosses ||
    !data[3]?.items ||
    !Array.isArray(data[4]) ||
    !data[5] ||
    typeof data[5] !== 'object'
  ) {
    throw new Error('Boss data has an unexpected structure.');
  }
} catch (error) {
  console.error('Unable to initialize the boss page.', error);
  loader.classList.add('page-loader--error');
  loader.innerHTML = '';
  const message = document.createElement('p');
  message.textContent = 'Could not load boss data. Check the local server and try again.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.addEventListener('click', () => window.location.reload());
  loader.append(message, retry);
}

if (data) {
const [mainBosses, dlcBosses, optionalBosses, locale, items, difficulty] = data;
const PAGE_SIZE = 12;
const tiers = ['S', 'A', 'B', 'C'];
const categories = [
  { id: 'all', labels: { en: 'All bosses', ru: 'Все боссы' }, bosses: [...mainBosses, ...dlcBosses, ...optionalBosses] },
  { id: 'main', labels: { en: 'Main story', ru: 'Основные боссы' }, bosses: mainBosses },
  { id: 'dlc', labels: { en: 'Shadow of the Erdtree', ru: 'Тень Древа Эрд' }, bosses: dlcBosses },
  { id: 'optional', labels: { en: 'Optional', ru: 'Опциональные' }, bosses: optionalBosses },
];
const categoryByBossId = new Map(
  categories.slice(1).flatMap((category) =>
    category.bosses.map((boss) => [boss.id, category.labels]),
  ),
);
const itemById = new Map(items.map((item) => [item.item_id, item]));
const state = { category: 'all', location: '', locationQuery: '', locationOpen: false, tier: '', query: '', page: 0, language: 'en', selectedBossId: null };
const categoryNav = document.querySelector('#boss-categories');
const tierNav = document.querySelector('#boss-tiers');
const searchInput = document.querySelector('#boss-search');
const locationInput = document.querySelector('#boss-location');
const locationOptions = document.querySelector('#boss-locations');
const resetButton = document.querySelector('#boss-reset');
const count = document.querySelector('#boss-count');
const message = document.querySelector('#boss-message');
const results = document.querySelector('#boss-results');
const pagination = document.querySelector('#boss-pagination');
const modal = document.querySelector('#boss-modal');
const modalBody = document.querySelector('#boss-modal-body');
const modalMedia = document.querySelector('.boss-modal__media');

const copy = {
  en: {
    allLocations: 'All locations',
    searchLocations: 'Search locations...',
    allDifficulties: 'All difficulties',
    difficultyNote: 'Difficulty ranks are editorial estimates for this curated selection.',
    filterDifficulty: 'Filter by difficulty',
    whyTier: 'Why this rank',
    searchPlaceholder: 'Search bosses, regions, rewards...',
    reset: 'Reset',
    noResults: 'No bosses match these filters.',
    boss: 'boss',
    bosses: 'bosses',
    difficulty: 'Difficulty',
    details: 'Details',
    category: 'Category',
    region: 'Region',
    location: 'Location',
    unknown: 'Unknown',
    notConfirmed: 'Not confirmed',
    tier: 'Difficulty',
    weakTo: 'Weak to',
    phases: 'Phases',
    strategy: 'Strategy',
    attacks: 'Attacks',
    tips: 'Tips',
    rewards: 'Rewards',
    main: 'Main story',
    artwork: 'artwork placeholder',
    footer: 'Elden Ring Boss Compendium',
    eyebrow: 'The Lands Between & the Land of Shadow',
    subtitle: 'A curated selection of encounters ranked by difficulty and grouped by location.',
  },
  ru: {
    allLocations: 'Все локации',
    searchLocations: 'Поиск локаций...',
    allDifficulties: 'Все уровни сложности',
    difficultyNote: 'Ранги сложности — редакционная оценка этой подборки.',
    filterDifficulty: 'Фильтр по сложности',
    whyTier: 'Почему этот ранг',
    searchPlaceholder: 'Поиск боссов, регионов и наград...',
    reset: 'Сбросить',
    noResults: 'По заданным фильтрам боссов не найдено.',
    boss: 'босс',
    bosses: 'боссов',
    difficulty: 'Сложность',
    details: 'Подробнее',
    category: 'Категория',
    region: 'Регион',
    location: 'Место',
    unknown: 'Неизвестно',
    notConfirmed: 'Нет данных',
    tier: 'Сложность',
    weakTo: 'Уязвимость',
    phases: 'Фазы',
    strategy: 'Тактика',
    attacks: 'Атаки',
    tips: 'Советы',
    rewards: 'Награды',
    main: 'Основные боссы',
    artwork: 'изображение босса',
    footer: 'Бестиарий Elden Ring',
    eyebrow: 'Междуземье и Земля Теней',
    subtitle: 'Подборка боссов по уровню сложности и месту встречи.',
  },
};

function text(key) {
  return copy[state.language][key];
}

function getBossName(boss) {
  return state.language === 'ru'
    ? getLocalizedBoss(boss).name_ru ?? boss.name_en
    : boss.name_en;
}

function getTierName(tier) {
  if (!tier) return '—';
  return tier.toLowerCase() === 'impossible' ? 'S' : tier.toUpperCase();
}

function getLocalizedBoss(boss) {
  return locale.bosses[boss.id] ?? {};
}

function getCategoryBosses() {
  return categories.find((category) => category.id === state.category)?.bosses ?? [];
}

function updateLocationOptions(bosses) {
  const locations = new Map();
  for (const boss of bosses) {
    const key = `${boss.region ?? ''}|||${boss.location ?? ''}`;
    locations.set(key, `${boss.region || text('unknown')} — ${boss.location || text('unknown')}`);
  }

  const sortedLocations = [...locations.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  if (state.location && !locations.has(state.location)) {
    state.location = '';
  }
  locationInput.value = state.locationOpen
    ? state.locationQuery
    : locations.get(state.location) ?? '';
  locationInput.placeholder = text('searchLocations');
  locationInput.setAttribute('aria-expanded', String(state.locationOpen));
  locationOptions.hidden = !state.locationOpen;
  if (!state.locationOpen) return;

  const query = normalizeText(state.locationQuery);
  const matchingLocations = sortedLocations.filter(([, label]) => normalizeText(label).includes(query));
  locationOptions.innerHTML = `
    <button type="button" role="option" aria-selected="${!state.location}" data-location="">${escapeHtml(text('allLocations'))}</button>
    ${matchingLocations.map(([value, label]) => `
      <button type="button" role="option" aria-selected="${state.location === value}" data-location="${escapeHtml(value)}">${escapeHtml(label)}</button>
    `).join('')}
  `;
}

function filterBosses(includeTier = true) {
  const query = normalizeText(state.query);
  return getCategoryBosses()
    .filter((boss) => {
      if (includeTier && state.tier && getTierName(boss.tier) !== state.tier) return false;
      if (state.location && `${boss.region ?? ''}|||${boss.location ?? ''}` !== state.location) {
        return false;
      }

      if (!query) return true;
      const localized = getLocalizedBoss(boss);
      const rewardNames = (boss.rewards ?? []).flatMap((reward) => {
        const item = itemById.get(reward.item_id);
        const translation = locale.items[reward.item_id];
        return [item?.name_en, translation?.name_ru, reward.item_id];
      });
      const searchableText = normalizeText([
        boss.name_en,
        localized.name_ru,
        boss.region,
        boss.location,
        localized.text?.short,
        localized.text?.description,
        ...rewardNames,
      ].join(' '));
      return query.split(' ').every((word) => searchableText.includes(word));
    })
    .sort((a, b) => {
      const tierDifference = tiers.indexOf(getTierName(a.tier)) - tiers.indexOf(getTierName(b.tier));
      if (tierDifference !== 0) return tierDifference;
      return `${a.region ?? ''} ${a.location ?? ''} ${a.name_en}`.localeCompare(
        `${b.region ?? ''} ${b.location ?? ''} ${b.name_en}`,
      );
    });
}

function renderCategories() {
  categoryNav.innerHTML = categories
    .map(
      (category) => `
        <button
          class="bosses__category${state.category === category.id ? ' is-active' : ''}"
          type="button"
          data-category="${category.id}"
          aria-pressed="${state.category === category.id}"
        >
          <span>${escapeHtml(category.labels[state.language])}</span>
          <span class="bosses__category-count">${category.bosses.length}</span>
        </button>
      `,
    )
    .join('');
}

function renderTiers() {
  const matches = filterBosses(false);
  tierNav.setAttribute('aria-label', text('filterDifficulty'));
  document.querySelector('#boss-tier-note').textContent = text('difficultyNote');
  tierNav.innerHTML = `
    <button class="bosses__tier${state.tier ? '' : ' is-active'}" type="button" data-tier-filter="" aria-pressed="${!state.tier}">
      <span>${escapeHtml(text('allDifficulties'))}</span>
      <span class="bosses__tier-count">${matches.length}</span>
    </button>
    ${tiers.map((tier) => {
      const total = matches.filter((boss) => getTierName(boss.tier) === tier).length;
      return `
        <button class="bosses__tier${state.tier === tier ? ' is-active' : ''}" type="button" data-tier-filter="${tier}" aria-pressed="${state.tier === tier}">
          <span>${tier}</span>
          <span class="bosses__tier-count">${total}</span>
        </button>
      `;
    }).join('')}
  `;
}

function renderDifficultyGroups(bosses) {
  results.innerHTML = tiers
    .map((tier) => {
      const tierBosses = bosses.filter((boss) => getTierName(boss.tier) === tier);
      if (!tierBosses.length) return '';
      return `
        <section class="bosses__difficulty-group" aria-labelledby="boss-tier-${tier}">
          <header class="bosses__difficulty-heading">
            <h2 id="boss-tier-${tier}"><span>${tier}</span> ${escapeHtml(text('difficulty'))}</h2>
            <span>${tierBosses.length}</span>
          </header>
          <div class="bosses__grid">
            ${tierBosses.map((boss) => {
              const rationale = difficulty[boss.id]?.[state.language] ?? '';
              const location = `${boss.region ?? text('unknown')} — ${boss.location ?? text('unknown')}`;
              const image = boss.media?.image;
              return `
                <article class="boss-entry">
                  <button class="boss-entry__artwork" type="button" data-open-boss="${escapeHtml(boss.id)}" aria-label="${escapeHtml(`${text('details')}: ${getBossName(boss)}`)}">
                    <span class="boss-entry__placeholder" aria-hidden="true">
                      <span class="boss-entry__placeholder-mark">✦</span>
                    </span>
                    ${image ? `<img class="boss-entry__image" src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async" />` : ''}
                    <span class="boss-entry__artwork-shade" aria-hidden="true"></span>
                    <span class="boss-entry__tier" aria-hidden="true">${tier}</span>
                    <span class="boss-entry__caption">
                      <span class="boss-entry__name">${escapeHtml(getBossName(boss))}</span>
                      <span class="boss-entry__location">${escapeHtml(location)}</span>
                    </span>
                  </button>
                  <div class="boss-entry__more">
                    <p class="boss-entry__reason"><strong>${escapeHtml(text('whyTier'))}</strong>${escapeHtml(rationale ? `: ${rationale}` : '')}</p>
                    <div class="boss-entry__actions">
                      <button class="boss-entry__filter" type="button" data-tier-filter="${tier}">${escapeHtml(text('difficulty'))} ${tier}</button>
                      <button class="boss-entry__details" type="button" data-open-boss="${escapeHtml(boss.id)}">${escapeHtml(text('details'))}</button>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </section>
      `;
    })
    .join('');
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.replaceChildren();
    return;
  }

  const visiblePages = new Set([0, totalPages - 1]);
  for (let page = Math.max(0, state.page - 1); page <= Math.min(totalPages - 1, state.page + 1); page += 1) {
    visiblePages.add(page);
  }

  const buttons = [
    `<button type="button" data-page="${state.page - 1}" ${state.page === 0 ? 'disabled' : ''} aria-label="Previous page">‹</button>`,
  ];
  let previousPage = -1;
  for (const page of [...visiblePages].sort((a, b) => a - b)) {
    if (previousPage >= 0 && page - previousPage > 1) {
      buttons.push('<span class="pagination__ellipsis" aria-hidden="true">…</span>');
    }
    buttons.push(`
      <button
        type="button"
        data-page="${page}"
        class="${page === state.page ? 'active' : ''}"
        ${page === state.page ? 'aria-current="page"' : ''}
        aria-label="Page ${page + 1}"
      >${page + 1}</button>
    `);
    previousPage = page;
  }
  buttons.push(`<button type="button" data-page="${state.page + 1}" ${state.page === totalPages - 1 ? 'disabled' : ''} aria-label="Next page">›</button>`);
  pagination.innerHTML = buttons.join('');
}

function render() {
  const categoryBosses = getCategoryBosses();
  updateLocationOptions(categoryBosses);
  renderCategories();
  renderTiers();

  const filtered = filterBosses();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  state.page = Math.min(state.page, Math.max(totalPages - 1, 0));
  const pageBosses = filtered.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);

  count.textContent = `${filtered.length} ${filtered.length === 1 ? text('boss') : text('bosses')}`;
  message.hidden = filtered.length !== 0;
  message.textContent = filtered.length ? '' : text('noResults');

  if (pageBosses.length) renderDifficultyGroups(pageBosses);
  else results.replaceChildren();
  renderPagination(totalPages);
}

function renderBossDetails(boss) {
  const localized = getLocalizedBoss(boss);
  const rewards = (boss.rewards ?? []).map((reward) => {
    const item = itemById.get(reward.item_id);
    const itemName = state.language === 'ru'
      ? locale.items[reward.item_id]?.name_ru ?? item?.name_en ?? reward.item_id
      : item?.name_en ?? reward.item_id;
    return `<li>${escapeHtml(itemName)} <span>(${escapeHtml(item?.type ?? reward.type ?? 'item')})</span></li>`;
  });
  const phases = (boss.phases ?? []).map((phase, index) => {
    const translated = localized.phases?.[index] ?? {};
    return `
      <li>
        <h4>${escapeHtml(state.language === 'ru' ? `Фаза ${phase.phase}` : phase.title_en ?? `Phase ${phase.phase}`)}</h4>
        ${state.language === 'ru' && translated.mechanics ? `<p>${escapeHtml(translated.mechanics)}</p>` : ''}
        ${state.language === 'ru' && translated.tactics ? `<p><strong>${escapeHtml(text('strategy'))}:</strong> ${escapeHtml(translated.tactics)}</p>` : ''}
        ${phase.key_attacks?.length ? `<p><strong>${escapeHtml(text('attacks'))}:</strong> ${phase.key_attacks.map(escapeHtml).join(', ')}</p>` : ''}
      </li>
    `;
  });
  const difficultyReason = difficulty[boss.id]?.[state.language] ?? '';

  modalMedia.setAttribute('aria-label', `${getBossName(boss)} ${text('artwork')}`);
  modalBody.innerHTML = `
    <h2 class="boss-modal__title" id="boss-modal-title">${escapeHtml(getBossName(boss))}</h2>
    <dl class="boss-modal__facts">
      <div><dt>${escapeHtml(text('category'))}</dt><dd>${escapeHtml(categoryByBossId.get(boss.id)?.[state.language] ?? text('main'))}</dd></div>
      <div><dt>${escapeHtml(text('region'))}</dt><dd>${escapeHtml(boss.region ?? text('unknown'))}</dd></div>
      <div><dt>${escapeHtml(text('location'))}</dt><dd>${escapeHtml(boss.location ?? text('unknown'))}</dd></div>
      <div><dt>HP</dt><dd>${boss.hp == null ? escapeHtml(text('notConfirmed')) : escapeHtml(boss.hp.toLocaleString())}</dd></div>
      <div><dt>${escapeHtml(text('tier'))}</dt><dd>${escapeHtml(getTierName(boss.tier))}</dd></div>
      <div><dt>${escapeHtml(text('weakTo'))}</dt><dd>${escapeHtml((boss.stats?.weakness ?? []).join(', ') || text('unknown'))}</dd></div>
    </dl>
    ${difficultyReason ? `<p class="boss-modal__difficulty-reason"><strong>${escapeHtml(text('whyTier'))}:</strong> ${escapeHtml(difficultyReason)}</p>` : ''}
    ${state.language === 'ru' && localized.text?.description ? `<p>${escapeHtml(localized.text.description)}</p>` : ''}
    ${state.language === 'ru' && localized.text?.lore ? `<p class="boss-modal__lore">${escapeHtml(localized.text.lore)}</p>` : ''}
    ${phases.length ? `<h3>${escapeHtml(text('phases'))}</h3><ol class="boss-modal__phases">${phases.join('')}</ol>` : ''}
    ${state.language === 'ru' && localized.tips?.length ? `<h3>${escapeHtml(text('tips'))}</h3><ul class="boss-modal__list">${localized.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>` : ''}
    ${rewards.length ? `<h3>${escapeHtml(text('rewards'))}</h3><ul class="boss-modal__list">${rewards.join('')}</ul>` : ''}
  `;
  state.selectedBossId = boss.id;
  if (!modal.open) modal.showModal();
}

function setLanguage(language) {
  if (language !== 'en' && language !== 'ru') {
    throw new TypeError(`Unsupported boss page language: ${language}`);
  }
  state.language = language;
  document.documentElement.lang = language;
  document.title = language === 'ru' ? 'Боссы — Elden Ring' : 'Bosses — Elden Ring';
  document.querySelector('#boss-page-eyebrow').textContent = text('eyebrow');
  document.querySelector('#boss-page-title').textContent = language === 'ru' ? 'Боссы' : 'Bosses';
  document.querySelector('#boss-page-subtitle').textContent = text('subtitle');
  document.querySelector('#boss-search').placeholder = text('searchPlaceholder');
  document.querySelector('#boss-reset').textContent = text('reset');
  document.querySelector('#boss-contact-button').textContent = language === 'ru' ? 'Контакты' : 'Contact';
  document.querySelector('.footer .container').textContent = text('footer');
  render();
  if (state.selectedBossId) {
    const selectedBoss = categories[0].bosses.find((boss) => boss.id === state.selectedBossId);
    if (selectedBoss && modal.open) renderBossDetails(selectedBoss);
  }
}

window.setBossPageLanguage = setLanguage;
window.addEventListener('boss-language-change', (event) => {
  setLanguage(event.detail?.language);
});

categoryNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  state.location = '';
  state.tier = '';
  state.page = 0;
  render();
});

tierNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-tier-filter]');
  if (!button) return;
  state.tier = button.dataset.tierFilter;
  state.page = 0;
  render();
});

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  state.page = 0;
  render();
});

locationInput.addEventListener('focus', () => {
  state.locationOpen = true;
  state.locationQuery = '';
  render();
});

locationInput.addEventListener('input', () => {
  state.locationOpen = true;
  state.locationQuery = locationInput.value;
  render();
});

locationInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    state.locationOpen = false;
    state.locationQuery = '';
    render();
    locationInput.blur();
  }
});

locationOptions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-location]');
  if (!option) return;
  state.location = option.dataset.location;
  state.locationQuery = '';
  state.locationOpen = false;
  state.page = 0;
  render();
});

document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.bosses__location-filter')) return;
  if (!state.locationOpen) return;
  state.locationOpen = false;
  state.locationQuery = '';
  render();
});

resetButton.addEventListener('click', () => {
  state.query = '';
  state.location = '';
  state.locationQuery = '';
  state.locationOpen = false;
  state.tier = '';
  state.page = 0;
  searchInput.value = '';
  render();
});

pagination.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

results.addEventListener('click', (event) => {
  const tierButton = event.target.closest('[data-tier-filter]');
  if (tierButton) {
    state.tier = tierButton.dataset.tierFilter;
    state.page = 0;
    render();
    return;
  }
  const button = event.target.closest('[data-open-boss]');
  if (!button) return;
  const boss = categories.flatMap((category) => category.bosses).find((entry) => entry.id === button.dataset.openBoss);
  if (boss) renderBossDetails(boss);
});

results.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.matches('.boss-entry__image')) return;
  image.hidden = true;
}, true);

document.querySelector('[data-close-modal]').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => {
  state.selectedBossId = null;
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
render();
window.requestAnimationFrame(() => loader.classList.add('is-hidden'));
}