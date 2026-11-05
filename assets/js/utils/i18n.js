/*
 * i18n.js — язык интерфейса боссов (ru / en).
 * Язык хранится в localStorage ('er:lang'), по умолчанию английский, как весь сайт.
 * Общий переключатель языка сайта должен вызывать setLang('ru' | 'en').
 * При смене языка шлётся событие 'lang-change' — страницы перерисовываются.
 */
const KEY = 'er:lang';
let lang = 'en';
try {
  const saved = localStorage.getItem(KEY);
  if (saved === 'en' || saved === 'ru') lang = saved;
} catch {
  /* localStorage может быть недоступен — не страшно */
}

const DICT = {
  en: {
    pageTitle: 'Bosses — Elden Ring',
    eyebrow: 'The Lands Between & the Land of Shadow',
    title: 'Bosses',
    subtitle:
      'A curated selection of encounters ranked by difficulty and grouped by location.',
    catAll: 'All bosses',
    catMain: 'Main story',
    catDlc: 'Shadow of the Erdtree',
    catOptional: 'Optional',
    allDifficulties: 'All difficulties',
    difficultyNote:
      'Difficulty ranks are editorial estimates for this curated selection.',
    filterDifficulty: 'Filter by difficulty',
    searchPlaceholder: 'Search bosses, regions, rewards...',
    searchLocations: 'Search locations...',
    allLocations: 'All locations',
    reset: 'Reset',
    noResults: 'No bosses match these filters.',
    boss: 'boss',
    bosses: 'bosses',
    difficulty: 'Difficulty',
    whyTier: 'Why this rank',
    hardestBoss: 'Hardest boss',
    details: 'Details',
    unknown: 'Unknown',
    notConfirmed: 'Not confirmed',
    region: 'Region',
    location: 'Location',
    category: 'Category',
    weakTo: 'Weak to',
    immune: 'Resists',
    parry: 'Parry',
    yes: 'Yes',
    no: 'No',
    optional: 'Optional',
    phases: 'Phases',
    phase: 'Phase',
    strategy: 'Strategy',
    attacks: 'Attacks',
    tips: 'Tips',
    rewards: 'Rewards',
    lore: 'Lore',
    cutscene: 'Cutscene',
    playVideo: 'Play video',
    back: '← All bosses',
    prev: '← Previous',
    next: 'Next →',
    notFound: 'Boss not found.',
    loadError: 'Could not load boss data. Check the server and try again.',
    retry: 'Retry',
    soon: 'This page is coming soon.',
    footer: 'Elden Ring Boss Compendium',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    page: 'Page',
  },
};

// Русские словари грузятся только когда выбран ru
let RU = { DICT_RU: {}, STATS_RU: {}, SITE_RU: new Map() };
let ruPromise = null;

function loadRu() {
  ruPromise ??= import('./i18n-ru.js').then((m) => {
    RU = {
      DICT_RU: m.DICT_RU,
      STATS_RU: m.STATS_RU,
      SITE_RU: new Map(
        Object.entries(m.SITE_RU).map(([key, value]) => [
          key.replace(/[’‘]/g, "'"),
          value,
        ]),
      ),
    };
  });
  return ruPromise;
}

export const i18nReady = lang === 'ru' ? loadRu() : Promise.resolve();
if (lang === 'ru') {
  i18nReady.then(() => {
    translateSite();
    window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang } }));
  });
}

const STATS_EN = {
  physical: 'Physical',
  slash: 'Slash',
  strike: 'Strike',
  pierce: 'Pierce',
  fire: 'Fire',
  lightning: 'Lightning',
  magic: 'Magic',
  holy: 'Holy',
  bleed: 'Bleed',
  frostbite: 'Frostbite',
  scarlet_rot: 'Scarlet Rot',
  poison: 'Poison',
  sleep: 'Sleep',
  stagger: 'Stagger',
  left_ankle: 'Left ankle',
  serpent_hunter_spear: 'Serpent-Hunter',
  blasphemous_claw: 'Blasphemous Claw',
  shackle_mohg: 'Shackle (Mohg)',
  bleed_resistant: 'Bleed resistant',
  magic_resistant: 'Magic resistant',
  holy_resistant: 'Holy resistant',
  parry_limited: 'Limited parry',
  magic_80_percent_resist: 'Magic 80% resist',
};

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
let localizationObserver;
let switchBound = false;

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function translateValue(value) {
  if (lang !== 'ru') return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const normalized = normalizeText(value).replace(/[’‘]/g, "'");
  const translated = RU.SITE_RU.get(normalized);
  return translated ? `${leading}${translated}${trailing}` : value;
}

