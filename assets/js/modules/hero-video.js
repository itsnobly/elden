/*
* hero-video.js — баннер главной: переключение видео, звук, тема сайта.
* Запускается из features/home-page.js при каждом заходе на главную.
*/
export function initHero() {
  const video = document.querySelector('.main__video');
  const videoButtons = document.querySelectorAll('.grace-switcher__item');

  const soundToggle = document.querySelector('.sound-toggle');
  const soundText = document.querySelector('.sound-toggle__text');
  const soundIcon = document.querySelector('.sound-toggle__icon');

  if (!video || !soundToggle) return; // страница без баннера

  const VIDEO_PATH = '/assets/video/';

  const videos = ['eldenfc3.mp4', 'eldenblue2.mp4'];
  const selectableVideos = [...videos, 'elden-test-main.mp4'];

  const themes = {
    'elden-test-main.mp4': 'gold',
    'eldenfc3.mp4': 'blood',
    'eldenblue2.mp4': 'frost',
  };

  const STORAGE_KEY = 'er:banner';

  let isManuallySelected = false;

  // Запоминаем выбранный баннер в браузере, чтобы при следующем заходе он остался
  function saveBanner(videoName) {
    try {
      localStorage.setItem(STORAGE_KEY, videoName);
    } catch {
      // приватный режим: просто не запомнится
    }
  }

  function readBanner() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return selectableVideos.includes(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  // Обновление кнопки звука
  function updateSound() {
    const isMuted = video.muted;
    const label = isMuted ? 'Включить звук' : 'Выключить звук';

    // Текст в кнопке сейчас закомментирован в HTML, поэтому проверяем, что он есть
    if (soundText) soundText.textContent = label;
    if (soundIcon) soundIcon.textContent = isMuted ? '♪' : '♫';

    soundToggle.setAttribute('aria-pressed', String(!isMuted));
    soundToggle.setAttribute('aria-label', label);
  }

  // Ждём, пока новое видео покажет первый кадр (но не дольше 1.5 с),
  // чтобы оно не проявилось чёрным
  function waitForFrame() {
    return new Promise((resolve) => {
      const done = () => {
        video.removeEventListener('loadeddata', done);
        resolve();
      };

      video.addEventListener('loadeddata', done);
      setTimeout(done, 1500);
    });
  }

  // Всё, что меняется при переключении: видео, кнопки, тема
  async function applyVideo(videoName, newVideo) {
    const wasMuted = video.muted;

    video.src = newVideo;
    video.muted = wasMuted;

    // Первое видео — заставка, остальные зациклены
    video.loop = videoName !== videos[0];

    video.load();

    // Обновляем активную кнопку
    videoButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.video === videoName);
    });

    document.documentElement.dataset.theme = themes[videoName] || 'gold';

    updateSound();

    await waitForFrame();
  }

  // Переключение видео вместе с темой.
  // Видео гаснет (0.3 с), пока под ним меняется видео, тема и кнопки,
  // и потом плавно проявляется. Это лёгкий эффект: страница целиком
  // не перерисовывается, поэтому ничего не лагает.
  async function switchVideo(videoName) {
    const newVideo = `${VIDEO_PATH}${videoName}`;

    // Не перезагружаем уже выбранное видео
    if (video.src.endsWith(newVideo)) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
      video.style.transition = 'opacity 0.3s ease';
      video.style.opacity = '0';
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    await applyVideo(videoName, newVideo);

    video.style.opacity = '1';

    try {
      await video.play();
    } catch (error) {
      console.error('Не удалось воспроизвести видео:', error);
    }
  }

  // Автоматическое переключение после заставки
  video.addEventListener('ended', () => {
    if (isManuallySelected) return;

    switchVideo(videos[1]);
  });

  // Ручное переключение видео
  videoButtons.forEach((button) => {
    button.addEventListener('click', () => {
      isManuallySelected = true;
      saveBanner(button.dataset.video);
      switchVideo(button.dataset.video);
    });
  });

  // Включение и выключение звука
  soundToggle.addEventListener('click', async () => {
    if (video.muted) {
      video.muted = false;

      try {
        await video.play();
      } catch (error) {
        video.muted = true;
        console.error('Не удалось включить звук:', error);
      }
    } else {
      video.muted = true;
    }

    updateSound();
  });

  // Видео подключается после первого отображения страницы, чтобы не задерживать контент.
  video.loop = false;
  updateSound();

  const savedBanner = readBanner();
  if (savedBanner) isManuallySelected = savedBanner !== videos[0];
  const initialVideo = savedBanner ?? videos[0];
  const startVideo = () => {
    applyVideo(initialVideo, `${VIDEO_PATH}${initialVideo}`).then(() => {
      video.play().catch((error) => {
        if (error.name !== 'NotAllowedError') {
          console.error('Не удалось воспроизвести видео:', error);
        }
      });
    });
  };
  const idleHandle = 'requestIdleCallback' in window
    ? window.requestIdleCallback(startVideo, { timeout: 2000 })
    : null;
  const fallbackTimer = idleHandle === null ? window.setTimeout(startVideo, 1200) : null;

  // при уходе с главной видео обязательно ставим на паузу (иначе играет звук)
  return () => {
    if (idleHandle !== null) window.cancelIdleCallback(idleHandle);
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    video.pause();
  };
}
