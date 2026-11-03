// play.js — трейлер на главной: клик по карточке запускает видео, повторный клик останавливает.
// initPlay() вызывается при каждом заходе на главную.
export function initPlay() {
  const trailerCard = document.getElementById('trailerCard');
  const poster = document.getElementById('trailerPoster');
  const playBtn = document.getElementById('playBtn');
  const iframe = document.getElementById('ytPlayer');

  if (!trailerCard || !iframe) return;

  let isPlaying = false;

  // Получаем базовый URL iframe без параметров автозапуска
  const baseUrl = iframe.src.split('?')[0];
  const params =
    '?enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1';

  trailerCard.addEventListener('click', () => {
    isPlaying = !isPlaying;

    // Постер и кнопка Play: прячем при запуске, возвращаем при остановке
    if (poster) {
      poster.style.opacity = isPlaying ? '0' : '1';
      poster.style.pointerEvents = isPlaying ? 'none' : 'auto';
    }
    if (playBtn) playBtn.style.display = isPlaying ? 'none' : 'flex';

    // Перезагрузка iframe полностью сбрасывает видео
    iframe.src = baseUrl + params + (isPlaying ? '&autoplay=1' : '');
  });
}
