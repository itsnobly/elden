/*
 * characters.js — данные боссов из /data/*.json.
 * Загружается один раз (результат запоминается), поэтому повторные заходы
 * на страницу боссов мгновенные. Все справочники строятся здесь же.
 *
 *  main.json       — основные боссы (обязателен)
 *  dlc.json        — боссы дополнения (если файла нет, будет пусто)
 *  optional.json   — необязательные боссы
 *  ru.json         — русские тексты { bosses: {id: {...}}, items: {id: {name_ru}} }
 *  items.json      — предметы (названия наград)
 *  difficulty.json — почему у босса такой ранг { id: {en, ru} }
 */
import { normalizeText } from '../utils/html.js';

export const TIERS = ['S', 'A', 'B', 'C'];

// Чужой/шуточный id вместо настоящего ролика — не показываем
const BAD_VIDEO_IDS = new Set(['dQw4w9WgXcQ']);

async function getJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (fallback === undefined) throw error;
    return fallback;
  }
}

export function tierOf(boss) {
  const tier = String(boss.tier ?? '').toUpperCase();
  return tier === 'IMPOSSIBLE' ? 'S' : tier;
}

export const locationKey = (boss) =>
  `${boss.region ?? ''}|||${boss.location ?? ''}`;

export function videoIdOf(boss) {
  const id = boss.media?.cutscene_youtube_id;
  return id && !BAD_VIDEO_IDS.has(id) ? id : '';
}

let cache = null;

export function loadBosses() {
  if (!cache) {
    cache = build().catch((error) => {
      cache = null; // даём шанс повторить
      throw error;
    });
  }
  return cache;
}

async function build() {
  const [main, dlc, optional, locale, items, difficulty] = await Promise.all([
    getJson('/data/main.json'),
    getJson('/data/dlc.json', []),
    getJson('/data/optional.json', []),
    getJson('/data/ru.json', { bosses: {}, items: {} }),
    getJson('/data/items.json', []),
    getJson('/data/difficulty.json', {}),
  ]);
  if (!Array.isArray(main)) throw new Error('main.json: ожидался массив');

  const categories = [
    { id: 'main', label: 'catMain', bosses: main },
    { id: 'dlc', label: 'catDlc', bosses: dlc },
    { id: 'optional', label: 'catOptional', bosses: optional },
  ];
  const all = [...main, ...dlc, ...optional];
  const categoryOf = new Map();
  for (const category of categories) {
    for (const boss of category.bosses) categoryOf.set(boss.id, category);
  }

  const itemById = new Map(
    (Array.isArray(items) ? items : []).map((item) => [item.item_id, item]),
  );
  const ruBosses = locale.bosses ?? {};
  const ruItems = locale.items ?? {};

  // Русские тексты: в ru.json у части боссов ключ "description" был
  // записан как "3" или "5" — подхватываем и такие.
  const ru = (id) => {
    const entry = ruBosses[id] ?? {};
    const text = entry.text ?? {};
    return {
      name: entry.name_ru,
      short: text.short,
      description: text.description ?? text['3'] ?? text['5'],
      lore: text.lore,
      phases: entry.phases ?? [],
      tips: entry.tips ?? [],
    };
  };

  // Порядок: сложность -> регион/локация -> имя
  const sorted = [...all].sort((a, b) => {
    const diff = TIERS.indexOf(tierOf(a)) - TIERS.indexOf(tierOf(b));
    if (diff) return diff;
    return `${a.region} ${a.location} ${a.name_en}`.localeCompare(
      `${b.region} ${b.location} ${b.name_en}`,
    );
  });

  // Строка для поиска считается один раз (по-русски и по-английски сразу)
  const searchText = new Map();
  for (const boss of all) {
    const r = ru(boss.id);
    const rewards = (boss.rewards ?? []).flatMap((reward) => [
      itemById.get(reward.item_id)?.name_en,
      ruItems[reward.item_id]?.name_ru,
      reward.item_id,
    ]);
    searchText.set(
      boss.id,
      normalizeText(
        [
          boss.name_en,
          r.name,
          boss.region,
          boss.location,
          r.short,
          r.description,
          ...rewards,
        ].join(' '),
      ),
    );
  }

  return {
    all,
    sorted,
    categories,
    categoryOf,
    byId: new Map(all.map((boss) => [boss.id, boss])),
    searchText,
    ru,
    difficulty,
    itemName(rewardOrId, lang) {
      const id = rewardOrId.item_id ?? rewardOrId;
      const en = itemById.get(id)?.name_en ?? id;
      return lang === 'ru' ? (ruItems[id]?.name_ru ?? en) : en;
    },
    itemType(reward) {
      return itemById.get(reward.item_id)?.type ?? reward.type ?? '';
    },
  };
}
