// nav-current.js — подсвечивает пункт меню текущей страницы.
// Страницы одного раздела (список боссов и страница босса) подсвечивают один пункт.
import { t } from '../utils/i18n.js';

const folder = (path) => path.slice(0, path.lastIndexOf('/'));

function setupMobileNavigation() {
  const nav = document.querySelector('.header__nav');
  const toggle = nav?.querySelector('.header__menu-toggle');
  const links = nav?.querySelector('.header__nav-links');
  if (!nav || !toggle || !links || toggle.dataset.menuBound) return;

  const closeMenu = () => {
    nav.classList.remove('header__nav--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t('Open navigation menu'));
  };
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('header__nav--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute(
      'aria-label',
      isOpen ? t('Close navigation menu') : t('Open navigation menu'),
    );
  };

  toggle.dataset.menuBound = 'true';
  toggle.addEventListener('click', toggleMenu);
  links.addEventListener('click', (event) => {
    if (event.target.closest('a, [data-open-contact]')) closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

export function markNav() {
  setupMobileNavigation();
  const path = location.pathname;

  document
    .querySelectorAll('.header__nav-links > .nav__link > a')
    .forEach((link) => {
      const sameSection =
        folder(link.pathname) === folder(path) &&
        !['', '/pages'].includes(folder(path));
      const guidePage =
        link.pathname === '/pages/guide.html' &&
        path.startsWith('/pages/guide/');
      const bossPage =
        link.pathname === '/pages/bosses/bosses.html' &&
        path.startsWith('/pages/bosses/');
      if (link.pathname === path || sameSection || guidePage || bossPage)
        link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

  const database = document.querySelector('.nav__link--dropdown summary');
  if (database) {
    const active = path === '/pages/arsenal.html';
    const menu = database.closest('details');
    if (active) database.setAttribute('aria-current', 'page');
    else database.removeAttribute('aria-current');
    if (menu) menu.open = false;
  }
}
