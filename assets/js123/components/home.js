// home.js — слайдер локаций, карточки «Расширения», появление секций при скролле.
// Данные берём из JSON: Vite кладёт его прямо в сборку, внешний API не нужен.
import content from '../../../data/home-slides.json';

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

/* ---------- безопасная сборка узлов (без innerHTML из данных) ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ---------- Слайдер ---------- */
function initSlider() {
  const root = document.getElementById('realmsSlider');
  if (!root) return;

  const delay = 6500;
  const slides = content.slides;
  const track = el('div', 'slider__track');
  const dots = el('div', 'slider__dots');
  const progress = el('div', 'slider__progress');
  progress.style.setProperty('--slide-delay', `${delay}ms`);

  slides.forEach((s, i) => {
    const slide = el('article', 'slide');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} / ${slides.length}: ${s.title}`);

    if (s.image) {
      slide.style.backgroundImage = `url("${s.image}")`;
    } else {
      slide.classList.add('slide--empty');
    }

    slide.appendChild(el('span', 'slide__symbol', s.symbol || '✧'));

    const body = el('div', 'slide__body');
    body.appendChild(el('span', 'slide__tag', s.tag));
    body.appendChild(el('h3', 'slide__title', s.title));
    body.appendChild(el('p', 'slide__text', s.text));
    slide.appendChild(body);
    track.appendChild(slide);

    const dot = el('button', 'slider__dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', s.title);
    dot.addEventListener('click', () => go(i, true));
    dots.appendChild(dot);
  });

  const prev = el('button', 'slider__arrow slider__arrow--prev');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous');
  prev.appendChild(el('span', '', '‹'));
  const next = el('button', 'slider__arrow slider__arrow--next');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next');
  next.appendChild(el('span', '', '›'));

  root.append(track, prev, next, dots, progress);
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.setAttribute('aria-label', 'Regions of the Lands Between');

  let index = 0;
  let timer = null;
  let hovering = false;

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    [...dots.children].forEach((d, i) =>
      d.classList.toggle('is-active', i === index),
    );
  }

  function restartProgress() {
    progress.classList.remove('is-running');
    void progress.offsetWidth; // перезапуск CSS-анимации
    if (!reduceMotion && !hovering) progress.classList.add('is-running');
  }

  function schedule() {
    clearTimeout(timer);
    if (reduceMotion || hovering) return;
    timer = setTimeout(() => go(index + 1), delay);
  }

  function go(i, user) {
    index = (i + slides.length) % slides.length;
    render();
    restartProgress();
    schedule();
    if (user) prev.blur();
  }

  prev.addEventListener('click', () => go(index - 1, true));
  next.addEventListener('click', () => go(index + 1, true));

  // пауза при наведении и фокусе
  const pause = () => {
    hovering = true;
    clearTimeout(timer);
    progress.classList.remove('is-running');
  };
  const resume = () => {
    hovering = false;
    restartProgress();
    schedule();
  };
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', resume);

  // клавиатура
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1, true);
    if (e.key === 'ArrowRight') go(index + 1, true);
  });

  // свайп пальцем
  let startX = null;
  track.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), true);
    startX = null;
  });

  // не крутим слайдер, пока вкладка скрыта
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer);
    } else if (!hovering) {
      restartProgress();
      schedule();
    }
  });

  render();
  restartProgress();
  schedule();
}

/* ---------- Расширения ---------- */
function initExpansions() {
  const grid = document.getElementById('expansionsGrid');
  if (!grid) return;

  content.expansions.forEach((x, i) => {
    const card = el(
      'article',
      `exp-card exp-card--${x.accent || 'gold'} reveal`,
    );
    card.style.transitionDelay = `${i * 120}ms`;

    const art = el('div', 'exp-card__art');
    if (x.image) art.style.backgroundImage = `url("${x.image}")`;
    art.appendChild(el('span', 'exp-card__badge', x.tag));

    const body = el('div', 'exp-card__body');
    body.appendChild(el('span', 'exp-card__date', x.date));
    body.appendChild(el('h3', 'exp-card__title', x.title));
    body.appendChild(el('p', 'exp-card__text', x.text));
    body.appendChild(el('div', 'exp-card__line'));

    card.append(art, body);
    grid.appendChild(card);
  });
}

/* ---------- Появление при скролле ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach((n) => n.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  items.forEach((n) => io.observe(n));
}

initSlider();
initExpansions(); // сначала собрать карточки, потом наблюдать за .reveal
initReveal();
