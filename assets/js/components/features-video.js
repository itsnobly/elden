// features-video.js — видео в рамках играют, пока блок виден на экране,
// и ставятся на паузу, когда он ушёл. Видео грузится только рядом с экраном.
// Видео всегда без звука (требование ТЗ), поэтому браузер разрешает автозапуск.
// initFeatures() вызывается при каждом заходе на главную и возвращает очистку.

export function initFeatures() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const videos = document.querySelectorAll('.kf__video');
  const items = document.querySelectorAll('.kf__item');
  const observers = [];

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
  });

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

  function playVideo(video) {
    if (reduceMotion || !video.dataset.loaded || !video.paused) return;
    video.play().catch((error) => {
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        console.error('Не удалось воспроизвести видео карточки:', error);
      }
    });
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
          if (!entry.isIntersecting) return;
          const video = entry.target;
          loadVideo(video);
          preload.unobserve(video);

          const bounds = video.getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
          );
          if (bounds.height && visibleHeight / bounds.height >= 0.35) playVideo(video);
        });
      },
      {
        rootMargin: navigator.connection?.saveData ? '0px' : '350px 0px',
        threshold: 0,
      },
    );

    const playback = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35 && !reduceMotion) {
            playVideo(video);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 },
    );

    videos.forEach((video) => {
      preload.observe(video);
      playback.observe(video);
    });
    observers.push(preload, playback);
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
