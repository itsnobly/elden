const KEY = 'er:deaths';

function readCounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter(
        ([, value]) => Number.isInteger(value) && value >= 0,
      ),
    );
  } catch (error) {
    console.warn('Could not read the saved boss death counts.', error);
    return {};
  }
}

function writeCounts(counts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(counts));
  } catch (error) {
    console.warn('Could not save boss death counts.', error);
  }
}

function syncCounts(id, value) {
  document.querySelectorAll('[data-deaths-for]').forEach((counter) => {
    if (counter.dataset.deathsFor !== id) return;
    counter.textContent = String(value);
    const controls = counter.closest('[data-death-counter]');
    controls?.classList.toggle('has-deaths', value > 0);
    const decrement = controls?.querySelector('[data-death-change="-1"]');
    if (decrement) decrement.disabled = value === 0;
  });
}

export function getDeaths(id) {
  return readCounts()[id] || 0;
}

export function changeDeaths(id, delta) {
  if (!id || ![-1, 1].includes(delta)) {
    throw new TypeError('A boss id and a death-count change of -1 or 1 are required.');
  }

  const counts = readCounts();
  const next = Math.max(0, (counts[id] || 0) + delta);
  if (next) counts[id] = next;
  else delete counts[id];

  writeCounts(counts);
  syncCounts(id, next);
  return next;
}
