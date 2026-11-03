/*
 * class-page.js — страница одного класса (/pages/guide/class.html?id=hero).
 */
import {
  loadClasses,
  STAT_KEYS,
  label,
  statName,
  className,
  classDesc,
  classFit,
} from '../modules/classes-data.js';
import { escapeHtml } from '../utils/html.js';

const BAR_MAX = 25;

let data;
let root;
let slug;
let cleanups = [];

const href = (id) => `/pages/guide/class.html?id=${encodeURIComponent(id)}`;

function render() {
  const c = data.bySlug.get(slug);
  if (!c) {
    document.title = label('pageTitle');
    root.innerHTML = `<section class="classes"><div class="container">
      <p class="class-page__top"><a class="class-page__back" href="/pages/guide/classes.html">${escapeHtml(label('back'))}</a></p>
      <p class="classes__message">${escapeHtml(label('notFound'))}</p></div></section>`;
    return;
  }

  const index = data.list.indexOf(c);
  const prev = data.list[index - 1];
  const next = data.list[index + 1];
  const fit = classFit(c);
  document.title = `${className(c)} — Elden Ring`;

  root.innerHTML = `
    <article class="class-page">
      <div class="container">
        <p class="class-page__top"><a class="class-page__back" href="/pages/guide/classes.html">${escapeHtml(label('back'))}</a></p>

        <div class="class-page__layout">
          <div class="class-page__art">
            <span class="classes__placeholder" aria-hidden="true">✦</span>
            ${c.image ? `<img src="${escapeHtml(c.image)}" alt="${escapeHtml(className(c))}" decoding="async" />` : ''}
          </div>

          <div class="class-page__body">
            <h1 class="class-page__title">${escapeHtml(className(c))}</h1>
            ${getEn(c)}
            <p class="class-page__lead">${escapeHtml(classDesc(c))}</p>

            <dl class="class-page__facts">
              <div><dt>${escapeHtml(label('level'))}</dt><dd>${c.level}</dd></div>
              <div><dt>${escapeHtml(label('focus'))}</dt><dd>${escapeHtml(statName(c.focus))}</dd></div>
              <div><dt>${escapeHtml(label('total'))}</dt><dd>${c.total}</dd></div>
            </dl>

            ${fit ? `<p class="class-page__fit"><strong>${escapeHtml(label('fit'))}:</strong> ${escapeHtml(fit)}</p>` : ''}

            <h2>${escapeHtml(label('stats'))}</h2>
            <div class="class-page__stats">
              ${STAT_KEYS.map(
                (key) => `
                <div class="classes__stat${key === c.focus ? ' is-focus' : ''}">
                  <span>${escapeHtml(statName(key))}</span>
                  <span class="classes__bar"><i style="width:${Math.min(100, (c.stats[key] / BAR_MAX) * 100)}%"></i></span>
                  <b>${c.stats[key]}</b>
                </div>`,
              ).join('')}
            </div>

            <a class="class-page__cta" href="/pages/tools/tools.html?class=${encodeURIComponent(c.slug)}">${escapeHtml(label('build'))}</a>
          </div>
        </div>

        <nav class="class-page__pager">
          ${prev ? `<a href="${href(prev.slug)}">${escapeHtml(label('prev'))}<span>${escapeHtml(className(prev))}</span></a>` : '<span></span>'}
          ${next ? `<a href="${href(next.slug)}">${escapeHtml(label('next'))}<span>${escapeHtml(className(next))}</span></a>` : '<span></span>'}
        </nav>
      </div>
    </article>`;
}

// английское имя под русским заголовком (в английском режиме не показываем)
function getEn(c) {
  return className(c) !== c.name
    ? `<p class="class-page__en">${escapeHtml(c.name)}</p>`
    : '';
}

async function build(container) {
  data = await loadClasses();
  root = container;
  slug = new URLSearchParams(location.search).get('id');
  render();

  const onError = (event) => {
    if (event.target instanceof HTMLImageElement) event.target.hidden = true;
  };
  root.addEventListener('error', onError, true);
  window.addEventListener('lang-change', render);
  cleanups = [
    () => root?.removeEventListener('error', onError, true),
    () => window.removeEventListener('lang-change', render),
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
