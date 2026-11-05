const API = 'https://eldenring.fanapis.com/api/bosses';
const CACHE_KEY = 'er:boss-images:v1';
const TTL = 7 * 24 * 60 * 60 * 1000;

// Локальные картинки
export const LOCAL_IMAGES = {
  'maliketh-the-black-blade': '/assets/img/bosses/malekhit.webp',
  'malenia-blade-of-miquella': '/assets/img/bosses/malenia.webp',
  'messmer-the-impaler': '/assets/img/bosses/messmer.webp',
  'bayle-the-dread': '/assets/img/bosses/Bayle_01.webp',
  'dragonlord-placidusax': '/assets/img/bosses/dragonKing.webp',
  'radagon-elden-beast': '/assets/img/bosses/radagon.webp',
  'starscourge-radahn': '/assets/img/bosses/radan.webp',
};

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, '');

// Картинки из API: имя -> url
let apiPromise;
function loadApiImages() {
  apiPromise ??= (async () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (saved && Date.now() - saved.time < TTL && saved.map) return saved.map;
    } catch {}
    const map = {};
    try {
      for (let page = 0; page < 10; page += 1) {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 8000);
        const res = await fetch(`${API}?limit=100&page=${page}`, {
          signal: ctl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) break;
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        list.forEach((b) => {
          if (
            b?.name &&
            typeof b.image === 'string' &&
            b.image.startsWith('https://')
          )
            map[norm(b.name)] = b.image;
        });
        if (list.length < 100) break;
      }
      if (Object.keys(map).length)
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ time: Date.now(), map }),
        );
    } catch {}
    return map;
  })();
  return apiPromise;
}

function findInApi(map, boss) {
  const names = String(boss.name_en ?? '')
    .split('/')
    .map(norm)
    .filter(Boolean);
  for (const n of names) if (map[n]) return map[n];
  for (const n of names) {
    if (n.length < 6) continue;
    const key = Object.keys(map).find(
      (k) => k.length >= 6 && (k.startsWith(n) || n.startsWith(k)),
    );
    if (key) return map[key];
  }
  return '';
}

// Сразу известная картинка (без сети)
export const bossImageNow = (boss) =>
  LOCAL_IMAGES[boss.id] ?? boss.media?.image ?? '';

// Дозаполняет <img data-boss-img="id"> без src картинками из API
export async function fillBossImages(container, byId) {
  const pending = [
    ...container.querySelectorAll('img[data-boss-img]:not([src])'),
  ];
  if (!pending.length) return;
  const map = await loadApiImages();
  pending.forEach((img) => {
    const boss = byId.get(img.dataset.bossImg);
    const url = boss ? findInApi(map, boss) : '';
    if (url && img.isConnected) {
      img.src = url;
      img.hidden = false;
    }
  });
}
