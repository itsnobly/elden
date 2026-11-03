document.querySelectorAll('.nav__link a').forEach((link) => {
  if (link.pathname === window.location.pathname) {
    link.setAttribute('aria-current', 'page');
  }
});
