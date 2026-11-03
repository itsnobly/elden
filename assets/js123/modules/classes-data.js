/*
 * classes-data.js — классы Elden Ring.
 * Статы, картинки и английские описания берутся из API (fanapis).
 * Русские названия и описания — ниже, в RU. Ответ API кладётся в localStorage
 * на 7 дней, поэтому повторные заходы мгновенные и работают без API.
 */
import { getLang } from '../utils/i18n.js';

const API_URL = 'https://eldenring.fanapis.com/api/classes?limit=20';
const CACHE_KEY = 'er:classes:v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// Порядок, как в игре; незнакомые классы идут в конец
const ORDER = ['vagabond', 'warrior', 'hero', 'bandit', 'astrologer', 'prophet', 'confessor', 'samurai', 'prisoner', 'wretch'];

export const STAT_KEYS = ['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane'];

// Характеристики, по которым определяем «направление» класса
const FOCUS_KEYS = ['strength', 'dexterity', 'intelligence', 'faith', 'arcane'];

export const STAT_NAMES = {
  en: { vigor: 'Vigor', mind: 'Mind', endurance: 'Endurance', strength: 'Strength', dexterity: 'Dexterity', intelligence: 'Intelligence', faith: 'Faith', arcane: 'Arcane' },
  ru: { vigor: 'Живучесть', mind: 'Разум', endurance: 'Выносливость', strength: 'Сила', dexterity: 'Ловкость', intelligence: 'Интеллект', faith: 'Вера', arcane: 'Мистицизм' },
};

// Русские тексты. Если класса тут нет, показывается описание из API.
export const RU = {
  vagabond: { name: 'Скиталец', desc: 'Странствующий рыцарь с крепким здоровьем и надёжным снаряжением.', fit: 'Подходит новичкам: прощает ошибки и не требует сложной сборки.' },
  warrior: { name: 'Воин', desc: 'Боец кочевого племени, владеющий парой клинков. Строит бой на технике и скорости.', fit: 'Подходит тем, кто любит быстрый бой и уклонения.' },
  hero: { name: 'Герой', desc: 'Силач из рода вождя пустошей, мастер тяжёлого боевого топора.', fit: 'Подходит тем, кто хочет бить сильно и выдерживать удары.' },
  bandit: { name: 'Разбойник', desc: 'Ловкий налётчик с луком и кинжалом, опирающийся на хитрость и мистицизм.', fit: 'Подходит любителям скрытности, стрельбы и кровотечения.' },
  astrologer: { name: 'Астролог', desc: 'Учёный-колдун, управляющий магией кристаллов и звёзд.', fit: 'Подходит тем, кто хочет сражаться на расстоянии. Хрупкий, но очень мощный.' },
  prophet: { name: 'Пророк', desc: 'Служитель веры, творящий молитвы и исцеляющий себя.', fit: 'Подходит тем, кто любит магию веры и поддержку.' },
  confessor: { name: 'Исповедник', desc: 'Воин веры: меч, щит и молитвы в одном лице.', fit: 'Подходит тем, кто не хочет выбирать между мечом и магией.' },
  samurai: { name: 'Самурай', desc: 'Мастер катаны и лука из далёких земель. Быстр и вынослив.', fit: 'Подходит тем, кто любит точный, быстрый бой катаной.' },
  prisoner: { name: 'Узник', desc: 'Заключённый в железной маске: сочетает ловкость и колдовство.', fit: 'Подходит тем, кто хочет и клинок, и магию.' },
  wretch: { name: 'Оборванец', desc: 'Начинает с первого уровня и почти без снаряжения.', fit: 'Подходит опытным игрокам, которым нужен вызов и свобода сборки.' },
};

export const slugOf = (name) => String(name).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (saved && Date.now() - saved.time < CACHE_TTL && Array.isArray(saved.data)) return saved.data;
  } catch {
    /* кеша нет или он битый */
  }
  return null;
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch {
    /* приватный режим */
  }
}

async function fetchApi() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json.data)) throw new Error('Unexpected classes response');
  writeCache(json.data);
  return json.data;
}

function normalise(raw) {
  const stats = Object.fromEntries(
    STAT_KEYS.map((key) => [key, Number(raw.stats?.[key] ?? (key === 'intelligence' ? raw.stats?.inteligence : 0)) || 0]),
  );
  const level = Number(raw.stats?.level) || 0;
  const focus = FOCUS_KEYS.reduce((best, key) => (stats[key] > stats[best] ? key : best), FOCUS_KEYS[0]);
  const slug = slugOf(raw.name);
  return {
    slug,
    name: raw.name,
    image: raw.image,
    description: raw.description,
    level,
    stats,
    total: STAT_KEYS.reduce((sum, key) => sum + stats[key], 0),
    focus,
  };
}

let cache = null;

export function loadClasses() {
  if (!cache) {
    cache = (async () => {
      const raw = readCache() ?? (await fetchApi());
      const list = raw.map(normalise);
      const rank = (c) => (ORDER.includes(c.slug) ? ORDER.indexOf(c.slug) : ORDER.length);
      list.sort((a, b) => rank(a) - rank(b));
      return { list, bySlug: new Map(list.map((c) => [c.slug, c])) };
    })().catch((error) => {
      cache = null;
      throw error;
    });
  }
  return cache;
}

// ---------- тексты интерфейса ----------
const LABELS = {
  en: {
    pageTitle: 'Classes — Elden Ring',
    eyebrow: 'Starting classes',
    title: 'Classes',
    subtitle: 'Ten ways to begin your journey. Compare starting stats and pick your path.',
    all: 'All',
    level: 'Level',
    total: 'Total',
    focus: 'Focus',
    fit: 'Good for',
    stats: 'Starting stats',
    back: '← All classes',
    prev: '← Previous',
    next: 'Next →',
    notFound: 'Class not found.',
    loadError: 'Could not load classes. Check your connection and try again.',
    retry: 'Retry',
    empty: 'No classes match this filter.',
    count: 'classes',
    details: 'Details',
  },
  ru: {
    pageTitle: 'Классы — Elden Ring',
    eyebrow: 'Стартовые классы',
    title: 'Классы',
    subtitle: 'Десять способов начать путь. Сравни стартовые характеристики и выбери свой.',
    all: 'Все',
    level: 'Уровень',
    total: 'Сумма',
    focus: 'Упор',
    fit: 'Кому подойдёт',
    stats: 'Стартовые характеристики',
    back: '← Все классы',
    prev: '← Назад',
    next: 'Дальше →',
    notFound: 'Класс не найден.',
    loadError: 'Не удалось загрузить классы. Проверь соединение и попробуй снова.',
    retry: 'Повторить',
    empty: 'Нет классов по этому фильтру.',
    count: 'классов',
    details: 'Подробнее',
  },
};

export const label = (key) => LABELS[getLang()][key] ?? LABELS.en[key] ?? key;
export const statName = (key) => STAT_NAMES[getLang()][key] ?? key;
export const className = (c) => (getLang() === 'ru' ? (RU[c.slug]?.name ?? c.name) : c.name);
export const classDesc = (c) => (getLang() === 'ru' ? (RU[c.slug]?.desc ?? c.description) : c.description);
export const classFit = (c) => (getLang() === 'ru' ? (RU[c.slug]?.fit ?? '') : '');
