import { getBosses } from '../modules/characters';

const createCardBoses = (bosses) => {
  return bosses
    .map((boss) => {
      return `
        <article class="boss-card">
          <div class="boss-card__image-wrapper">
            <img
              class="boss-card__image"
              src="${boss.image || ''}"
              alt="${boss.name}"
              loading="lazy"
            >
          </div>

          <div class="boss-card__content">
            <h3 class="boss-card__title">${boss.name}</h3>
            <p class="boss-card__description">
              ${boss.description || 'No description available.'}
            </p>
            <button class="boss-card__button">Discover</button>
          </div>
        </article>
      `;
    })
    .join('');
};

getBosses().then((bosses) => {
  const bossesContainer = document.querySelector('.bosses__grid');

  if (bossesContainer) {
    bossesContainer.innerHTML = createCardBoses(bosses);
  }
});
