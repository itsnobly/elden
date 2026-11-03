import { getLang } from '../utils/i18n.js';

const TRACKS = [
  { title: 'Elden Ring', area: 'Title theme', group: 'base', mood: 'boss' },
  { title: 'Limgrave', area: 'Limgrave', group: 'base', mood: 'world' },
  { title: 'The Final Battle', area: 'Final encounter', group: 'base', mood: 'boss' },
  { title: 'Elden Beast', area: 'Final encounter', group: 'base', mood: 'boss' },
  { title: 'Roundtable Hold', area: 'Roundtable Hold', group: 'base', mood: 'world' },
  { title: 'Crumbling Farum Azula', area: 'Crumbling Farum Azula', group: 'base', mood: 'world' },
  { title: 'Ranni the Witch', area: 'Three Sisters', group: 'base', mood: 'world' },
  { title: 'Liurnia of the Lakes', area: 'Liurnia', group: 'base', mood: 'world' },
  { title: 'Raya Lucaria Academy', area: 'Liurnia', group: 'base', mood: 'world' },
  { title: 'Caelid', area: 'Caelid', group: 'base', mood: 'world' },
  { title: 'Starscourge Radahn', area: 'Redmane Castle', group: 'base', mood: 'boss' },
  { title: 'Altus Plateau', area: 'Altus Plateau', group: 'base', mood: 'world' },
  { title: 'Leyndell, Royal Capital', area: 'Leyndell', group: 'base', mood: 'world' },
  { title: 'Morgott, the Omen King', area: 'Leyndell', group: 'base', mood: 'boss' },
  { title: 'Godfrey, First Elden Lord', area: 'Leyndell', group: 'base', mood: 'boss' },
  { title: 'Mountaintops of the Giants', area: 'Mountaintops', group: 'base', mood: 'world' },
  { title: 'Fire Giant', area: 'Mountaintops', group: 'base', mood: 'boss' },
  { title: 'Mohg, Lord of Blood', area: 'Mohgwyn Palace', group: 'base', mood: 'boss' },
  { title: 'Malenia, Blade of Miquella', area: 'Elphael', group: 'base', mood: 'boss' },
  { title: 'Godskin Apostles', area: 'Divine Tower of Caelid', group: 'base', mood: 'boss' },
  { title: 'Lichdragon Fortissax', area: 'Deeproot Depths', group: 'base', mood: 'boss' },
  { title: 'Song of Lament', area: 'Weeping Peninsula', group: 'base', mood: 'world' },
  { title: 'Shadow of the Erdtree', area: 'Land of Shadow', group: 'dlc', mood: 'world' },
  { title: 'The Land of Shadow', area: 'Land of Shadow', group: 'dlc', mood: 'world' },
  { title: 'Belurat, Tower Settlement', area: 'Gravesite Plain', group: 'dlc', mood: 'world' },
  { title: 'Divine Beast Dancing Lion', area: 'Belurat', group: 'dlc', mood: 'boss' },
  { title: 'Rellana, Twin Moon Knight', area: 'Castle Ensis', group: 'dlc', mood: 'boss' },
  { title: 'Shadow Keep', area: 'Scadu Altus', group: 'dlc', mood: 'world' },
  { title: 'Messmer the Impaler', area: 'Shadow Keep', group: 'dlc', mood: 'boss' },
  { title: 'Romina, Saint of the Bud', area: 'Church of the Bud', group: 'dlc', mood: 'boss' },
  { title: 'The Saint of the Bud', area: 'Church of the Bud', group: 'dlc', mood: 'boss' },
  { title: 'Midra, Lord of Frenzied Flame', area: 'Abyssal Woods', group: 'dlc', mood: 'boss' },
  { title: 'Bayle the Dread', area: 'Jagged Peak', group: 'dlc', mood: 'boss' },
  { title: 'The Promised Consort', area: 'Enir-Ilim', group: 'dlc', mood: 'boss' },
  { title: 'The Promised Consort Radahn', area: 'Enir-Ilim', group: 'dlc', mood: 'boss' },
  { title: 'Scadutree Avatar', area: 'Scadutree Base', group: 'dlc', mood: 'boss' },
  { title: 'St. Trina', area: 'Stone Coffin Fissure', group: 'dlc', mood: 'world' },
  { title: 'Shaman Village', area: 'Hinterland', group: 'dlc', mood: 'world' },
  { title: 'Those United in Common Cause', area: 'Enir-Ilim', group: 'dlc', mood: 'boss' },
];

