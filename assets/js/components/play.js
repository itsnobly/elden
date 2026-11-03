// play.js — трейлер на главной: клик по карточке запускает видео, повторный клик останавливает.
// initPlay() вызывается при каждом заходе на главную.
export function initPlay() {
  const trailerCard = document.getElementById('trailerCard');
  const poster = document.getElementById('trailerPoster');
  const playBtn = document.getElementById('playBtn');
  const iframe = document.getElementById('ytPlayer');

  if (!trailerCard || !iframe) return;

  let isPlaying = false;

  const baseUrl = iframe.dataset.src;
  const params = '?controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1';

  const onClick = () => {
    isPlaying = !isPlaying;

    // Постер и кнопка Play: прячем при запуске, возвращаем при остановке
    if (poster) {
      poster.style.opacity = isPlaying ? '0' : '1';
      poster.style.pointerEvents = isPlaying ? 'none' : 'auto';
    }
    if (playBtn) playBtn.style.display = isPlaying ? 'none' : 'flex';

    iframe.src = isPlaying
      ? `${baseUrl}${params}&autoplay=1`
      : 'about:blank';
  };
  trailerCard.addEventListener('click', onClick);

  return () => {
    trailerCard.removeEventListener('click', onClick);
    iframe.src = 'about:blank';
  };
}
