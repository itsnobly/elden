// Страницы считаются от 0, на кнопках показываются от 1

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const near = new Set([0, current - 1, current, current + 1, total - 1]);

  // в начале и в конце показываем сразу по четыре страницы
  if (current < 3) [0, 1, 2, 3].forEach((page) => near.add(page));
  if (current > total - 4) [4, 3, 2, 1].forEach((n) => near.add(total - n));

  const wanted = [...near]
    .filter((page) => page >= 0 && page < total)
    .sort((a, b) => a - b);

  const result = [];
  wanted.forEach((page, index) => {
    if (index && page - wanted[index - 1] > 1) result.push('…');
    result.push(page);
  });

  return result;
}

export function initPagination(container, onChange) {
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');

    if (button && !button.disabled) onChange(Number(button.dataset.page));
  });

  return function render({ page, totalPages }) {
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const pages = pageNumbers(page, totalPages)
      .map((item) =>
        item === '…'
          ? '<span class="pagination__dots">…</span>'
          : `<button type="button" data-page="${item}" class="${item === page ? 'active' : ''}" ${item === page ? 'aria-current="page"' : ''}>${item + 1}</button>`,
      )
      .join('');

    container.innerHTML = `
      <button type="button" data-page="${page - 1}" aria-label="Назад" ${page === 0 ? 'disabled' : ''}>←</button>
      <div class="pagination__pages">${pages}</div>
      <button type="button" data-page="${page + 1}" aria-label="Вперёд" ${page === totalPages - 1 ? 'disabled' : ''}>→</button>
    `;
  };
}
