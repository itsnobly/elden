/*
 * home-page.js — запускает всё, что нужно главной странице.
 * Вызывается router при заходе на главную (в том числе при возврате на неё).
 */
import { initHero } from '../modules/hero-video.js';
import { initFeatures } from '../components/features-video.js';
import { initQuotes } from '../components/quotes.js';
import { initPlay } from '../components/play.js';

let cleanups = [];

export function mount() {
  cleanups = [
    initHero(),
    initFeatures(),
    initQuotes(),
    initPlay(),
    initReleaseCarousel(),
  ].filter((fn) => typeof fn === 'function');
}

export function unmount() {
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}

function initReleaseCarousel() {
  const carousel = document.querySelector('[data-release-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('[data-release-slide]')];
  const dots = [...carousel.querySelectorAll('[data-slide-to]')];
  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains('is-active')),
  );
  let timer;
  let touchStartX = null;

  const pause = () => {
    window.clearTimeout(timer);
    timer = undefined;
  };

  const schedule = () => {
    pause();
    if (
      reducedMotion.matches ||
      document.hidden ||
      carousel.matches(':hover') ||
      carousel.contains(document.activeElement)
    ) {
      return;
    }

    timer = window.setTimeout(() => {
      showSlide(activeIndex + 1);
    }, 6500);
  };

  const render = () => {
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, index) => {
      const active = index === activeIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    render();
    schedule();
  };

  const onClick = (event) => {
    const dot = event.target.closest('[data-slide-to]');
    if (dot && carousel.contains(dot)) {
      showSlide(Number(dot.dataset.slideTo));
      return;
    }

    const action = event.target.closest('[data-slide-action]')?.dataset.slideAction;
    if (action === 'previous') showSlide(activeIndex - 1);
    if (action === 'next') showSlide(activeIndex + 1);
  };
  const onPointerDown = (event) => {
    touchStartX = event.pointerType === 'touch' ? event.clientX : null;
  };
  const onPointerUp = (event) => {
    if (touchStartX === null) return;
    const distance = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 50) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  };
  const onPointerCancel = () => {
    touchStartX = null;
  };
  const onFocusIn = pause;
  const onFocusOut = (event) => {
    if (!carousel.contains(event.relatedTarget)) schedule();
  };
  const onVisibilityChange = schedule;
  const onReducedMotionChange = schedule;

  carousel.addEventListener('click', onClick);
  carousel.addEventListener('pointerdown', onPointerDown);
  carousel.addEventListener('pointerup', onPointerUp);
  carousel.addEventListener('pointercancel', onPointerCancel);
  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', schedule);
  carousel.addEventListener('focusin', onFocusIn);
  carousel.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onReducedMotionChange);

  render();
  schedule();

  return () => {
    pause();
    carousel.removeEventListener('click', onClick);
    carousel.removeEventListener('pointerdown', onPointerDown);
    carousel.removeEventListener('pointerup', onPointerUp);
    carousel.removeEventListener('pointercancel', onPointerCancel);
    carousel.removeEventListener('mouseenter', pause);
    carousel.removeEventListener('mouseleave', schedule);
    carousel.removeEventListener('focusin', onFocusIn);
    carousel.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.removeEventListener('change', onReducedMotionChange);
  };
}
