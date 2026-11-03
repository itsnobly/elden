import { getLang, t } from '../utils/i18n.js';
import { escapeHtml } from '../utils/html.js';
import { loadBosses } from '../modules/characters.js';
import { localizeBossText } from '../utils/boss-localization.js';
import {
  classDesc,
  classFit,
  className,
  loadClasses,
  statName,
} from '../modules/classes-data.js';

const QUESTIONS = [
  {
    id: 'combat',
    title: ['How do you want to deal damage?', 'Как вы хотите наносить урон?'],
    answers: [
      ['Slow, heavy hits', 'Медленно, но мощно', { strength: 2, vigor: 1 }],
      ['Fast weapon combos', 'Быстрыми сериями ударов', { dexterity: 2, endurance: 1 }],
      ['Sorceries from a distance', 'Колдовством на расстоянии', { intelligence: 2, mind: 1 }],
      ['Incantations and holy power', 'Молитвами и святой силой', { faith: 2, mind: 1 }],
    ],
  },
  {
    id: 'range',
    title: ['Where do you prefer to fight?', 'На какой дистанции вам удобнее сражаться?'],
    answers: [
      ['Up close, face to face', 'Вблизи, лицом к лицу', { vigor: 1, strength: 1 }],
      ['Close, but quick on my feet', 'Вблизи, полагаясь на скорость', { dexterity: 2 }],
      ['From a safe distance with magic', 'Из безопасного места с помощью магии', { intelligence: 2 }],
      ['Adapt between melee and spells', 'Чередуя ближний бой и заклинания', { faith: 1, dexterity: 1, mind: 1 }],
    ],
  },
  {
    id: 'survival',
    title: ['What helps you survive a tough fight?', 'Что поможет пережить сложный бой?'],
    answers: [
      ['High health and solid armor', 'Много здоровья и крепкая броня', { vigor: 2, endurance: 1 }],
      ['Dodging and never staying still', 'Уклонения и постоянное движение', { dexterity: 1, endurance: 2 }],
      ['Keeping enemies away with spells', 'Держать врагов на расстоянии заклинаниями', { intelligence: 2, mind: 1 }],
      ['Healing and protective incantations', 'Исцеление и защитные молитвы', { faith: 2, vigor: 1 }],
    ],
  },
  {
    id: 'weapon',
    title: ['Pick the weapon that sounds most fun.', 'Какое оружие звучит интереснее?'],
    answers: [
      ['A giant sword or a heavy axe', 'Огромный меч или тяжёлый топор', { strength: 2, endurance: 1 }],
      ['A katana or a pair of blades', 'Катана или парные клинки', { dexterity: 2, endurance: 1 }],
      ['A staff and a spellbook', 'Посох и магия звёзд', { intelligence: 2, mind: 1 }],
      ['A sword, shield, and sacred seal', 'Меч, щит и священная печать', { faith: 1, strength: 1, vigor: 1 }],
    ],
  },
  {
    id: 'magic',
    title: ['Which special power would you choose?', 'Какую особую силу вы бы выбрали?'],
    answers: [
      ['No magic — let my weapon speak', 'Без магии — за меня говорит оружие', { strength: 1, dexterity: 1 }],
      ['Glintstone sorceries', 'Колдовство блестящих камней', { intelligence: 2, mind: 1 }],
      ['Fire, lightning, and healing prayers', 'Огонь, молнии и исцеляющие молитвы', { faith: 2, mind: 1 }],
      ['Bleed and strange, forbidden powers', 'Кровотечение и запретные силы', { arcane: 2, dexterity: 1 }],
    ],
  },
  {
    id: 'boss',
    title: ['How would you approach a dangerous boss?', 'Как вы подойдёте к битве с опасным боссом?'],
    answers: [
      ['Break its stance with heavy attacks', 'Сломаю стойку тяжёлыми атаками', { strength: 2 }],
      ['Learn its moves and punish openings', 'Изучу атаки и буду ловить моменты', { dexterity: 2, endurance: 1 }],
      ['Keep my distance and cast spells', 'Сохраню дистанцию и буду колдовать', { intelligence: 2 }],
      ['Use weaknesses, status effects, and buffs', 'Использую уязвимости, эффекты и усиления', { arcane: 1, faith: 1, mind: 1 }],
    ],
  },
  {
    id: 'defense',
    title: ['Choose your defense.', 'Выберите способ защиты.'],
    answers: [
      ['Shield and armor', 'Щит и броня', { vigor: 1, endurance: 1, strength: 1 }],
      ['A quick roll at the right moment', 'Быстрый перекат в нужный момент', { dexterity: 1, endurance: 2 }],
      ['A spell that stops the threat first', 'Заклинание, которое остановит угрозу заранее', { intelligence: 1, mind: 1, vigor: 1 }],
      ['A blessing, heal, or protective prayer', 'Благословение, исцеление или защитная молитва', { faith: 2, vigor: 1 }],
    ],
  },
  {
    id: 'resources',
    title: ['How much do you want to rely on FP?', 'Насколько вы хотите зависеть от ОК?'],
    answers: [
      ['Very little; mostly melee attacks', 'Почти не зависеть, в основном ближний бой', { strength: 1, vigor: 1 }],
      ['Some, for weapon skills', 'Немного — на навыки оружия', { dexterity: 1, endurance: 1 }],
      ['A lot; casting is my main damage', 'Сильно — заклинания будут главным уроном', { intelligence: 2, mind: 2 }],
      ['Enough for useful incantations', 'Достаточно для полезных молитв', { faith: 2, mind: 1 }],
    ],
  },
  {
    id: 'explore',
    title: ['What sounds most useful while exploring?', 'Что пригодится вам в исследовании мира?'],
    answers: [
      ['A reliable weapon for every encounter', 'Надёжное оружие на любой случай', { strength: 1, vigor: 1 }],
      ['A bow and fast attacks', 'Лук и быстрые атаки', { dexterity: 2 }],
      ['Ranged magic for groups of enemies', 'Дальняя магия против групп врагов', { intelligence: 1, mind: 1 }],
      ['Healing, buffs, and flexible tools', 'Исцеление, усиления и разные приёмы', { faith: 1, arcane: 1, mind: 1 }],
    ],
  },
  {
    id: 'armor',
    title: ['What gear would you rather wear?', 'Какую экипировку вы предпочитаете?'],
    answers: [
      ['Heavy armor; I can carry the weight', 'Тяжёлую броню — справлюсь с весом', { endurance: 2, strength: 1 }],
      ['Light armor to stay agile', 'Лёгкую броню ради подвижности', { dexterity: 2, endurance: 1 }],
      ['Robes; I will avoid getting hit', 'Одежду мага — главное не получать удары', { intelligence: 1, mind: 1 }],
      ['A balanced set with room for a seal', 'Сбалансированную броню и место для печати', { faith: 1, vigor: 1, endurance: 1 }],
    ],
  },
  {
    id: 'build',
    title: ['How do you like to shape a character build?', 'Как вам нравится собирать персонажа?'],
    answers: [
      ['Keep it simple: health, strength, weapon', 'Проще: здоровье, сила и оружие', { vigor: 1, strength: 2 }],
      ['Tune a fast weapon and its scaling', 'Настраивать быстрое оружие и его параметры', { dexterity: 2 }],
      ['Choose spells and maximize their power', 'Подбирать заклинания и усиливать их', { intelligence: 1, mind: 1 }],
      ['Combine several tools and status effects', 'Комбинировать приёмы и эффекты', { faith: 1, arcane: 1, mind: 1 }],
    ],
  },
  {
    id: 'experience',
    title: ['How familiar are you with Soulslike games?', 'Насколько вы знакомы с играми в духе Dark Souls?'],
    answers: [
      ['This is my first one; I want a forgiving start', 'Играю впервые и хочу начать попроще', { vigor: 1 }, { vagabond: 3 }],
      ['I know the basics and want a balanced start', 'Знаю основы и хочу сбалансированный старт', { vigor: 1, dexterity: 1 }, { confessor: 2 }],
      ['I have experience and want a focused build', 'Уже есть опыт, хочу сделать упор на конкретный стиль', { intelligence: 1, strength: 1 }, { prisoner: 2 }],
      ['I know the genre and want a challenge', 'Знаком с такими играми и хочу испытать себя', { arcane: 1, dexterity: 1 }, { wretch: 3 }],
    ],
  },
];

