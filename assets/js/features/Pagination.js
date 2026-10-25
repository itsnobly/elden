import { getBosses } from '../modules/characters.js';
import { createBossCard } from '../components/CharacterCard.js';

const paginationPages = document.querySelector('.pagination__pages');
const prevButton = document.querySelector('.pagination__prev');
const nextButton = document.querySelector('.pagination__next');

let currentPage = 0;
const totalPages = 5;

async function paginationCard(page) {
  try {
    const bosses = await getBosses(page);

    if (!bosses) return;

    createBossCard(bosses);
    currentPage = page;

    paginationPages.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.page) === page);
    });

    prevButton.disabled = page === 0;
    nextButton.disabled = page === totalPages - 1;
  } catch (error) {
    console.error(error);
  }
}

paginationPages.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (button) paginationCard(Number(button.dataset.page));
});

prevButton.addEventListener('click', () => {
  if (currentPage > 0) paginationCard(currentPage - 1);
});

nextButton.addEventListener('click', () => {
  if (currentPage < totalPages - 1) paginationCard(currentPage + 1);
});

paginationCard(0);
