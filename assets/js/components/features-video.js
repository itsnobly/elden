// features-video.js — видео в рамках играют, пока блок виден на экране,
// и ставятся на паузу, когда он ушёл. Видео грузится только рядом с экраном.
// Видео всегда без звука (требование ТЗ), поэтому браузер разрешает автозапуск.
// initFeatures() вызывается при каждом заходе на главную и возвращает очистку.

export function initFeatures() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const videos = document.querySelectorAll('.kf__video');
  const items = document.querySelectorAll('.kf__item');
  const observers = [];

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
    observers.push(reveal);
  } else {
    items.forEach((n) => n.classList.add('is-visible'));
  }

  /* Подключаем видео только когда пользователь действительно до него доскроллил. */
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
    const playback = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            loadVideo(video);
            if (reduceMotion) return;
            // play() может быть отклонён (экономия батареи и т.п.): тихо игнорируем
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: '0px', threshold: 0.45 },
    );

    videos.forEach((v) => {
      playback.observe(v);
    });
    observers.push(playback);
  } else {
    videos.forEach((video) => {
      video.controls = true;
      loadVideo(video);
    });
  }

  // если вкладку свернули — пауза, вернулись — продолжит наблюдатель при следующем скролле
  const onVisibility = () => {
    if (document.hidden) videos.forEach((v) => v.pause());
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    observers.forEach((observer) => observer.disconnect());
    document.removeEventListener('visibilitychange', onVisibility);
    videos.forEach((v) => v.pause());
  };
}