function translateTextNode(node) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue);
  const source = originalText.get(node);
  const translated = lang === 'ru' ? translateValue(source) : source;
  if (node.nodeValue !== translated) node.nodeValue = translated;
}

function translateSite(root = document.documentElement) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    if (
      !root.parentElement?.closest(
        'script, style, noscript, [data-no-translate]',
      )
    )
      translateTextNode(root);
  } else if (
    root.nodeType === Node.ELEMENT_NODE ||
    root.nodeType === Node.DOCUMENT_NODE ||
    root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  ) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest(
          'script, style, noscript, [data-no-translate]',
        )
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  const elements =
    typeof root.querySelectorAll === 'function'
      ? root.nodeType === Node.ELEMENT_NODE
        ? [root, ...root.querySelectorAll('*')]
        : [...root.querySelectorAll('*')]
      : [];
  elements.forEach((element) => {
    for (const name of ['placeholder', 'aria-label', 'title']) {
      if (!element.hasAttribute(name)) continue;
      let saved = originalAttributes.get(element);
      if (!saved) {
        saved = new Map();
        originalAttributes.set(element, saved);
      }
      if (!saved.has(name)) saved.set(name, element.getAttribute(name));
      const source = saved.get(name);
      const translated = lang === 'ru' ? translateValue(source) : source;
      if (element.getAttribute(name) !== translated)
        element.setAttribute(name, translated);
    }
  });
}

function syncLangSwitch(root = document) {
  root.querySelectorAll?.('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function initSiteLocalization() {
  bindLangSwitch(document);
  translateSite(document.documentElement);
  syncLangSwitch();
  window.addEventListener('lang-change', () => {
    translateSite();
    syncLangSwitch();
  });
  localizationObserver?.disconnect();
  localizationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE ||
          node.nodeType === Node.TEXT_NODE
        )
          translateSite(node);
      });
    });
    syncLangSwitch();
  });
  localizationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export const getLang = () => lang;
export const t = (key) =>
  (lang === 'ru' ? RU.DICT_RU[key] : null) ??
  DICT.en[key] ??
  (lang === 'ru' ? RU.SITE_RU.get(key) : null) ??
  key;

// Неизвестное значение показываем как есть: "some_value" -> "some value"
export function statLabel(value) {
  const known = lang === 'ru' ? RU.STATS_RU[value] : STATS_EN[value];
  if (known) return known;
  return String(value).replaceAll('_', ' ');
}

export async function setLang(next) {
  if (next !== 'en' && next !== 'ru') return;
  if (next === lang) return;
  lang = next;
  if (next === 'ru') await loadRu();
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ничего */
  }
  document.documentElement.lang = next;
  window.dispatchEvent(
    new CustomEvent('lang-change', { detail: { lang: next } }),
  );
}

document.documentElement.lang = lang;

// Переключатель RU / EN. Разметка; клики ловит bindLangSwitch.
export function langSwitchHtml() {
  const btn = (code) =>
    `<button type="button" class="lang-switch__btn${lang === code ? ' is-active' : ''}" data-lang="${code}" aria-pressed="${lang === code}">${code.toUpperCase()}</button>`;
  return `<div class="lang-switch" role="group" aria-label="Language">${btn('ru')}${btn('en')}</div>`;
}

export function bindLangSwitch(root) {
  if (!root || switchBound) return;
  switchBound = true;
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lang]');
    if (button) setLang(button.dataset.lang);
  });
  window.addEventListener('lang-change', () => syncLangSwitch(root));
  syncLangSwitch(root);
}
