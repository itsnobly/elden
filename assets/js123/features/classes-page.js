/*
 * classes-page.js — список классов (/pages/guide/classes.html).
 * Карточка ведёт на страницу класса. Фильтр — по главной характеристике.
 */
import { loadClasses, STAT_KEYS, label, statName, className, classDesc } from '../modules/classes-data.js';
import { escapeHtml } from '../utils/html.js';

const state = { focus: '' };
const FOCUS = ['strength', 'dexterity', 'intelligence', 'faith', 'arcane'];
const BAR_MAX = 25; // на этой цифре полоска заполнена целиком

let data;
let root;
let cleanups = [];

function bars(c) {
  return STAT_KEYS.map(
    (key) => `
      <div class="classes__stat${key === c.focus ? ' is-focus' : ''}">
        <span>${escapeHtml(statName(key))}</span>
        <span class="classes__bar"><i style="width:${Math.min(100, (c.stats[key] / BAR_MAX) * 100)}%"></i></span>
        <b>${c.stats[key]}</b>
      </div>`,
  ).join('');
}

function card(c) {
  return `
    <a class="classes__card" href="/pages/guide/class.html?id=${encodeURIComponent(c.slug)}">
      <span class="classes__art">
        <span class="classes__placeholder" aria-hidden="true">✦</span>
        ${c.image ? `<img src="${escapeHtml(c.image)}" alt="" loading="lazy" decoding="async" />` : ''}
        <span class="classes__level">${escapeHtml(label('level'))} ${c.level}</span>
      </span>
      <span class="classes__body">
        <span class="classes__name">${escapeHtml(className(c))}</span>
        <span class="classes__desc">${escapeHtml(classDesc(c))}</span>
        <span class="classes__stats">${bars(c)}</span>
      </span>
    </a>`;
}

function render() {
  const list = data.list.filter((c) => !state.focus || c.focus === state.focus);
  document.title = label('pageTitle');

  root.innerHTML = `
    <section class="classes">
      <div class="container">
        <header class="classes__head">
          <p class="classes__eyebrow">${escapeHtml(label('eyebrow'))}</p>
          <h1 class="classes__title">${escapeHtml(label('title'))}</h1>
          <p class="classes__subtitle">${escapeHtml(label('subtitle'))}</p>
        </header>

        <nav class="classes__filters" aria-label="${escapeHtml(label('focus'))}">
          ${['', ...FOCUS]
            .map(
              (key) => `
            <button type="button" class="classes__chip${state.focus === key ? ' is-active' : ''}" data-focus="${key}" aria-pressed="${state.focus === key}">
              ${escapeHtml(key ? statName(key) : label('all'))}
              <span>${key ? data.list.filter((c) => c.focus === key).length : data.list.length}</span>
            </button>`,
            )
            .join('')}
        </nav>

        ${list.length ? `<div class="classes__grid">${list.map(card).join('')}</div>` : `<p class="classes__message">${escapeHtml(label('empty'))}</p>`}
      </div>
    </section>`;
}

async function build(container) {
  data = await loadClasses();
  root = container;
  render();

  const onClick = (event) => {
    const chip = event.target.closest('[data-focus]');
    if (!chip) return;
    state.focus = chip.dataset.focus;
    render();
  };
  const onError = (event) => {
    if (event.target instanceof HTMLImageElement) event.target.hidden = true;
  };
  const onLang = () => render();

  root.addEventListener('click', onClick);
  root.addEventListener('error', onError, true);
  window.addEventListener('lang-change', onLang);
  cleanups = [
    () => root?.removeEventListener('click', onClick),
    () => root?.removeEventListener('error', onError, true),
    () => window.removeEventListener('lang-change', onLang),
  ];
}

export async function mount(page) {
  const container = page.querySelector('#class-root');
  const loader = page.querySelector('#page-loader');
  try {
    await build(container);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<section class="classes"><div class="container">
      <p class="classes__message">${escapeHtml(label('loadError'))}</p>
      <p class="classes__message"><button type="button" class="classes__retry" onclick="location.reload()">${escapeHtml(label('retry'))}</button></p>
    </div></section>`;
  } finally {
    requestAnimationFrame(() => loader?.classList.add('is-hidden'));
  }
}

export function unmount() {
  cleanups.forEach((off) => off());
  cleanups = [];
  root = undefined;
}
