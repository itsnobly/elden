// modal.js — модалки «Contact» и «Where to buy». Модалки лежат вне #page и
// не перерисовываются, поэтому подключаются один раз. Кнопка «Shop now» есть
// только на главной, поэтому слушаем клики на всём документе.
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal__close-btn');
const open = document.getElementById('open__modal');
const gameModal = document.getElementById('game-modal');
const gameClose = document.getElementById('game-modal-close');

const anyModalOpen = () =>
  modal?.classList.contains('open__modal-active') ||
  gameModal?.classList.contains('open__modal-active');

const syncBodyScroll = () => {
  document.body.style.overflow = anyModalOpen() ? 'hidden' : '';
};

const closeModal = () => {
  modal?.classList.remove('open__modal-active');
  syncBodyScroll();
};

const closeSocialLinks = () => {
  gameModal?.classList.remove('open__modal-active');
  syncBodyScroll();
};

const openModal = () => {
  gameModal?.classList.remove('open__modal-active');
  modal?.classList.add('open__modal-active');
  syncBodyScroll();
};

open?.addEventListener('click', openModal);
modalClose?.addEventListener('click', closeModal);

modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

const openSocialLinks = () => {
  modal?.classList.remove('open__modal-active');
  gameModal?.classList.add('open__modal-active');
  syncBodyScroll();
};

// «Shop now» живёт внутри #page, поэтому ловим клик на документе
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('#open-game-modal')) return;
  event.preventDefault();
  openSocialLinks();
});

gameClose?.addEventListener('click', closeSocialLinks);

gameModal?.addEventListener('click', (event) => {
  if (event.target === gameModal) {
    closeSocialLinks();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeModal();
  closeSocialLinks();
});
