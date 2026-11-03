/*
 * planner-page.js — планировщик билда и калькулятор рун (/pages/tools/planner.html)
 */
import {
  loadClasses,
  STAT_KEYS,
  statName,
  className,
} from '../modules/classes-data.js';
import { escapeHtml } from '../utils/html.js';
import { getLang } from '../utils/i18n.js';

const STORAGE_KEY = 'er:planner';
const MAX_STAT = 99;
const BAR_MAX = 99;

// ---------- тексты ----------
const TEXT = {
  en: {
    title: 'Build planner',
    subtitle:
      'Pick a class, spend your points and see the level and runes you need.',
    eyebrow: 'Tools',
    class: 'Starting class',
    stats: 'Attributes',
    level: 'Level',
    points: 'Points spent',
    runes: 'Runes needed',
    next: 'Next level costs',
    reset: 'Reset',
    calc: 'Rune calculator',
    calcHint: 'Runes needed to go from one level to another.',
    from: 'From level',
    to: 'To level',
    result: 'Runes',
    loadError: 'Could not load classes. Check your connection and try again.',
    retry: 'Retry',
    pageTitle: 'Build planner — Elden Ring',
    backToQuiz: '← Back to class quiz',
  },
  ru: {
    title: 'Планировщик билда',
    subtitle:
      'Выбери класс, распредели очки и узнай итоговый уровень и нужные руны.',
    eyebrow: 'Инструменты',
    class: 'Стартовый класс',
    stats: 'Характеристики',
    level: 'Уровень',
    points: 'Потрачено очков',
    runes: 'Нужно рун',
    next: 'Следующий уровень',
    reset: 'Сбросить',
    calc: 'Калькулятор рун',
    calcHint: 'Сколько рун нужно, чтобы дойти с одного уровня до другого.',
    from: 'С уровня',
    to: 'До уровня',
    result: 'Руны',
    loadError:
      'Не удалось загрузить классы. Проверь соединение и попробуй снова.',
    retry: 'Повторить',
    pageTitle: 'Планировщик билда — Elden Ring',
    backToQuiz: '← Вернуться к тесту',
  },
};
const tx = (key) => TEXT[getLang()][key];

// ---------- руны ----------
// Цена перехода с уровня L на L+1 (формула из игры)
function runeCost(level) {
  const x = Math.max(0, level + 81 - 92) * 0.02;
  return Math.floor((x + 0.1) * (level + 81) ** 2 + 1);
}

// Всего рун, чтобы дойти с уровня from до уровня to
function runesBetween(from, to) {
  let sum = 0;
  for (let level = from; level < to; level += 1) sum += runeCost(level);
  return sum;
}

const fmt = (n) => n.toLocaleString(getLang() === 'ru' ? 'ru-RU' : 'en-US');
const clamp = (n, min, max) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

// ---------- состояние ----------
let data;
let root;
let state; // { slug, stats }
let fromQuiz = false;
let cleanups = [];

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ничего */
  }
}

function loadState() {
  // ссылка со страницы класса: ?class=hero — начинаем с чистого билда этого класса
  const fromLink = data.bySlug.get(
    new URLSearchParams(location.search).get('class'),
  );
  if (fromLink) return { slug: fromLink.slug, stats: { ...fromLink.stats } };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && data.bySlug.has(saved.slug)) {
      const base = data.bySlug.get(saved.slug).stats;
      const stats = Object.fromEntries(
        STAT_KEYS.map((k) => [
          k,
          clamp(Number(saved.stats?.[k]), base[k], MAX_STAT),
        ]),
      );
      return { slug: saved.slug, stats };
    }
  } catch {
    /* нет сохранённого */
  }
  const first = data.list[0];
  return { slug: first.slug, stats: { ...first.stats } };
}

const current = () => data.bySlug.get(state.slug);

function summary() {
  const base = current();
  const points = STAT_KEYS.reduce(
    (sum, k) => sum + (state.stats[k] - base.stats[k]),
    0,
  );
  const level = base.level + points;
  return {
    points,
    level,
    runes: runesBetween(base.level, level),
    next: runeCost(level),
  };
}

// ---------- разметка ----------
function shell() {
  return `
    <section class="planner">
      <div class="container">
        <header class="planner__head">
          ${fromQuiz ? `<a class="planner__quiz-back" href="/pages/guide.html#class-quiz">${escapeHtml(tx('backToQuiz'))}</a>` : ''}
          <p class="planner__eyebrow" data-t="eyebrow"></p>
          <h1 class="planner__title" data-t="title"></h1>
          <p class="planner__subtitle" data-t="subtitle"></p>
        </header>

        <div class="planner__layout">
          <div class="planner__main">
            <h2 data-t="class"></h2>
            <div class="planner__classes" data-ref="classes"></div>

            <h2 data-t="stats"></h2>
            <div class="planner__stats" data-ref="stats"></div>
          </div>

          <aside class="planner__side">
            <div class="planner__card">
              <div class="planner__big">
                <span data-t="level"></span>
                <b data-ref="level"></b>
              </div>
              <dl class="planner__facts">
                <div><dt data-t="points"></dt><dd data-ref="points"></dd></div>
                <div><dt data-t="runes"></dt><dd data-ref="runes"></dd></div>
                <div><dt data-t="next"></dt><dd data-ref="next"></dd></div>
              </dl>
              <button type="button" class="planner__reset" data-ref="reset"></button>
            </div>

            <div class="planner__card">
              <h2 data-t="calc"></h2>
              <p class="planner__hint" data-t="calcHint"></p>
              <div class="planner__calc">
                <label><span data-t="from"></span><input type="number" min="1" max="713" value="1" data-ref="from" /></label>
                <label><span data-t="to"></span><input type="number" min="1" max="713" value="100" data-ref="to" /></label>
              </div>
              <div class="planner__big planner__big--small"><span data-t="result"></span><b data-ref="calcResult"></b></div>
            </div>
          </aside>
        </div>
      </div>
    </section>`;
}

