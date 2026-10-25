const bossesGrid = document.querySelector('.bosses__grid');

export function createBossCard(bosses) {
  if (!bosses || !bossesGrid) return;

  bosses = bosses.filter(
    (boss, index, self) =>
      index === self.findIndex((item) => item.id === boss.id),
  );

  bossesGrid.innerHTML = bosses
    .map(
      (boss) => `
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
      `,
    )
    .join('');
}
