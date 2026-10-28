// Личный счётчик смертей от каждого босса, хранится в браузере
const KEY = 'er:deaths';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // приватный режим: счётчик просто не сохранится
  }
}

export function getDeaths(id) {
  return read()[id] || 0;
}

// Обновляет число везде, где оно показано: на карточке и в окне
export function syncDeathsUI(id, value) {
  const safeId = CSS.escape(id);

  document.querySelectorAll(`[data-deaths-for="${safeId}"]`).forEach((el) => {
    el.textContent = value;
  });

  document.querySelectorAll(`.boss-card[data-id="${safeId}"]`).forEach((card) => {
    card.classList.toggle('has-deaths', value > 0);
  });
}

export function changeDeaths(id, delta) {
  const data = read();
  const next = Math.max(0, (data[id] || 0) + delta);

  if (next) data[id] = next;
  else delete data[id];

  write(data);
  syncDeathsUI(id, next);

  return next;
}