let refs;

function renderTexts() {
  root
    .querySelectorAll('[data-t]')
    .forEach((el) => (el.textContent = tx(el.dataset.t)));
  refs.reset.textContent = tx('reset');
  document.title = tx('pageTitle');
}

function renderClasses() {
  refs.classes.innerHTML = data.list
    .map(
      (c) =>
        `<button type="button" class="planner__chip${c.slug === state.slug ? ' is-active' : ''}" data-class="${escapeHtml(c.slug)}" aria-pressed="${c.slug === state.slug}">${escapeHtml(className(c))}</button>`,
    )
    .join('');
}

function renderStats() {
  const base = current().stats;
  refs.stats.innerHTML = STAT_KEYS.map(
    (k) => `
      <div class="planner__row" data-stat="${k}">
        <span class="planner__label">${escapeHtml(statName(k))}</span>
        <span class="planner__bar"><i style="width:${(state.stats[k] / BAR_MAX) * 100}%"></i></span>
        <button type="button" data-step="-1" aria-label="−" ${state.stats[k] <= base[k] ? 'disabled' : ''}>−</button>
        <input type="number" min="${base[k]}" max="${MAX_STAT}" value="${state.stats[k]}" aria-label="${escapeHtml(statName(k))}" />
        <button type="button" data-step="1" aria-label="+" ${state.stats[k] >= MAX_STAT ? 'disabled' : ''}>+</button>
      </div>`,
  ).join('');
}

// только цифры справа: поле ввода не пересоздаём, чтобы не терять фокус
function renderNumbers() {
  const { points, level, runes, next } = summary();
  refs.level.textContent = level;
  refs.points.textContent = points;
  refs.runes.textContent = fmt(runes);
  refs.next.textContent = fmt(next);
  calc();
}

function calc() {
  const from = clamp(Math.round(Number(refs.from.value)), 1, 713);
  const to = clamp(Math.round(Number(refs.to.value)), 1, 713);
  refs.calcResult.textContent = fmt(runesBetween(from, to));
}

function setStat(key, value) {
  const base = current().stats[key];
  state.stats[key] = clamp(Math.round(value), base, MAX_STAT);
  const row = refs.stats.querySelector(`[data-stat="${key}"]`);
  row.querySelector('input').value = state.stats[key];
  row.querySelector('.planner__bar i').style.width =
    `${(state.stats[key] / BAR_MAX) * 100}%`;
  row.querySelector('[data-step="-1"]').disabled = state.stats[key] <= base;
  row.querySelector('[data-step="1"]').disabled = state.stats[key] >= MAX_STAT;
  renderNumbers();
  save();
}

function pickClass(slug) {
  const c = data.bySlug.get(slug);
  state = { slug, stats: { ...c.stats } };
  renderClasses();
  renderStats();
  refs.from.value = c.level;
  refs.to.value = Math.max(c.level, 100);
  renderNumbers();
  save();
}

// ---------- события ----------
function on(target, type, handler) {
  target.addEventListener(type, handler);
  cleanups.push(() => target.removeEventListener(type, handler));
}

function bind() {
  on(refs.classes, 'click', (event) => {
    const chip = event.target.closest('[data-class]');
    if (chip) pickClass(chip.dataset.class);
  });

  on(refs.stats, 'click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    const key = button.closest('[data-stat]').dataset.stat;
    setStat(key, state.stats[key] + Number(button.dataset.step));
  });

  on(refs.stats, 'change', (event) => {
    const input = event.target.closest('input');
    if (input)
      setStat(input.closest('[data-stat]').dataset.stat, Number(input.value));
  });

  on(refs.reset, 'click', () => pickClass(state.slug));
  on(refs.from, 'input', calc);
  on(refs.to, 'input', calc);

  on(window, 'lang-change', () => {
    renderTexts();
    renderClasses();
    renderStats();
    renderNumbers();
  });
}

// ---------- вход / выход (вызывает router) ----------
async function build(container) {
  data = await loadClasses();
  root = container;
  fromQuiz = new URLSearchParams(location.search).get('from') === 'quiz';
  root.innerHTML = shell();
  refs = Object.fromEntries(
    [...root.querySelectorAll('[data-ref]')].map((el) => [el.dataset.ref, el]),
  );
  state = loadState();

  renderTexts();
  renderClasses();
  renderStats();
  refs.from.value = current().level;
  refs.to.value = Math.max(current().level, 100);
  renderNumbers();
  bind();
}

export async function mount(page) {
  const container = page.querySelector('#planner-root');
  const loader = page.querySelector('#page-loader');
  try {
    await build(container);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<section class="planner"><div class="container">
      <p class="planner__message">${escapeHtml(tx('loadError'))}</p>
      <p class="planner__message"><button type="button" class="planner__reset" onclick="location.reload()">${escapeHtml(tx('retry'))}</button></p>
    </div></section>`;
  } finally {
    requestAnimationFrame(() => loader?.classList.add('is-hidden'));
  }
}

export function unmount() {
  cleanups.forEach((off) => off());
  cleanups = [];
  root = refs = undefined;
}
