document.addEventListener('DOMContentLoaded', () => {
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  if (!scrollTopBtn) return;

  // Показываем кнопку, если страница прокручена вниз более чем на 300px
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('scroll-top--show');
    } else {
      scrollTopBtn.classList.remove('scroll-top--show');
    }
  });

  // Плавная прокрутка на самый верх при клике
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
});
