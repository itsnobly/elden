/*
 * router.js — переходы между страницами без перезагрузки.
 *
 * Как это работает:
 *  1. Клик по внутренней ссылке перехватывается. HTML нужной страницы скачивается
 *     в фоне (fetch), из него берётся только блок #page и подставляется вместо
 *     текущего. Шапка, футер, модалки и тема не перерисовываются.
 *  2. У каждого #page есть data-page="home | bosses | boss". По этому имени
 *     подгружается JS страницы: mount(page) при входе, unmount() при уходе.
 *  3. Все страницы используют общий render-blocking stylesheet; если страница
 *     добавляет отдельные стили, роутер ждёт их до замены содержимого.
 *  4. Адрес меняется через history.pushState, «назад/вперёд» работают,
 *     положение прокрутки запоминается.
 *  5. Если страницы нет в списке (guide, music...) или что-то пошло не так —
 *     обычный переход, сайт не ломается.
 *  6. Страницы и данные боссов подгружаются заранее: при наведении на ссылку
 *     и когда браузер свободен.
 *
 * Новая страница: в HTML оберни содержимое в <div id="page" data-page="имя">
 * и добавь строку с именем в pages ниже.
 */
import { markNav } from './components/nav-current.js';

const pages = {
  home: () => import('./features/home-page.js'),
  bosses: () => import('./features/bosses-page.js'),
  boss: () => import('./features/boss-page.js'),
  classes: () => import('./features/classes-page.js'),
  class: () => import('./features/class-page.js'),
  planner: () => import('./features/planner-page.js'),
  guide: () => import('./features/guide-page.js'),
  database: () => import('./features/database-page.js'),
  music: () => import('./features/music-page.js'),
};

const docCache = new Map(); // адрес -> промис с разобранным HTML
const sheets = new Map(); // href -> <link rel="stylesheet">
const sheetLoads = new Map(); // href -> промис загрузки таблицы стилей
let current = null; // модуль открытой страницы
let token = 0; // номер последнего перехода: устаревшие результаты игнорируем
let navigating = false;

const getPage = () => document.querySelector('#page');
const isPageUrl = (url) =>
  url.pathname === '/' || url.pathname.endsWith('.html');

function fetchDoc(url) {
  const key = url.pathname + url.search;
  if (!docCache.has(key)) {
    docCache.set(
      key,
      fetch(url.href)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then((text) => new DOMParser().parseFromString(text, 'text/html'))
        .catch((error) => {
          docCache.delete(key);
          throw error;
        }),
    );
  }
  return docCache.get(key);
}

// ---------- CSS страниц ----------

function registerSheets() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    sheets.set(link.getAttribute('href'), link);
  });
}

// Подключает недостающие стили страницы и ждёт их загрузки (чтобы не было вспышки)
function loadSheets(doc) {
  const wanted = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(
    (link) => link.getAttribute('href'),
  );
  const waits = [];
  for (const href of wanted) {
    if (sheetLoads.has(href)) {
      waits.push(sheetLoads.get(href));
      continue;
    }
    if (sheets.has(href)) continue;

    const addSheet = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      const ready = new Promise((resolve, reject) => {
        link.addEventListener('load', resolve, { once: true });
        link.addEventListener(
          'error',
          () => {
            sheets.delete(href);
            sheetLoads.delete(href);
            link.remove();
            reject(new Error(`Failed to load stylesheet: ${href}`));
          },
          { once: true },
        );
        sheets.set(href, link);
        document.head.append(link);
      });
      sheetLoads.set(href, ready);
      ready.then(
        () => {
          if (sheetLoads.get(href) === ready) sheetLoads.delete(href);
        },
        () => {},
      );
      return ready;
    };

    const loading = addSheet();
    sheetLoads.set(href, loading);
    loading.then(
      () => {
        if (sheetLoads.get(href) === loading) sheetLoads.delete(href);
      },
      () => {
        if (sheetLoads.get(href) === loading) sheetLoads.delete(href);
      },
    );
    waits.push(loading);
  }
  return Promise.all(waits).then(() => new Set(wanted));
}

// Включает только стили нужной страницы
function applySheets(wanted) {
  for (const [href, link] of sheets) link.disabled = !wanted.has(href);
}

// ---------- переход ----------

async function navigate(url, { push = true, scrollY = 0 } = {}) {
  const id = ++token;
  navigating = true;

  try {
    const doc = await fetchDoc(url);
    const next = doc.querySelector('#page');
    const loadPage = pages[next?.dataset.page];
    if (!next || !loadPage) throw new Error('page is not supported');

    const [mod, wanted] = await Promise.all([loadPage(), loadSheets(doc)]);
    if (id !== token) return;

    current?.unmount?.();
    current = mod;
    applySheets(wanted);

    const fresh = document.importNode(next, true);
    getPage().replaceWith(fresh);
    document.title = doc.title;
    if (push) history.pushState({ y: 0 }, '', url.href);
    window.scrollTo(0, scrollY);
    markNav();

    await mod.mount(fresh);
    if (url.hash) {
      const target = document.getElementById(url.hash.slice(1));
      target?.scrollIntoView();
    }
  } catch (error) {
    console.error(error);
    if (id === token) location.href = url.href; // запасной вариант: обычный переход
  } finally {
    if (id === token) navigating = false;
  }
}

// ---------- перехват ссылок ----------

function onClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;

  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || !isPageUrl(url)) return;

  const samePage =
    url.pathname === location.pathname && url.search === location.search;
  if (samePage) {
    if (!url.hash) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return; // ссылки-якоря (#...) обрабатывает сам браузер
  }

  event.preventDefault();
  navigate(url);
}

// ---------- заранее подгружаем страницы и данные ----------

function prefetchLink(link) {
  const url = new URL(link.href, location.href);
  if (url.origin === location.origin && isPageUrl(url))
    fetchDoc(url).catch(() => {});
}

function warmUp() {
  document
    .querySelectorAll('.header a[href], .footer a[href]')
    .forEach(prefetchLink);
  pages.bosses().catch(() => {});
  import('./modules/characters.js').then((m) => m.loadBosses()).catch(() => {});
}

// ---------- запуск ----------

export async function startRouter() {
  history.scrollRestoration = 'manual';
  registerSheets();

  document.addEventListener('click', onClick);
  document.addEventListener('click', (event) => {
    const menu = document.querySelector('.nav__link--dropdown details');
    if (menu?.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const menu = document.querySelector('.nav__link--dropdown details');
      if (menu) menu.open = false;
    }
  });
  document.addEventListener('mouseover', (event) => {
    const link = event.target.closest?.('a[href]');
    if (link) prefetchLink(link);
  });
  document.addEventListener(
    'touchstart',
    (event) => {
      const link = event.target.closest?.('a[href]');
      if (link) prefetchLink(link);
    },
    { passive: true },
  );

  window.addEventListener('popstate', () => {
    navigate(new URL(location.href), {
      push: false,
      scrollY: history.state?.y ?? 0,
    });
  });

  // запоминаем прокрутку для кнопки «назад»
  let saveTimer = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (navigating) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(
        () => history.replaceState({ ...history.state, y: window.scrollY }, ''),
        150,
      );
    },
    { passive: true },
  );

  markNav();
  const page = getPage();
  const loadPage = pages[page?.dataset.page];
  if (loadPage) {
    current = await loadPage();
    await current.mount(page);
  }

  (window.requestIdleCallback ?? ((fn) => setTimeout(fn, 800)))(warmUp);
}