const STARTING_CLASS_SLUGS = new Set([
  'vagabond',
  'warrior',
  'hero',
  'bandit',
  'astrologer',
  'prophet',
  'confessor',
  'samurai',
  'prisoner',
  'wretch',
]);
const HISTORY_KEY = 'er:class-quiz-history:v1';

const COPY = {
  en: {
    title: 'Find your starting class',
    intro: 'Answer 12 quick questions. We’ll compare your playstyle with the starting stats of all ten classes.',
    loading: 'Loading class data…',
    progress: (count) => `${count} of ${QUESTIONS.length} answered`,
    submit: 'Show my recommendations',
    reset: 'Retake the quiz',
    error: 'Could not load class data. Check your connection and try again.',
    retry: 'Retry',
    incomplete: 'Answer every question to see your recommendations.',
    result: 'Your best matches',
    best: 'Best match',
    details: 'Class details',
    build: 'Start a build',
    fit: 'Why it may fit',
    matchReason: 'Your answers match this class’s starting stats and combat style.',
    noFit: 'Its starting stats line up with the playstyle you chose.',
    historyTitle: 'Past quiz results',
    historyEmpty: 'Completed quizzes will appear here so you can revisit them later.',
    historyEntry: (date, best) => `${date} · Best match: ${best}`,
    historyAnswers: 'Your answers',
    historyUnavailable: 'Could not save this result in browser storage.',
  },
  ru: {
    title: 'Подбери стартовый класс',
    intro: 'Ответь на 12 вопросов. Сравним твой стиль игры со стартовыми характеристиками всех десяти классов.',
    loading: 'Загружаем данные классов…',
    progress: (count) => `Отвечено: ${count} из ${QUESTIONS.length}`,
    submit: 'Показать рекомендации',
    reset: 'Пройти тест заново',
    error: 'Не удалось загрузить классы. Проверь соединение и попробуй снова.',
    retry: 'Повторить',
    incomplete: 'Ответь на все вопросы, чтобы получить рекомендации.',
    result: 'Лучшие совпадения',
    best: 'Лучший выбор',
    details: 'Подробнее о классе',
    build: 'Собрать билд',
    fit: 'Почему подходит',
    matchReason: 'Стартовые характеристики и стиль класса совпадают с твоими ответами.',
    noFit: 'Стартовые характеристики совпадают с выбранным стилем игры.',
    historyTitle: 'История тестов',
    historyEmpty: 'Завершённые тесты будут сохраняться здесь — к ним можно вернуться позже.',
    historyEntry: (date, best) => `${date} · Лучшее совпадение: ${best}`,
    historyAnswers: 'Твои ответы',
    historyUnavailable: 'Не удалось сохранить результат в памяти браузера.',
  },
};

