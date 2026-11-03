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
  cleanups = [initHero(), initFeatures(), initQuotes(), initPlay()].filter((fn) => typeof fn === 'function');
}

export function unmount() {
  cleanups.forEach((cleanup) => cleanup());
  cleanups = [];
}
