// up.js — кнопка «наверх». Кнопка лежит в футере, который не перерисовывается,
// поэтому достаточно один раз повесить обработчики.
const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
  // Показываем кнопку, если страница прокручена вниз более чем на 300px
  window.addEventListener(
    'scroll',
    () => scrollTopBtn.classList.toggle('scroll-top--show', window.scrollY > 300),
    { passive: true },
  );

  // Плавная прокрутка на самый верх при клике
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