let root;
let classData;
let answers = {};
let completed = false;
let regionRoot;
let regionData;
let loading = false;
let historyError = false;
let openHistoryEntries = new Set();
let cleanups = [];

const text = (value, lang) => (Array.isArray(value) ? value[lang === 'ru' ? 1 : 0] : value);

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(stored)) throw new TypeError('Quiz history must be an array.');
    return stored.filter(
      (entry) =>
        entry &&
        typeof entry.createdAt === 'number' &&
        entry.answers &&
        typeof entry.answers === 'object' &&
        Array.isArray(entry.recommendations),
    );
  } catch (error) {
    console.error('Could not read class quiz history.', error);
    historyError = true;
    return [];
  }
}

function saveHistoryEntry() {
  try {
    const history = readHistory();
    const ranked = recommendations(answers).map(({ character }) => character.slug);
    const createdAt = Math.max(Date.now(), (history[0]?.createdAt ?? 0) + 1);
    history.unshift({
      createdAt,
      answers: { ...answers },
      recommendations: ranked,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    historyError = false;
  } catch (error) {
    console.error('Could not save class quiz history.', error);
    historyError = true;
  }
}

function recommendations(answerSet) {
  const preferences = {};
  const bonus = {};
  QUESTIONS.forEach((question) => {
    const optionIndex = Number(answerSet[question.id]);
    const option = question.answers[optionIndex];
    if (!option) return;
    const stats = option[2];
    const classBonus = option[3] ?? {};
    Object.entries(stats).forEach(([key, value]) => {
      preferences[key] = (preferences[key] ?? 0) + value;
    });
    Object.entries(classBonus).forEach(([slug, value]) => {
      bonus[slug] = (bonus[slug] ?? 0) + value;
    });
  });
  const seen = new Set();
  const startingClasses = classData.list.filter((character) => {
    if (!STARTING_CLASS_SLUGS.has(character.slug) || seen.has(character.slug))
      return false;
    seen.add(character.slug);
    return true;
  });
  return startingClasses
    .map((character) => ({
      character,
      score:
        Object.entries(preferences).reduce(
          (sum, [key, weight]) => sum + character.stats[key] * weight,
          0,
        ) + (bonus[character.slug] ?? 0) * 20,
    }))
    .sort((a, b) => b.score - a.score || a.character.level - b.character.level)
    .slice(0, 3);
}

function renderResults(lang, answerSet, rankedSlugs = null, showReset = true) {
  const copy = COPY[lang];
  const rankedCharacters = rankedSlugs
    ? rankedSlugs
        .map((slug) => classData.list.find((character) => character.slug === slug))
        .filter(Boolean)
        .map((character) => ({ character }))
    : recommendations(answerSet);
  return `
    <section class="class-quiz__results" aria-live="polite">
      <h3>${escapeHtml(copy.result)}</h3>
      <div class="class-quiz__recommendations">
        ${rankedCharacters
          .map(({ character }, index) => {
            const name = className(character);
            const description = classDesc(character);
            const isBest = index === 0;
            const reason = (lang === 'ru' ? classFit(character) : '') || copy.matchReason;
            const detail = description || copy.noFit;
            return `
              <article class="class-quiz__recommendation${isBest ? ' is-best' : ''}">
                ${character.image ? `<img class="class-quiz__recommendation-art" src="${escapeHtml(character.image)}" alt="" aria-hidden="true" loading="lazy" decoding="async" />` : ''}
                <span class="class-quiz__rank">${isBest ? escapeHtml(copy.best) : `0${index + 1}`}</span>
                <h4>${escapeHtml(name)}</h4>
                <p>${escapeHtml(detail)}</p>
                <p class="class-quiz__reason"><strong>${escapeHtml(copy.fit)}:</strong> ${escapeHtml(reason)}</p>
                <div class="class-quiz__result-actions">
                  <a href="/pages/guide/class.html?id=${encodeURIComponent(character.slug)}&from=quiz">${escapeHtml(copy.details)}</a>
                  <a href="/pages/tools/tools.html?class=${encodeURIComponent(character.slug)}&from=quiz">${escapeHtml(copy.build)}</a>
                </div>
              </article>`;
          })
          .join('')}
      </div>
      ${showReset ? `<button class="class-quiz__reset" type="button" data-quiz-reset>${escapeHtml(copy.reset)}</button>` : ''}
    </section>`;
}

function renderHistory(lang) {
  const copy = COPY[lang];
  const history = readHistory();
  const dateFormatter = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return `
    <section class="class-quiz__history" aria-labelledby="class-quiz-history-title">
      <h3 id="class-quiz-history-title">${escapeHtml(copy.historyTitle)} <span>(${history.length})</span></h3>
      ${history.length
        ? `<div class="class-quiz__history-list">
            ${history
              .map((entry) => {
                const best = classData?.list.find(
                  (character) => character.slug === entry.recommendations[0],
                );
                const bestName = best
                  ? className(best)
                  : entry.recommendations[0] || copy.result;
                const date = dateFormatter.format(new Date(entry.createdAt));
                return `
                  <details class="class-quiz__history-entry" data-created-at="${entry.createdAt}" ${openHistoryEntries.has(String(entry.createdAt)) ? 'open' : ''}>
                    <summary>${escapeHtml(copy.historyEntry(date, bestName))}</summary>
                    <div class="class-quiz__history-content">
                      <h4>${escapeHtml(copy.historyAnswers)}</h4>
                      <ol>
                        ${QUESTIONS.map((question) => {
                          const answerIndex = Number(entry.answers[question.id]);
                          const answer = question.answers[answerIndex];
                          return answer
                            ? `<li><strong>${escapeHtml(text(question.title, lang))}</strong><span>${escapeHtml(answer[lang === 'ru' ? 1 : 0])}</span></li>`
                            : '';
                        }).join('')}
                      </ol>
                      ${classData ? renderResults(lang, entry.answers, entry.recommendations, false) : ''}
                    </div>
                  </details>`;
              })
              .join('')}
          </div>`
        : `<p class="class-quiz__history-empty">${escapeHtml(copy.historyEmpty)}</p>`}
      ${historyError ? `<p class="class-quiz__history-error" role="status">${escapeHtml(copy.historyUnavailable)}</p>` : ''}
    </section>`;
}

function renderRegions() {
  if (!regionRoot?.isConnected || !regionData) return;
  const grouped = new Map();
  for (const boss of regionData.all) {
    if (!boss.region) continue;
    if (!grouped.has(boss.region)) grouped.set(boss.region, []);
    grouped.get(boss.region).push(boss);
  }
  const lang = getLang();
  const regions = [...grouped.entries()].sort((a, b) =>
    localizeBossText(a[0], lang).localeCompare(localizeBossText(b[0], lang), lang),
  );
  regionRoot.innerHTML = regions.map(([region, bosses]) => `
    <article class="guide-region">
      <h3>${escapeHtml(localizeBossText(region, lang))}</h3>
      <ul class="guide-region__bosses">
        ${bosses
          .sort((a, b) => (regionData.ru(a.id).name ?? a.name_en).localeCompare(regionData.ru(b.id).name ?? b.name_en, lang))
          .map((boss) => {
            const name = lang === 'ru' ? (regionData.ru(boss.id).name ?? boss.name_en) : boss.name_en;
            const rewards = (boss.rewards ?? []).map((reward) =>
              regionData.itemName(reward, lang),
            );
            return `<li>
              <a href="/pages/bosses/boss.html?id=${encodeURIComponent(boss.id)}">${escapeHtml(name)}</a>
              <span class="guide-region__location">${escapeHtml(localizeBossText(boss.location ?? '', lang))}</span>
              <span class="guide-region__rewards"><strong>${escapeHtml(t('Boss reward'))}:</strong> ${escapeHtml(rewards.join(', ') || t('No listed rewards'))}</span>
            </li>`;
          })
          .join('')}
      </ul>
    </article>`).join('');
}

async function loadRegionData() {
  try {
    regionData = await loadBosses();
    renderRegions();
  } catch (error) {
    console.error('Could not load regional boss data for the guide.', error);
    if (regionRoot?.isConnected) {
      regionRoot.innerHTML = `<p class="guide-region__error">${escapeHtml(t('Could not load regional boss data.'))}</p>`;
    }
  }
}

function render() {
  if (!root) return;
  openHistoryEntries = new Set(
    [...root.querySelectorAll('.class-quiz__history-entry[open]')].map(
      (entry) => entry.dataset.createdAt,
    ),
  );
  const lang = getLang();
  const copy = COPY[lang];
  if (!classData) {
    root.innerHTML = `
      <div class="class-quiz__heading">
        <div>
          <p class="guide-section__eyebrow">01 — ${escapeHtml(copy.title)}</p>
          <h2 id="class-quiz-title">${escapeHtml(copy.title)}</h2>
          <p class="class-quiz__intro">${escapeHtml(copy.intro)}</p>
        </div>
        <p class="class-quiz__progress" role="status" aria-live="polite">${escapeHtml(loading ? copy.loading : copy.error)}</p>
      </div>`;
    if (!loading)
      root.insertAdjacentHTML(
        'beforeend',
        `<button class="class-quiz__submit" type="button" data-quiz-retry>${escapeHtml(copy.retry)}</button>`,
      );
    root.insertAdjacentHTML('beforeend', renderHistory(lang));
    return;
  }
  const answered = Object.keys(answers).length;
  root.innerHTML = `
    <div class="class-quiz__heading">
      <div>
        <p class="guide-section__eyebrow">01 — ${escapeHtml(copy.title)}</p>
        <h2 id="class-quiz-title">${escapeHtml(copy.title)}</h2>
        <p class="class-quiz__intro">${escapeHtml(copy.intro)}</p>
      </div>
      <p class="class-quiz__progress" data-quiz-progress role="status" aria-live="polite">${escapeHtml(copy.progress(answered))}</p>
    </div>
    <form class="class-quiz__form" data-quiz-form ${completed ? 'hidden' : ''}>
      <div class="class-quiz__questions">
        ${QUESTIONS.map(
          (question, index) => `
            <fieldset class="class-quiz__question">
              <legend><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(text(question.title, lang))}</legend>
              <div class="class-quiz__answers">
                ${question.answers
                  .map(
                    (option, optionIndex) => `
                      <label class="class-quiz__answer">
                        <input type="radio" name="${question.id}" value="${optionIndex}" ${answers[question.id] === String(optionIndex) ? 'checked' : ''} />
                        <span>${escapeHtml(option[lang === 'ru' ? 1 : 0])}</span>
                      </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>`,
        ).join('')}
      </div>
      <p class="class-quiz__error" data-quiz-error hidden>${escapeHtml(copy.incomplete)}</p>
      <button class="class-quiz__submit" type="submit" data-quiz-submit ${answered < QUESTIONS.length ? 'disabled' : ''}>${escapeHtml(copy.submit)}</button>
    </form>
    ${completed ? renderResults(lang, answers) : ''}
    ${renderHistory(lang)}`;
}

async function loadData() {
  loading = true;
  render();
  try {
    classData = await loadClasses();
  } catch (error) {
    console.error('Could not load classes for the class quiz.', error);
    classData = null;
  } finally {
    loading = false;
    if (root?.isConnected) render();
  }
}

export function mount(page) {
  root = page.querySelector('[data-class-quiz]');
  regionRoot = page.querySelector('[data-guide-regions]');
  const questGrid = page.querySelector('.guide-quest-grid');
  const questCards = questGrid ? [...questGrid.querySelectorAll('.guide-quest')] : [];
  const mobileQuestLayout = window.matchMedia('(max-width: 600px)');
  const setQuestGroups = () => {
    if (mobileQuestLayout.matches) {
      questCards.forEach((card) => {
        card.name = 'guide-quests';
      });
      questGrid?.replaceChildren(...questCards);
      return;
    }

    const columns = [document.createElement('div'), document.createElement('div')];
    columns.forEach((column) => column.classList.add('guide-quest-column'));
    questCards.forEach((card, index) => {
      const columnIndex = index % 2;
      card.name = columnIndex === 0 ? 'guide-quests-left' : 'guide-quests-right';
      columns[columnIndex].append(card);
    });
    questGrid?.replaceChildren(...columns);
  };
  setQuestGroups();
  mobileQuestLayout.addEventListener('change', setQuestGroups);
  if (regionData) renderRegions();
  else loadRegionData();
  if (!root) return;
  answers = {};
  completed = false;

  const onChange = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'radio') return;
    answers[input.name] = input.value;
    const answered = Object.keys(answers).length;
    const progress = root.querySelector('[data-quiz-progress]');
    const submit = root.querySelector('[data-quiz-submit]');
    if (progress) progress.textContent = COPY[getLang()].progress(answered);
    if (submit) submit.disabled = answered < QUESTIONS.length;
  };
  const onSubmit = (event) => {
    if (!event.target.matches('[data-quiz-form]')) return;
    event.preventDefault();
    if (Object.keys(answers).length < QUESTIONS.length) {
      const error = root.querySelector('[data-quiz-error]');
      if (error) error.hidden = false;
      return;
    }
    completed = true;
    saveHistoryEntry();
    render();
    root.querySelector('.class-quiz__results')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
    });
  };
  const onClick = (event) => {
    if (event.target.closest('[data-quiz-reset]')) {
      answers = {};
      completed = false;
      render();
    } else if (event.target.closest('[data-quiz-retry]')) {
      loadData();
    }
  };
  const onLanguageChange = () => {
    render();
    renderRegions();
  };

  root.addEventListener('change', onChange);
  root.addEventListener('submit', onSubmit);
  root.addEventListener('click', onClick);
  window.addEventListener('lang-change', onLanguageChange);
  cleanups = [
    () => mobileQuestLayout.removeEventListener('change', setQuestGroups),
    () => root?.removeEventListener('change', onChange),
    () => root?.removeEventListener('submit', onSubmit),
    () => root?.removeEventListener('click', onClick),
    () => window.removeEventListener('lang-change', onLanguageChange),
  ];
  loadData();
}

export function unmount() {
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
  root = null;
  regionRoot = null;
}
