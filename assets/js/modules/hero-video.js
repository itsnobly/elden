const video = document.querySelector('.main__video');
const videoButtons = document.querySelectorAll('.grace-switcher__item');

const soundToggle = document.querySelector('.sound-toggle');
const soundText = document.querySelector('.sound-toggle__text');
const soundIcon = document.querySelector('.sound-toggle__icon');

const VIDEO_PATH = '/assets/video/';

const videos = ['elden-test-main.mp4', 'eldenfc3.mp4', 'eldenblue2.mp4'];

const themes = {
  'elden-test-main.mp4': 'gold',
  'eldenfc3.mp4': 'blood',
  'eldenblue2.mp4': 'frost',
};

let isManuallySelected = false;

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

// Переключение видео
async function switchVideo(videoName) {
  const newVideo = `${VIDEO_PATH}${videoName}`;

  // Не перезагружаем уже выбранное видео
  if (video.src.endsWith(newVideo)) return;

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

// Начальная настройка
video.loop = false;
updateSound();
