// nav-current.js — подсвечивает пункт меню текущей страницы.
// Страницы одного раздела (список боссов и страница босса) подсвечивают один пункт.
const folder = (path) => path.slice(0, path.lastIndexOf('/'));

export function markNav() {
  const path = location.pathname;

  document.querySelectorAll('.nav__link a').forEach((link) => {
    const sameSection =
      folder(link.pathname) === folder(path) && !['', '/pages'].includes(folder(path));
    if (link.pathname === path || sameSection) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
