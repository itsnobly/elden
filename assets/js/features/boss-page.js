import { loadBosses, tierOf, videoIdOf } from '../modules/characters.js';
import { escapeHtml } from '../utils/html.js';
import { t, getLang, statLabel } from '../utils/i18n.js';
import { localizeBossText } from '../utils/boss-localization.js';
import { changeDeaths, getDeaths } from '../utils/deaths.js';
import { bossImageNow, fillBossImages } from '../modules/boss-images.js';

let data;
let root;
let bossId;
let cleanups = [];

const href = (id) => `/pages/bosses/boss.html?id=${encodeURIComponent(id)}`;

function chips(values) {
  if (!values?.length) return escapeHtml(t('unknown'));
  return `<span class="boss-page__chips">${values
    .map(
      (value) =>
        `<span class="boss-page__chip">${escapeHtml(statLabel(value))}</span>`,
    )
    .join('')}</span>`;
}

function render() {
  const boss = data.byId.get(bossId);
  if (!boss) {
    document.title = t('pageTitle');
    root.innerHTML = `
      <section class="boss-page"><div class="container">
        <p class="boss-page__back-wrap"><a class="boss-page__back" href="/pages/bosses/bosses.html">${escapeHtml(t('back'))}</a></p>
        <p class="bosses__message">${escapeHtml(t('notFound'))}</p>
      </div></section>`;
    return;
  }

  const lang = getLang();
  const ru = data.ru(boss.id);
  const ruMode = lang === 'ru';
  const name = ruMode ? (ru.name ?? boss.name_en) : boss.name_en;
  const tier = tierOf(boss);
  const category = data.categoryOf.get(boss.id);
  const reason = data.difficulty[boss.id]?.[lang] ?? '';
  const videoId = videoIdOf(boss);
  const deaths = getDeaths(boss.id);

  // соседние боссы в том же порядке, что и в списке
  const index = data.sorted.findIndex((entry) => entry.id === boss.id);
  const prev = data.sorted[index - 1];
  const next = data.sorted[index + 1];

  const phases = (boss.phases ?? []).map((phase, i) => {
    const tr = ru.phases[i] ?? {};
    const title = ruMode
      ? `${t('phase')} ${phase.phase}`
      : (phase.title_en ?? `${t('phase')} ${phase.phase}`);
    return `
      <li class="boss-page__phase">
        <h3>${escapeHtml(title)}</h3>
        ${ruMode && phase.title_en ? `<p class="boss-page__phase-sub">${escapeHtml(localizeBossText(phase.title_en, lang))}</p>` : ''}
        ${ruMode && tr.mechanics ? `<p>${escapeHtml(tr.mechanics)}</p>` : ''}
        ${ruMode && tr.tactics ? `<p><strong>${escapeHtml(t('strategy'))}:</strong> ${escapeHtml(tr.tactics)}</p>` : ''}
        ${phase.key_attacks?.length ? `<p><strong>${escapeHtml(t('attacks'))}:</strong> ${phase.key_attacks.map((attack) => escapeHtml(localizeBossText(attack, lang))).join(', ')}</p>` : ''}
      </li>`;
  });

  const rewards = (boss.rewards ?? []).map((reward) => {
    const type = t(data.itemType(reward).replaceAll('_', ' '));
    return `
      <li class="boss-page__reward">
        <span class="boss-page__reward-img">
          <span class="boss-page__reward-mark" aria-hidden="true">✦</span>
          ${reward.image ? `<img src="${escapeHtml(reward.image)}" alt="" loading="lazy" decoding="async" />` : ''}
        </span>
        <span>${escapeHtml(data.itemName(reward, lang))}${type ? ` <small>${escapeHtml(type)}</small>` : ''}</span>
      </li>`;
  });

  const facts = [
    [t('category'), category ? t(category.label) : '—'],
    [
      t('region'),
      escapeHtml(localizeBossText(boss.region ?? t('unknown'), lang)),
    ],
    [
      t('location'),
      escapeHtml(localizeBossText(boss.location ?? t('unknown'), lang)),
    ],
    [
      'HP',
      boss.hp == null
        ? escapeHtml(t('notConfirmed'))
        : escapeHtml(boss.hp.toLocaleString(ruMode ? 'ru-RU' : 'en-US')),
    ],
    [
      t('parry'),
      boss.stats?.parryable == null
        ? '—'
        : escapeHtml(boss.stats.parryable ? t('yes') : t('no')),
    ],
    [t('weakTo'), chips(boss.stats?.weakness)],
    ...(boss.stats?.immunity?.length
      ? [[t('immune'), chips(boss.stats.immunity)]]
      : []),
    ...(boss.optional ? [[t('optional'), escapeHtml(t('yes'))]] : []),
  ];

  document.title = `${name} — Elden Ring`;
  root.innerHTML = `
    <article class="boss-page" data-boss-id="${escapeHtml(boss.id)}">
      <div class="container">
        <div class="boss-page__top">
          <a class="boss-page__back" href="/pages/bosses/bosses.html">${escapeHtml(t('back'))}</a>
        </div>

        <div class="boss-page__layout">
          <aside class="boss-page__media">
            <div class="boss-page__art">
              <span class="boss-entry__placeholder" aria-hidden="true"><span class="boss-entry__placeholder-mark">✦</span></span>
              <img class="boss-entry__image" data-boss-img="${escapeHtml(boss.id)}" ${bossImageNow(boss) ? `src="${escapeHtml(bossImageNow(boss))}"` : 'hidden'} alt="${escapeHtml(name)}" decoding="async" />
              <span class="boss-entry__tier" title="${escapeHtml(t('difficulty'))}">${tier}</span>
            </div>
          </aside>

          <div class="boss-page__body">
            <h1 class="boss-page__title">${escapeHtml(name)}</h1>
            ${ruMode && ru.short ? `<p class="boss-page__lead">${escapeHtml(ru.short)}</p>` : ''}

            <dl class="boss-page__facts">
              ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`).join('')}
            </dl>
            <div class="boss-death-counter boss-page__death-counter" data-death-counter>
              <span class="boss-death-counter__label">${escapeHtml(t('Deaths'))}</span>
              <button type="button" data-death-change="-1" aria-label="${escapeHtml(t('Remove one death'))}" ${deaths ? '' : 'disabled'}>−</button>
              <output data-deaths-for="${escapeHtml(boss.id)}" aria-live="polite">${deaths}</output>
              <button type="button" data-death-change="1" aria-label="${escapeHtml(t('Add one death'))}">+</button>
            </div>

            ${reason ? `<p class="boss-page__reason"><strong>${escapeHtml(t('whyTier'))} (${tier}):</strong> ${escapeHtml(reason)}</p>` : ''}
            ${ruMode && ru.description ? `<p>${escapeHtml(ru.description)}</p>` : ''}
            ${ruMode && ru.lore ? `<h2>${escapeHtml(t('lore'))}</h2><p class="boss-page__lore">${escapeHtml(ru.lore)}</p>` : ''}

            ${
              videoId
                ? `
              <h2>${escapeHtml(t('cutscene'))}</h2>
              <button class="boss-page__video" type="button" data-video="${escapeHtml(videoId)}" aria-label="${escapeHtml(t('playVideo'))}">
                <img src="https://i.ytimg.com/vi/${escapeHtml(videoId)}/hqdefault.jpg" alt="" loading="lazy" />
                <span class="boss-page__play" aria-hidden="true">▶</span>
              </button>`
                : ''
            }

            ${phases.length ? `<h2>${escapeHtml(t('phases'))}</h2><ol class="boss-page__phases">${phases.join('')}</ol>` : ''}
            ${ruMode && ru.tips.length ? `<h2>${escapeHtml(t('tips'))}</h2><ul class="boss-page__list">${ru.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>` : ''}
            ${rewards.length ? `<h2>${escapeHtml(t('rewards'))}</h2><ul class="boss-page__rewards">${rewards.join('')}</ul>` : ''}
          </div>
        </div>

        <nav class="boss-page__pager">
          ${prev ? `<a href="${href(prev.id)}">${escapeHtml(t('prev'))}<span>${escapeHtml(ruMode ? (data.ru(prev.id).name ?? prev.name_en) : prev.name_en)}</span></a>` : '<span></span>'}
          ${next ? `<a href="${href(next.id)}">${escapeHtml(t('next'))}<span>${escapeHtml(ruMode ? (data.ru(next.id).name ?? next.name_en) : next.name_en)}</span></a>` : '<span></span>'}
        </nav>
      </div>
    </article>`;
  fillBossImages(root, data.byId);
}

function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  cleanups.push(() => target.removeEventListener(type, handler, options));
}

async function build(container) {
  data = await loadBosses();
  root = container;
  bossId = new URLSearchParams(location.search).get('id');
  render();

  on(window, 'lang-change', render);

  // Видео подгружается только по клику: страница остаётся лёгкой
  on(root, 'click', (event) => {
    const deathButton = event.target.closest('[data-death-change]');
    if (deathButton && root.contains(deathButton)) {
      changeDeaths(bossId, Number(deathButton.dataset.deathChange));
      return;
    }

    const button = event.target.closest('[data-video]');
    if (!button) return;
    const frame = document.createElement('iframe');
    frame.className = 'boss-page__video';
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(button.dataset.video)}?autoplay=1&rel=0`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.title = t('cutscene');
    button.replaceWith(frame);
  });

  on(
    root,
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) event.target.hidden = true;
    },
    true,
  );
}

export function unmount() {
  cleanups.forEach((off) => off());
  cleanups = [];
  root = undefined;
}

// ---------- вход / выход (вызывает router) ----------

export async function mount(page) {
  const container = page.querySelector('#boss-root');
  const loader = page.querySelector('#page-loader');
  try {
    await build(container);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<section class="bosses"><div class="container">
      <p class="bosses__message">${escapeHtml(t('loadError'))}</p>
      <p class="bosses__message"><button type="button" class="bosses__retry" onclick="location.reload()">${escapeHtml(t('retry'))}</button></p>
    </div></section>`;
  } finally {
    requestAnimationFrame(() => loader?.classList.add('is-hidden'));
  }
}
