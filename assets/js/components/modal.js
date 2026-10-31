const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal__close-btn');
const open = document.getElementById('open__modal');

const openModal = () => {
  modal.classList.add('open__modal-active');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  modal.classList.remove('open__modal-active');
  document.body.style.overflow = '';
};

open.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Открытие при прокрутке до конца страницы
const handleScroll = () => {
  const scrollY = Math.ceil(window.scrollY + window.innerHeight);
  const heightEnd = document.documentElement.scrollHeight;

  if (scrollY >= heightEnd - 10) {
    openModal();
    window.removeEventListener('scroll', handleScroll);
  }
};

window.addEventListener('scroll', handleScroll);

// Открытие через 10 секунд
setTimeout(openModal, 10000);

// game-modal
const gameModal = document.getElementById('game-modal');
const gameOpen = document.getElementById('open-game-modal');
const gameClose = document.getElementById('game-modal-close');

const openSocialLinks = () => {
  gameModal?.classList.add('open__modal-active');
  document.body.style.overflow = 'hidden';
};

const closeSocialLinks = () => {
  gameModal?.classList.remove('open__modal-active');
  document.body.style.overflow = '';
};

gameOpen?.addEventListener('click', (event) => {
  event.preventDefault();
  openSocialLinks();
});

gameClose?.addEventListener('click', closeSocialLinks);

gameModal?.addEventListener('click', (event) => {
  if (event.target === gameModal) {
    closeSocialLinks();
  }
});
