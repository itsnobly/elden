import { getLang } from '../utils/i18n.js';

// quotes.js — бегущая лента с цитатами. initQuotes() вызывается при заходе на главную.
export function initQuotes() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  const controller = new AbortController();
  let quotes = [];

  const render = () => {
    if (!track.isConnected || !quotes.length) return;
    const language = getLang();
    const doubleQuotes = [...quotes, ...quotes];

    track.innerHTML = doubleQuotes
      .map(
        (item) => {
          const author = language === 'ru' ? (item.character_ru || item.character) : item.character;
          const quote = language === 'ru' ? (item.quote_ru || item.quote_en) : item.quote_en;
          return `
      <div class="marquee__item">
        <span class="marquee__quote">“${quote}”</span>
        <span class="marquee__author">— ${author}</span>
        <span class="marquee__divider">◆</span>
      </div>
    `;
        },
      )
      .join('');
  };

  const onLanguageChange = () => render();
  window.addEventListener('lang-change', onLanguageChange);

  fetch('/data/quotesBoss.json', { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error(`Quotes request failed with HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Unexpected quotes response');
      quotes = data;
      render();
    })
    .catch((error) => {
      if (error.name !== 'AbortError') console.error('Could not load quotes.', error);
    });

  return () => {
    controller.abort();
    window.removeEventListener('lang-change', onLanguageChange);
  };
}
