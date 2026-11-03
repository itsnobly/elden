// quotes.js — бегущая лента с цитатами. initQuotes() вызывается при заходе на главную.
export async function initQuotes() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  try {
    const response = await fetch('/data/quotesBoss.json');
    const quotes = await response.json();

    // Дублируем массив для бесшовной анимации
    const doubleQuotes = [...quotes, ...quotes];

    track.innerHTML = doubleQuotes
      .map(
        (item) => `
      <div class="marquee__item">
        <span class="marquee__quote">“${item.quote_en}”</span>
        <span class="marquee__author">— ${item.character}</span>
        <span class="marquee__divider">◆</span>
      </div>
    `,
      )
      .join('');
  } catch (error) {
    console.error('Ошибка загрузки цитат:', error);
  }
}
