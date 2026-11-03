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
  ru: {
    pageTitle: 'Боссы — Elden Ring',
    eyebrow: 'Междуземье и Земля Теней',
    title: 'Боссы',
    subtitle: 'Подборка боссов по уровню сложности и месту встречи.',
    catAll: 'Все боссы',
    catMain: 'Основные боссы',
    catDlc: 'Тень Древа Эрд',
    catOptional: 'Опциональные',
    allDifficulties: 'Все уровни сложности',
    difficultyNote: 'Ранги сложности — редакционная оценка этой подборки.',
    filterDifficulty: 'Фильтр по сложности',
    searchPlaceholder: 'Поиск боссов, регионов и наград...',
    searchLocations: 'Поиск локаций...',
    allLocations: 'Все локации',
    reset: 'Сбросить',
    noResults: 'По заданным фильтрам боссов не найдено.',
    boss: 'босс',
    bosses: 'боссов',
    difficulty: 'Сложность',
    whyTier: 'Почему этот ранг',
    details: 'Подробнее',
    unknown: 'Неизвестно',
    notConfirmed: 'Нет данных',
    region: 'Регион',
    location: 'Место',
    category: 'Категория',
    weakTo: 'Уязвимость',
    immune: 'Сопротивление',
    parry: 'Парирование',
    yes: 'Да',
    no: 'Нет',
    optional: 'Необязательный',
    phases: 'Фазы',
    phase: 'Фаза',
    strategy: 'Тактика',
    attacks: 'Атаки',
    tips: 'Советы',
    rewards: 'Награды',
    lore: 'История',
    cutscene: 'Катсцена',
    playVideo: 'Смотреть видео',
    back: '← Все боссы',
    prev: '← Назад',
    next: 'Дальше →',
    notFound: 'Босс не найден.',
    loadError:
      'Не удалось загрузить данные боссов. Проверь сервер и попробуй снова.',
    retry: 'Повторить',
    soon: 'Эта страница скоро появится.',
    footer: 'Бестиарий Elden Ring',
    prevPage: 'Предыдущая страница',
    nextPage: 'Следующая страница',
    page: 'Страница',
  },
};

// Значения из stats.weakness / stats.immunity в читаемом виде
const STATS = {
  physical: ['Physical', 'Физический'],
  slash: ['Slash', 'Рубящий'],
  strike: ['Strike', 'Дробящий'],
  pierce: ['Pierce', 'Колющий'],
  fire: ['Fire', 'Огонь'],
  lightning: ['Lightning', 'Молния'],
  magic: ['Magic', 'Магия'],
  holy: ['Holy', 'Святой'],
  bleed: ['Bleed', 'Кровотечение'],
  frostbite: ['Frostbite', 'Обморожение'],
  scarlet_rot: ['Scarlet Rot', 'Алая гниль'],
  poison: ['Poison', 'Яд'],
  sleep: ['Sleep', 'Сон'],
  stagger: ['Stagger', 'Пошатывание'],
  left_ankle: ['Left ankle', 'Левая лодыжка'],
  serpent_hunter_spear: ['Serpent-Hunter', 'Копьё Змееборца'],
  blasphemous_claw: ['Blasphemous Claw', 'Богохульный коготь'],
  shackle_mohg: ['Shackle (Mohg)', 'Оковы (Мог)'],
  bleed_resistant: ['Bleed resistant', 'Стойкость к кровотечению'],
  magic_resistant: ['Magic resistant', 'Стойкость к магии'],
  holy_resistant: ['Holy resistant', 'Стойкость к святому'],
  parry_limited: ['Limited parry', 'Парирование ограничено'],
  magic_80_percent_resist: ['Magic 80% resist', 'Сопротивление магии 80%'],
};

export const getLang = () => lang;
export const t = (key) => DICT[lang][key] ?? DICT.en[key] ?? key;

// Неизвестное значение показываем как есть: "some_value" -> "some value"
export function statLabel(value) {
  const known = STATS[value];
  if (known) return known[lang === 'ru' ? 1 : 0];
  return String(value).replaceAll('_', ' ');
}

export function setLang(next) {
  if (next !== 'en' && next !== 'ru') return;
  if (next === lang) return;
  lang = next;
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
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lang]');
    if (button) setLang(button.dataset.lang);
  });
}