const TEXT = {
  en: {
    pageTitle: 'Music — Elden Ring',
    results: (count) => `${count} soundtrack ${count === 1 ? 'theme' : 'themes'}`,
    area: 'Featured in',
    youtube: 'YouTube Music',
    spotify: 'Spotify',
    group: { base: 'Elden Ring', dlc: 'Shadow of the Erdtree' },
    mood: { boss: 'Boss theme', world: 'World & character' },
    title: 'Search on',
  },
  ru: {
    pageTitle: 'Музыка — Elden Ring',
    results: (count) => `Тем в саундтреке: ${count}`,
    area: 'Место в игре',
    youtube: 'YouTube Music',
    spotify: 'Spotify',
    group: { base: 'Elden Ring', dlc: 'Shadow of the Erdtree' },
    mood: { boss: 'Тема босса', world: 'Мир и персонажи' },
    title: 'Найти в',
  },
};

const COPY = {
  en: {
    eyebrow: 'A sound beyond the fog',
    title: 'Music of the Lands Between',
    intro: 'Listen to both official soundtracks on this page, or browse memorable themes from the Lands Between.',
    explore: 'Listen to the full soundtracks',
    libraryEyebrow: 'The official score',
    libraryTitle: 'Soundtrack library',
    libraryIntro: 'Browse themes by mood, region, or encounter. Streaming opens the selected track search on YouTube Music or Spotify.',
    searchLabel: 'Search themes',
    searchPlaceholder: 'Search by track or location',
    filters: 'Soundtrack filters',
    filterAll: 'All themes',
    filterBase: 'Elden Ring',
    filterDlc: 'Shadow of the Erdtree',
    filterWorld: 'World & rest',
    filterBoss: 'Boss themes',
    empty: 'No soundtrack themes match your search.',
    note: 'Music is streamed by the linked services; this fan page does not host copyrighted audio. Availability may vary by region.',
    listenEyebrow: 'Listen your way',
    listenTitle: 'Take the journey with you',
    listenText: 'Open the full soundtrack catalog on your preferred streaming service to discover complete albums and official releases.',
    playersEyebrow: 'Listen on this site',
    playersTitle: 'Official soundtrack players',
    playerNote: 'The full official albums are available here: 67 tracks from the base game and 36 from the expansion. Playback depends on Deezer availability in your region.',
    baseAlbum: 'ELDEN RING ORIGINAL SOUND TRACK',
    dlcAlbum: 'ELDEN RING SHADOW OF THE ERDTREE ORIGINAL SOUND TRACK',
    basePlayerTitle: 'Elden Ring Original Sound Track — Deezer player',
    dlcPlayerTitle: 'Shadow of the Erdtree Original Sound Track — Deezer player',
    youtube: 'Find on YouTube Music',
    spotify: 'Find on Spotify',
  },
  ru: {
    eyebrow: 'Музыка за пределами тумана',
    title: 'Музыка Междуземья',
    intro: 'Слушайте оба официальных саундтрека прямо на сайте или ищите любимые темы Междуземья.',
    explore: 'Слушать саундтреки',
    libraryEyebrow: 'Официальная музыка игры',
    libraryTitle: 'Библиотека саундтрека',
    libraryIntro: 'Ищите темы по настроению, региону или сражению. Поиск композиции откроется в YouTube Music или Spotify.',
    searchLabel: 'Поиск тем',
    searchPlaceholder: 'Название композиции или локация',
    filters: 'Фильтры саундтрека',
    filterAll: 'Все темы',
    filterBase: 'Elden Ring',
    filterDlc: 'Shadow of the Erdtree',
    filterWorld: 'Мир и персонажи',
    filterBoss: 'Темы боссов',
    empty: 'По запросу ничего не найдено.',
    note: 'Музыка воспроизводится в выбранном сервисе; фан-сайт не хранит защищённые авторским правом аудиофайлы. Доступность зависит от региона.',
    listenEyebrow: 'Слушайте как удобно',
    listenTitle: 'Музыка всегда с вами',
    listenText: 'Откройте полный каталог саундтрека в любимом музыкальном сервисе и найдите альбомы и официальные релизы.',
    playersEyebrow: 'Слушайте прямо на сайте',
    playersTitle: 'Официальные альбомы',
    playerNote: 'В плеерах доступны полные официальные альбомы: 67 композиций основной игры и 36 — дополнения. Воспроизведение зависит от доступности Deezer в вашем регионе.',
    baseAlbum: 'ELDEN RING — ОРИГИНАЛЬНЫЙ САУНДТРЕК',
    dlcAlbum: 'ELDEN RING SHADOW OF THE ERDTREE — ОРИГИНАЛЬНЫЙ САУНДТРЕК',
    basePlayerTitle: 'Elden Ring — оригинальный саундтрек, плеер Deezer',
    dlcPlayerTitle: 'Shadow of the Erdtree — оригинальный саундтрек, плеер Deezer',
    youtube: 'Найти в YouTube Music',
    spotify: 'Найти в Spotify',
  },
};
let cleanup = null;

