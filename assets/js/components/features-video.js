// features-video.js — видео в рамках играют, пока блок виден на экране,
// и ставятся на паузу, когда он ушёл. Видео грузится только рядом с экраном.
// Видео всегда без звука (требование ТЗ), поэтому браузер разрешает автозапуск.

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

const videos = document.querySelectorAll('.kf__video');
const items = document.querySelectorAll('.kf__item');

/* Появление блоков */
if ('IntersectionObserver' in window && !reduceMotion) {
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  items.forEach((n) => reveal.observe(n));
} else {
  items.forEach((n) => n.classList.add('is-visible'));
}

/* Подгрузка: ставим src только когда видео подъехало ближе чем на 400px */
function loadVideo(video) {
  if (video.dataset.loaded) return;
  const src = video.dataset.src;
  if (!src) return;
  video.src = src;
  video.dataset.loaded = '1';
  video.load();
}

/* Если пользователь просит меньше анимации — не запускаем сами, даём кнопки управления */
if (reduceMotion) {
  videos.forEach((v) => {
    v.controls = true;
    v.removeAttribute('autoplay');
  });
}

if ('IntersectionObserver' in window) {
  const preload = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadVideo(entry.target);
          preload.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '400px 0px' },
  );

  const playback = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (reduceMotion) return;
        if (entry.isIntersecting) {
          loadVideo(video);
          // play() может быть отклонён (экономия батареи и т.п.): тихо игнорируем
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.45 },
  );

  videos.forEach((v) => {
    preload.observe(v);
    playback.observe(v);
  });
} else {
  videos.forEach(loadVideo);
}

// если вкладку свернули — пауза, вернулись — продолжит наблюдатель при следующем скролле
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach((v) => v.pause());
});
