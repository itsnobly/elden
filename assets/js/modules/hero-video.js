/*
* hero-video.js — баннер главной: переключение видео, звук, тема сайта.
* Запускается из features/home-page.js при каждом заходе на главную.
*/
export function initHero() {
  let video = document.querySelector('.main__video');
  const videoButtons = document.querySelectorAll('.grace-switcher__item');

  const soundToggle = document.querySelector('.sound-toggle');
  const soundText = document.querySelector('.sound-toggle__text');
  const soundIcon = document.querySelector('.sound-toggle__icon');

  if (!video || !soundToggle) return; // страница без баннера

  let standbyVideo;
  let videoRequest = 0;
  let cancelPendingLoad = null;

  standbyVideo = video.cloneNode(false);
  standbyVideo.removeAttribute('poster');
  standbyVideo.removeAttribute('src');
  standbyVideo.muted = true;
  standbyVideo.setAttribute('aria-hidden', 'true');
  standbyVideo.classList.add('is-hidden');
  video.parentElement.insertBefore(standbyVideo, video.nextSibling);

  const VIDEO_PATH = '/assets/video/';

  const videos = ['eldenfc3.mp4', 'elden-test-main.mp4', 'eldenblue2.mp4'];
  const automaticNextVideo = 'eldenblue2.mp4';
  const themes = {
    'elden-test-main.mp4': 'gold',
    'eldenfc3.mp4': 'blood',
    'eldenblue2.mp4': 'frost',
  };

  const STORAGE_KEY = 'er:banner';

  let isManuallySelected = false;
  let isActive = true;
  let idleHandle = null;
  let startupTimer = null;

  const cancelStartup = () => {
    if (idleHandle !== null) window.cancelIdleCallback(idleHandle);
    if (startupTimer !== null) window.clearTimeout(startupTimer);
    idleHandle = null;
    startupTimer = null;
  };

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
      return videos.includes(saved) ? saved : null;
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

  function updateVideoSelection(videoName) {
    videoButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.video === videoName);
    });

    document.documentElement.dataset.theme = themes[videoName] || 'gold';

    updateSound();
  }

  function waitForFrame(candidate) {
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        candidate.removeEventListener('loadeddata', onLoaded);
        candidate.removeEventListener('error', onError);
        if (cancelPendingLoad === cancel) cancelPendingLoad = null;
        if (error) reject(error);
        else resolve();
      };
      const onLoaded = () => finish();
      const onError = () => finish(new Error(`Failed to load video: ${candidate.currentSrc}`));
      const cancel = () => finish();

      if (candidate.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve();
        return;
      }

      cancelPendingLoad = cancel;
      candidate.addEventListener('loadeddata', onLoaded, { once: true });
      candidate.addEventListener('error', onError, { once: true });
    });
  }

  async function switchVideo(videoName) {
    const newVideo = `${VIDEO_PATH}${videoName}`;
    if (video.src.endsWith(newVideo)) return;
    cancelStartup();
    const request = ++videoRequest;
    cancelPendingLoad?.();

    const candidate = standbyVideo;
    candidate.pause();
    candidate.muted = video.muted;
    candidate.loop = videoName !== videos[0];
    candidate.classList.add('is-hidden');
    candidate.src = newVideo;
    const frameReady = waitForFrame(candidate);
    candidate.load();

    try {
      await frameReady;
      if (!isActive || request !== videoRequest) return;
      candidate.muted = video.muted;
      await candidate.play();
    } catch (error) {
      if (
        request === videoRequest &&
        error.name !== 'AbortError' &&
        error.name !== 'NotAllowedError'
      ) {
        console.error('Не удалось воспроизвести видео:', error);
      }
      return;
    }

    if (!isActive || request !== videoRequest) {
      candidate.pause();
      return;
    }

    const previousVideo = video;
    previousVideo.removeEventListener('ended', onEnded);
    video = candidate;
    standbyVideo = previousVideo;
    video.addEventListener('ended', onEnded);
    updateVideoSelection(videoName);
    video.classList.remove('is-hidden');
    standbyVideo.classList.add('is-hidden');
    standbyVideo.pause();
  }

  // Автоматическое переключение после заставки
  const onEnded = () => {
    if (isManuallySelected) return;

    void switchVideo(automaticNextVideo);
  };
  video.addEventListener('ended', onEnded);

  // Ручное переключение видео
  const onVideoButtonClick = (event) => {
    isManuallySelected = true;
    saveBanner(event.currentTarget.dataset.video);
    void switchVideo(event.currentTarget.dataset.video);
  };
  videoButtons.forEach((button) => {
    button.addEventListener('click', onVideoButtonClick);
  });

  // Включение и выключение звука
  const onSoundToggle = async () => {
    if (video.muted) {
      video.muted = false;

      try {
        await video.play();
      } catch (error) {
        video.muted = true;
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.error('Не удалось включить звук:', error);
        }
      }
    } else {
      video.muted = true;
    }

    updateSound();
  };
  soundToggle.addEventListener('click', onSoundToggle);

  const savedBanner = readBanner();
  if (savedBanner) isManuallySelected = savedBanner !== videos[0];
  const initialVideo = savedBanner ?? videos[0];
  video.loop = initialVideo !== videos[0];
  updateVideoSelection(initialVideo);
  const startVideo = () => {
    idleHandle = null;
    startupTimer = null;
    if (!isActive || isManuallySelected) return;
    video.src = `${VIDEO_PATH}${initialVideo}`;
    video.load();
    video.play().catch((error) => {
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        console.error('Не удалось воспроизвести видео:', error);
      }
    });
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  if (!reduceMotion && !saveData) {
    startupTimer = window.setTimeout(() => {
      startupTimer = null;
      if ('requestIdleCallback' in window) {
        idleHandle = window.requestIdleCallback(startVideo, { timeout: 1500 });
      } else {
        startVideo();
      }
    }, 800);
  }

  // при уходе с главной видео обязательно ставим на паузу (иначе играет звук)
  return () => {
    isActive = false;
    videoRequest += 1;
    cancelStartup();
    cancelPendingLoad?.();
    video.removeEventListener('ended', onEnded);
    videoButtons.forEach((button) => {
      button.removeEventListener('click', onVideoButtonClick);
    });
    soundToggle.removeEventListener('click', onSoundToggle);
    video.pause();
    standbyVideo.pause();
  };
}