function platformSearch(track, platform) {
  const query = encodeURIComponent(`${track.title} Elden Ring official soundtrack`);
  return platform === 'youtube'
    ? `https://music.youtube.com/search?q=${query}`
    : `https://open.spotify.com/search/${query}`;
}

function createTrackCard(track, lang) {
  const copy = TEXT[lang];
  const card = document.createElement('article');
  card.className = 'music-track';

  const artwork = document.createElement('div');
  artwork.className = 'music-track__art';
  artwork.setAttribute('aria-hidden', 'true');
  artwork.textContent = '♪';

  const content = document.createElement('div');
  content.className = 'music-track__content';
  const album = document.createElement('span');
  album.className = 'music-track__album';
  album.textContent = copy.group[track.group];
  const title = document.createElement('h3');
  title.textContent = track.title;
  const area = document.createElement('p');
  area.className = 'music-track__area';
  area.textContent = `${copy.area}: ${track.area}`;
  const tags = document.createElement('div');
  tags.className = 'music-track__tags';
  const mood = document.createElement('span');
  mood.textContent = copy.mood[track.mood];
  tags.append(mood);
  content.append(album, title, area, tags);

  const actions = document.createElement('div');
  actions.className = 'music-track__actions';
  [
    ['youtube', copy.youtube],
    ['spotify', copy.spotify],
  ].forEach(([platform, label]) => {
    const link = document.createElement('a');
    link.href = platformSearch(track, platform);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    link.setAttribute('aria-label', `${copy.title} ${track.title} ${label}`);
    actions.append(link);
  });

  card.append(artwork, content, actions);
  return card;
}

export function mount(root = document.querySelector('#page[data-page="music"]')) {
  if (!root) return;
  const search = root.querySelector('[data-music-search]');
  const list = root.querySelector('[data-music-tracks]');
  const results = root.querySelector('[data-music-results]');
  const empty = root.querySelector('[data-music-empty]');
  const filters = [...root.querySelectorAll('[data-music-filter]')];
  let activeFilter = 'all';
  let lang = getLang();

  const applyCopy = () => {
    const copy = COPY[lang];
    root.querySelectorAll('[data-music-text]').forEach((element) => {
      const value = copy[element.dataset.musicText];
      if (value) element.textContent = value;
    });
    root.querySelectorAll('[data-music-placeholder]').forEach((element) => {
      element.placeholder = copy[element.dataset.musicPlaceholder];
    });
    root.querySelectorAll('[data-music-aria]').forEach((element) => {
      const key = element.dataset.musicAria;
      if (key === 'filters') element.setAttribute('aria-label', copy.filters);
    });
    root.querySelectorAll('[data-music-title]').forEach((element) => {
      element.title = copy[element.dataset.musicTitle];
    });
    document.title = TEXT[lang].pageTitle;
  };

  const render = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const tracks = TRACKS.filter((track) => {
      const matchesFilter =
        activeFilter === 'all' ||
        activeFilter === track.group ||
        activeFilter === track.mood;
      return (
        matchesFilter &&
        `${track.title} ${track.area}`.toLocaleLowerCase().includes(query)
      );
    });
    list.replaceChildren(...tracks.map((track) => createTrackCard(track, lang)));
    results.textContent = TEXT[lang].results(tracks.length);
    empty.hidden = tracks.length > 0;
  };

  const onFilter = (event) => {
    const button = event.target.closest('[data-music-filter]');
    if (!button) return;
    activeFilter = button.dataset.musicFilter;
    filters.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    render();
  };
  const onLanguageChange = (event) => {
    lang = event.detail.lang;
    applyCopy();
    render();
  };

  filters.forEach((filter) =>
    filter.setAttribute(
      'aria-pressed',
      String(filter.dataset.musicFilter === activeFilter),
    ),
  );
  search.addEventListener('input', render);
  root.querySelector('.music-filters').addEventListener('click', onFilter);
  window.addEventListener('lang-change', onLanguageChange);
  applyCopy();
  render();

  cleanup = () => {
    search.removeEventListener('input', render);
    root.querySelector('.music-filters').removeEventListener('click', onFilter);
    window.removeEventListener('lang-change', onLanguageChange);
  };
}

export function unmount() {
  cleanup?.();
  cleanup = null;
}
