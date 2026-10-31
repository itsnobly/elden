document.addEventListener('DOMContentLoaded', () => {
  const trailerCard = document.getElementById('trailerCard');
  const poster = document.getElementById('trailerPoster');
  const playBtn = document.getElementById('playBtn');
  const iframe = document.getElementById('ytPlayer');

  if (trailerCard && iframe) {
    let isPlaying = false;

    // Получаем базовый URL iframe без параметров автозапуска
    const baseUrl = iframe.src.split('?')[0];

    trailerCard.addEventListener('click', () => {
      if (!isPlaying) {
        // ВКЛЮЧИТЬ ВИДЕО
        isPlaying = true;

        // Прячем постер и кнопку
        if (poster) {
          poster.style.opacity = '0';
          poster.style.pointerEvents = 'none';
        }
        if (playBtn) {
          playBtn.style.display = 'none';
        }

        // Запускаем с autoplay=1
        iframe.src =
          baseUrl +
          '?enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&autoplay=1';
      } else {
        // ОСТАНОВИТЬ ВИДЕО (перезагружаем iframe, сбрасывая его состояние)
        isPlaying = false;

        // Показываем обратно постер и кнопку
        if (poster) {
          poster.style.opacity = '1';
          poster.style.pointerEvents = 'auto';
        }
        if (playBtn) {
          playBtn.style.display = 'flex';
        }

        // Очищаем src, чтобы видео полностью остановилось и закрылось
        iframe.src =
          baseUrl +
          '?enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1';
      }
    });
  }
});
