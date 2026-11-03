/*
 * i18n.js — язык интерфейса боссов (ru / en).
 * Язык хранится в localStorage ('er:lang'), по умолчанию английский, как весь сайт.
 * Общий переключатель языка сайта должен вызывать setLang('ru' | 'en').
 * При смене языка шлётся событие 'lang-change' — страницы перерисовываются.
 */
const KEY = 'er:lang';
let lang = 'en';
try {
  const saved = localStorage.getItem(KEY);
  if (saved === 'en' || saved === 'ru') lang = saved;
} catch {
  /* localStorage может быть недоступен — не страшно */
}

const DICT = {
  en: {
    pageTitle: 'Bosses — Elden Ring',
    eyebrow: 'The Lands Between & the Land of Shadow',
    title: 'Bosses',
    subtitle: 'A curated selection of encounters ranked by difficulty and grouped by location.',
    catAll: 'All bosses',
    catMain: 'Main story',
    catDlc: 'Shadow of the Erdtree',
    catOptional: 'Optional',
    allDifficulties: 'All difficulties',
    difficultyNote: 'Difficulty ranks are editorial estimates for this curated selection.',
    filterDifficulty: 'Filter by difficulty',
    searchPlaceholder: 'Search bosses, regions, rewards...',
    searchLocations: 'Search locations...',
    allLocations: 'All locations',
    reset: 'Reset',
    noResults: 'No bosses match these filters.',
    boss: 'boss',
    bosses: 'bosses',
    difficulty: 'Difficulty',
    whyTier: 'Why this rank',
    details: 'Details',
    unknown: 'Unknown',
    notConfirmed: 'Not confirmed',
    region: 'Region',
    location: 'Location',
    category: 'Category',
    weakTo: 'Weak to',
    immune: 'Resists',
    parry: 'Parry',
    yes: 'Yes',
    no: 'No',
    optional: 'Optional',
    phases: 'Phases',
    phase: 'Phase',
    strategy: 'Strategy',
    attacks: 'Attacks',
    tips: 'Tips',
    rewards: 'Rewards',
    lore: 'Lore',
    cutscene: 'Cutscene',
    playVideo: 'Play video',
    back: '← All bosses',
    prev: '← Previous',
    next: 'Next →',
    notFound: 'Boss not found.',
    loadError: 'Could not load boss data. Check the server and try again.',
    retry: 'Retry',
    soon: 'This page is coming soon.',
    footer: 'Elden Ring Boss Compendium',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    page: 'Page',
  },
  ru: {
    pageTitle: 'Боссы — Elden Ring',
    eyebrow: 'Междуземье и Земля Теней',
    title: 'Боссы',
    subtitle: 'Подборка боссов по уровню сложности и месту встречи.',
    catAll: 'Все боссы',
    catMain: 'Основные боссы',
    catDlc: 'Тень Древа Эрд',
    catOptional: 'Опциональные',
    allDifficulties: 'Все уровни сложности',
    difficultyNote: 'Ранги сложности — редакционная оценка этой подборки.',
    filterDifficulty: 'Фильтр по сложности',
    searchPlaceholder: 'Поиск боссов, регионов и наград...',
    searchLocations: 'Поиск локаций...',
    allLocations: 'Все локации',
    reset: 'Сбросить',
    noResults: 'По заданным фильтрам боссов не найдено.',
    boss: 'босс',
    bosses: 'боссов',
    difficulty: 'Сложность',
    whyTier: 'Почему этот ранг',
    details: 'Подробнее',
    unknown: 'Неизвестно',
    notConfirmed: 'Нет данных',
    region: 'Регион',
    location: 'Место',
    category: 'Категория',
    weakTo: 'Уязвимость',
    immune: 'Сопротивление',
    parry: 'Парирование',
    yes: 'Да',
    no: 'Нет',
    optional: 'Необязательный',
    phases: 'Фазы',
    phase: 'Фаза',
    strategy: 'Тактика',
    attacks: 'Атаки',
    tips: 'Советы',
    rewards: 'Награды',
    lore: 'История',
    cutscene: 'Катсцена',
    playVideo: 'Смотреть видео',
    back: '← Все боссы',
    prev: '← Назад',
    next: 'Дальше →',
    notFound: 'Босс не найден.',
    loadError: 'Не удалось загрузить данные боссов. Проверь сервер и попробуй снова.',
    retry: 'Повторить',
    soon: 'Эта страница скоро появится.',
    footer: 'Бестиарий Elden Ring',
    prevPage: 'Предыдущая страница',
    nextPage: 'Следующая страница',
    page: 'Страница',
  },
};

// Значения из stats.weakness / stats.immunity в читаемом виде
const STATS = {
  physical: ['Physical', 'Физический'],
  slash: ['Slash', 'Рубящий'],
  strike: ['Strike', 'Дробящий'],
  pierce: ['Pierce', 'Колющий'],
  fire: ['Fire', 'Огонь'],
  lightning: ['Lightning', 'Молния'],
  magic: ['Magic', 'Магия'],
  holy: ['Holy', 'Святой'],
  bleed: ['Bleed', 'Кровотечение'],
  frostbite: ['Frostbite', 'Обморожение'],
  scarlet_rot: ['Scarlet Rot', 'Алая гниль'],
  poison: ['Poison', 'Яд'],
  sleep: ['Sleep', 'Сон'],
  stagger: ['Stagger', 'Пошатывание'],
  left_ankle: ['Left ankle', 'Левая лодыжка'],
  serpent_hunter_spear: ['Serpent-Hunter', 'Копьё Змееборца'],
  blasphemous_claw: ['Blasphemous Claw', 'Богохульный коготь'],
  shackle_mohg: ['Shackle (Mohg)', 'Оковы (Мог)'],
  bleed_resistant: ['Bleed resistant', 'Стойкость к кровотечению'],
  magic_resistant: ['Magic resistant', 'Стойкость к магии'],
  holy_resistant: ['Holy resistant', 'Стойкость к святому'],
  parry_limited: ['Limited parry', 'Парирование ограничено'],
  magic_80_percent_resist: ['Magic 80% resist', 'Сопротивление магии 80%'],
};

const SITE_RU = new Map(
  Object.entries({
    Main: 'Главная',
    Home: 'Главная',
    Guide: 'Гайды',
    Guides: 'Гайды',
    'Regional guide': 'Регионы',
    'Regions of the Lands Between': 'Регионы Междуземья',
    'Explore regions, major bosses, and their notable boss rewards.':
      'Изучайте регионы, ключевых боссов и получаемые за победу награды.',
    'Boss rewards shown here; this is not a complete list of regional loot.':
      'Здесь указаны награды за боссов, а не все предметы, которые можно найти в регионе.',
    'Boss reward': 'Награда за босса',
    'No listed rewards': 'Награды не указаны',
    'Could not load regional boss data.': 'Не удалось загрузить данные о боссах регионов.',
    Bosses: 'Боссы',
    Tools: 'Инструменты',
    Music: 'Музыка',
    Database: 'База данных',
    Contact: 'Контакты',
    Weapons: 'Оружие',
    Armor: 'Броня',
    Talismans: 'Талисманы',
    Spells: 'Заклинания',
    'Ashes of War': 'Прахи войны',
    Items: 'Предметы',
    'Interactive Map': 'Интерактивная карта',
    'Browse database categories': 'Категории базы данных',
    'Open navigation menu': 'Открыть меню',
    'Close navigation menu': 'Закрыть меню',
    'Weapon type': 'Тип оружия',
    'All weapon types': 'Все типы оружия',
    'Not sure which class fits?': 'Не знаешь, какой класс выбрать?',
    'Take the 12-question class quiz': 'Пройди тест из 12 вопросов',
    'Take the class quiz': 'Пройти тест на класс',
    'Class quiz': 'Тест на класс',
    'Answer 12 questions to find a starting class that matches your playstyle.':
      'Ответь на 12 вопросов и узнай, какой стартовый класс подходит твоему стилю игры.',
    'Take the quiz': 'Пройти тест',
    'Straight Sword': 'Прямой меч',
    Greatsword: 'Большой меч',
    'Colossal Sword': 'Колоссальный меч',
    'Curved Sword': 'Изогнутый меч',
    Katana: 'Катана',
    Twinblade: 'Парные клинки',
    Dagger: 'Кинжал',
    Axe: 'Топор',
    Greataxe: 'Большой топор',
    Hammer: 'Молот',
    'Great Hammer': 'Большой молот',
    'Colossal Weapon': 'Колоссальное оружие',
    Spear: 'Копьё',
    'Great Spear': 'Большое копьё',
    Halberd: 'Алебарда',
    Whip: 'Кнут',
    Fist: 'Кулак',
    Claw: 'Коготь',
    Bow: 'Лук',
    Greatbow: 'Большой лук',
    Crossbow: 'Арбалет',
    Ballista: 'Баллиста',
    'Glintstone Staff': 'Посох блестящих камней',
    'Sacred Seal': 'Священная печать',
    'Switch to Russian': 'Переключить на русский',
    'Switch to English': 'Переключить на английский',
    'Language': 'Язык',
    'Elden Ring Project': 'Проект Elden Ring',
    'A dark fantasy guide and portal across the Lands Between. Explore bosses, lore, builds, and strategies.':
      'Путеводитель по мрачному миру Междуземья: боссы, история, сборки и тактики.',
    Navigation: 'Навигация',
    'Social Links': 'Социальные сети',
    Community: 'Сообщество',
    'By Game': 'Игра',
    'My GitHub': 'Мой GitHub',
    'Fandom Wiki': 'Вики Fandom',
    'Steam Store': 'Магазин Steam',
    Soundtrack: 'Саундтрек',
    'Not affiliated with FromSoftware or Bandai Namco.':
      'Фанатский проект, не связанный с FromSoftware или Bandai Namco.',
    'Call us back': 'Перезвоните мне',
    'We will get in touch with you as soon as possible!':
      'Мы свяжемся с вами как можно скорее!',
    'Your name': 'Ваше имя',
    'Your phone number': 'Ваш номер телефона',
    'Knowledge for the Tarnished': 'Знания для Погасших',
    'A sound beyond the fog': 'Музыка за пределами тумана',
    'The official score': 'Официальная музыка игры',
    'Listen your way': 'Слушайте как удобно',
    'The Lands Between, catalogued': 'Каталог Междуземья',
    'Armaments': 'Вооружение',
    Protection: 'Защита',
    'Charms & keepsakes': 'Талисманы и реликвии',
    'Sorceries & incantations': 'Колдовство и молитвы',
    'Skills & affinities': 'Навыки и свойства',
    'Tools & treasures': 'Инструменты и сокровища',
    'Chart your journey': 'Проложите свой путь',
    'Explore armaments, armor, magic, and treasures — or open the interactive map to plan your next journey.':
      'Изучайте оружие, броню, магию и сокровища или откройте интерактивную карту.',
    'Swords, axes, bows, seals, and more. Compare weapon classes, requirements, and attack values.':
      'Мечи, топоры, луки, печати и многое другое. Сравнивайте типы оружия, требования и урон.',
    'Helms, chest pieces, gauntlets, and greaves with weight, poise, and damage negation.':
      'Шлемы, доспехи, перчатки и поножи: вес, устойчивость и защита от урона.',
    'Discover passive effects that strengthen your defenses, attributes, and combat style.':
      'Найдите эффекты, усиливающие защиту, характеристики и стиль боя.',
    'Browse magic by school, FP cost, memory slots, and required attributes.':
      'Изучайте магию по типу, расходу ОК, ячейкам памяти и требованиям.',
    'Review weapon skills and affinities to shape an armament around your build.':
      'Подбирайте навыки и свойства оружия под свою сборку.',
    'Consumables, key items, crafting tools, and discoveries found throughout the Lands Between.':
      'Расходуемые и ключевые предметы, инструменты ремесла и находки Междуземья.',
    'Search loaded weapons': 'Поиск среди загруженного оружия',
    'Search loaded armor': 'Поиск среди загруженной брони',
    'Search loaded talismans': 'Поиск среди загруженных талисманов',
    'Search loaded spells': 'Поиск среди загруженных заклинаний',
    'Search loaded Ashes of War': 'Поиск среди загруженных прахов войны',
    'Search loaded items': 'Поиск среди загруженных предметов',
    'e.g. katana': 'Например, катана',
    'e.g. knight': 'Например, рыцарь',
    'e.g. Arsenal': 'Например, арсенал',
    'e.g. lightning': 'Например, молния',
    'e.g. Charge': 'Например, рывок',
    'e.g. Rune': 'Например, руна',
    'Load more': 'Загрузить ещё',
    'Loading…': 'Загрузка…',
    'Loading catalog entries…': 'Загрузка записей каталога…',
    'Could not load catalog data.': 'Не удалось загрузить каталог.',
    Retry: 'Повторить',
    'No additional details available.': 'Подробности отсутствуют.',
    Details: 'Подробности',
    Deaths: 'Смерти',
    'Add one death': 'Добавить одну смерть',
    'Remove one death': 'Убрать одну смерть',
    Bow: 'Лук',
    Longbow: 'Длинный лук',
    Remembrance: 'Воспоминание',
    remembrance: 'Воспоминание',
    Str: 'Сил',
    Dex: 'Ловк',
    Int: 'Инт',
    Fai: 'Вера',
    Arc: 'Колд',
    Phy: 'Физ',
    Mag: 'Маг',
    Fire: 'Огонь',
    Holy: 'Свят',
    Lig: 'Молн',
    Ligt: 'Молн',
    Crit: 'Крит',
    Rng: 'Дальн',
    Poise: 'Баланс',
    Magic: 'Магия',
    FP: 'ОК',
    slot: 'ячейка',
    slots: 'ячеек',
    Item: 'Предмет',
    Talisman: 'Талисман',
    Sword: 'Меч',
    Greatsword: 'Большой меч',
    Dagger: 'Кинжал',
    Shield: 'Щит',
    Staff: 'Посох',
    Spear: 'Копьё',
    Crossbow: 'Арбалет',
    Seal: 'Печать',
    'Physical damage': 'Физический урон',
    'Magic damage': 'Магический урон',
    great_rune: 'Великая руна',
    'Albinauric Bow': 'Лук альбинора',
    'Longbow made to fire arrows over great distances. Compared to a shortbow, arrows fired reach further and deal more damage. To use a bow, arrows must also be equipped.':
      'Длинный лук для стрельбы издалека: стрелы летят дальше и наносят больше урона, чем из короткого лука. Нужны стрелы.',
    'Longbow featuring delicate silverwork. Wielded by Albinauric wolfback archers. This bow requires dexterity over strength to master.':
      'Длинный лук с изящной серебряной отделкой. Им пользуются лучники альбинора, ездящие на волках. Для владения этим луком важнее ловкость, чем сила.',
    Attack: 'Атака',
    Guard: 'Защита',
    Scaling: 'Масштабирование',
    Requirements: 'Требования',
    Weight: 'Вес',
    'Damage negation': 'Поглощение урона',
    Resistance: 'Сопротивление',
    'FP cost': 'Расход ОК',
    'Memory slots': 'Ячейки памяти',
    Effect: 'Эффект',
    Type: 'Тип',
    Skill: 'Навык',
    Affinity: 'Свойство',
    'No loaded entries match': 'Среди загруженных записей нет совпадений',
    'Load more to search further.': 'Загрузите ещё, чтобы продолжить поиск.',
    'Stories across the Lands Between': 'Истории Междуземья',
    'NPC quests': 'Задания персонажей',
    'Choices leave their mark': 'Выбор оставляет след',
    Endings: 'Концовки',
    'Build with a purpose': 'Соберите билд с умом',
    'Build basics': 'Основы сборки',
    Walkthrough: 'Прохождение',
    'Find your starting class, plan a route through the Lands Between, follow NPC stories, and shape a build for your journey.':
      'Выберите класс, спланируйте путь по Междуземью, проследите истории персонажей и соберите билд.',
    'A route, not a checklist': 'Маршрут, а не список заданий',
    'Follow the main path, but explore side regions before each major turning point. Recommended levels are flexible: weapon upgrades and your own comfort matter just as much.':
      'Следуйте основному пути, но исследуйте дополнительные области перед важными событиями. Уровни примерные: улучшение оружия и комфорт важнее цифр.',
    'Stories across the Lands Between': 'Истории Междуземья',
    'Characters move after key events. Talk until dialogue repeats, then check the next listed location. Spoiler details are in the expandable cards.':
      'Персонажи перемещаются после важных событий. Исчерпайте диалог и проверьте следующую локацию. Подробности со спойлерами скрыты в раскрывающихся карточках.',
    'There are six ending outcomes: the default choice, three Mending Rune variations, Ranni’s path, and the Frenzied Flame. Complete the relevant quest before the final battle.':
      'В игре шесть концовок: обычная, три варианта с Руной Починки, путь Ренни и Пламя Безумия. Завершите нужное задание до финальной битвы.',
    'Stay alive first': 'Сначала выживите',
    'Upgrade your weapon': 'Улучшайте оружие',
    'Choose one main damage stat': 'Выберите основную характеристику урона',
    'Keep a medium load': 'Сохраняйте среднюю нагрузку',
    'Open the build planner': 'Открыть планировщик сборок',
    'Before moving on:': 'Перед тем как идти дальше:',
    "Major story events can move NPCs and alter Leyndell. If a quest matters to you, exhaust dialogue, revisit the character's last location, and complete the quest before the Forge/Maliketh milestones.":
      'Важные события сюжета могут перемещать персонажей и менять Лейнделл. Если вам важна цепочка задания, исчерпайте диалоги, вернитесь к последнему известному месту персонажа и завершите задание до горна или событий с Маликетом.',
    'Keep your options open:': 'Сохраните возможность выбора:',
    DEFAULT: 'ОБЫЧНАЯ',
    FIA: 'ФИЯ',
    GOLDMASK: 'ЗОЛОТАЯ МАСКА',
    'DUNG EATER': 'ПОЕДАТЕЛЬ ОТБРОСОВ',
    RANNI: 'РЕННИ',
    'MISSABLE CHOICE': 'ВАЖНЫЙ ВЫБОР',
    'Age of Fracture': 'Эпоха Раскола',
    'Age of the Duskborn': 'Эпоха Сумеречнорожденных',
    'Age of Order': 'Эпоха Порядка',
    'Blessing of Despair': 'Благословение Отчаяния',
    'Age of the Stars': 'Эпоха Звёзд',
    'Lord of Frenzied Flame': 'Повелитель Пламени Безумия',
    'Find on YouTube Music': 'Найти в YouTube Music',
    'Find on Spotify': 'Найти в Spotify',
    'The open world of the Lands Between, from Limgrave to the Elden Throne. Over a hundred hours of bosses, dungeons and secrets.':
      'Открытый мир Междуземья — от Замогилья до трона Элдена. Боссы, подземелья и тайны на сотни часов.',
    'Music — Elden Ring': 'Музыка — Elden Ring',
    'Database — Elden Ring': 'База данных — Elden Ring',
    'Guides — Elden Ring': 'Гайды — Elden Ring',
    'Bosses — Elden Ring': 'Боссы — Elden Ring',
    'Elden Ring Fan Project': 'Фан-проект Elden Ring',
    'Made with ambition and dark aesthetics.':
      'Создано с амбициями и мрачной эстетикой.',
    'Elden Ring Lore & Database': 'История и база данных Elden Ring',
    'Discover the mysteries of the Lands Between': 'Откройте тайны Междуземья',
    'Shop now': 'Купить',
    'WHERE TO BUY & PLAY': 'ГДЕ КУПИТЬ И ИГРАТЬ',
    'Where to buy & play': 'Где купить и играть',
    'Buy Elden Ring →': 'Купить Elden Ring →',
    'Visit store →': 'Перейти в магазин →',
    'View game →': 'Открыть игру →',
    'Beyond the Lands Between': 'За пределами Междуземья',
    Expansion: 'Дополнение',
    'Co-op action adventure': 'Кооперативное приключение',
    'Combat & community': 'Сражения и сообщество',
    'Enter the Land of Shadow and follow Miquella’s trail through a new world of secrets, formidable enemies, and legendary battles.':
      'Отправляйтесь в Землю Теней по следу Микеллы: вас ждут тайны, сильные враги и легендарные битвы.',
    'Join other Nightfarers, survive the encroaching night, and face a new threat in a standalone adventure.':
      'Объединитесь с другими Ночными странниками, переживите наступление ночи и сразитесь с новой угрозой.',
    'Follow Miquella’s path, uncover the secrets of the new realm, and face the warriors drawn into its shadow.':
      'Следуйте по пути Микеллы, раскройте тайны нового мира и сразитесь с воинами, попавшими в его тень.',
    'Challenge fellow Tarnished, test your build, and prove your skill in the Lands Between.':
      'Сразитесь с другими Погасшими, испытайте свою сборку и докажите мастерство в Междуземье.',
    'The Golden Order is broken': 'Золотой порядок разрушен',
    'Arise, faded soul! The Lands Between await their lord. May grace lead you to the Elden Ring.':
      'Восстань, угасшая душа! Междуземье ждёт своего повелителя. Да приведёт тебя благодать к Кольцу Элдена.',
    'ELDEN RING is a fantasy action RPG from FromSoftware Inc. and BANDAI NAMCO Entertainment Inc. It is, to date, FromSoftware’s most ambitious project, set in a world filled with mystery and danger.':
      'ELDEN RING — фэнтезийная ролевая игра в жанре action от FromSoftware Inc. и BANDAI NAMCO Entertainment Inc. Это самый масштабный проект FromSoftware, действие которого разворачивается в мире тайн и опасностей.',
    'In the Lands Between, the realm of Queen Marika the Eternal, the great Elden Ring—the source of the Erdtree’s power—was shattered. Before long, Marika’s offspring, the demigods, claimed the shards of the Elden Ring: the Great Runes. Yet, this newfound power corrupted the Queen’s children, leading them to wage a war known as the Shattering. And so, the Greater Will forsook them.':
      'В Междуземье, владениях королевы Марики Вечной, было разбито великое Кольцо Элдена — источник силы Древа Эрд. Полубоги, потомки Марики, завладели его осколками — Великими рунами. Новая сила развратила детей королевы, и они развязали войну, вошедшую в историю как Раскол. Великая Воля отвернулась от них.',
    'Now, however, grace guides the Tarnished—those deprived of golden grace and exiled from the Lands Between. You, the living dead who lost your grace long ago, set forth for the Lands Between, crossing the misty sea, and stand before the Elden Ring.':
      'Теперь благодать ведёт Погасших — лишённых золотого света и изгнанных из Междуземья. Ты, живой мертвец, давно утративший благодать, пересекаешь туманное море и возвращаешься в Междуземье, чтобы предстать перед Кольцом Элдена.',
    'PVP & Duels': 'PvP и дуэли',
    'Step into the arenas of the Lands Between and test your combat prowess against fellow Tarnished. Engage in honor-bound duels, chaotic multi-player invasions, or tactical team fights where every mistake could cost your life.':
      'Выйдите на арены Междуземья и испытайте боевое мастерство против других Погасших. Вас ждут честные дуэли, хаотичные вторжения и тактические командные бои, где любая ошибка может стоить жизни.',
    'Master precise parry windows, optimize your stat distribution, and combine devastating Ashes of War with high-tier incantations to claim victory over your opponents.':
      'Освойте точное парирование, распределите характеристики и сочетайте мощные прахи войны с сильными молитвами, чтобы одержать победу.',
    'Exploring the Lands Between': 'Исследование Междуземья',
    'Journey across vast landscapes filled with hidden dungeons, towering legacy castles, and forgotten ruins. Every horizon holds secrets, rare artifacts, and ancient lore waiting to be uncovered.':
      'Исследуйте бескрайние земли со скрытыми подземельями, огромными замками наследия и забытыми руинами. За каждым горизонтом скрываются тайны, редкие артефакты и древняя история.',
    'Traverse diverse biomes on horseback, discover hidden passages, and chart your own path through a seamless world full of wonder and danger.':
      'Путешествуйте верхом по разнообразным местам, находите тайные проходы и прокладывайте собственный путь по цельному миру, полному чудес и опасностей.',
    'Secrets of the Open World': 'Тайны открытого мира',
    'Unveil mysterious underground rivers, catacombs guarded by traps, and optional encounters that challenge even seasoned adventurers. The world rewards curiosity at every turn.':
      'Откройте подземные реки, катакомбы с ловушками и необязательные испытания, опасные даже для опытных искателей приключений. Любопытство здесь вознаграждается.',
    'Interact with enigmatic NPCs, follow intricate questlines, and gather rare crafting materials as you uncover the history of the Shattering.':
      'Знакомьтесь с загадочными персонажами, проходите их цепочки заданий и собирайте редкие материалы, раскрывая историю Раскола.',
    'Choose your path': 'Выберите свой путь',
    'Guide library': 'Библиотека гайдов',
    'Explore the guides': 'К гайдам',
    Classes: 'Классы',
    'Compare starting attributes, find a class that fits your playstyle, and open its detailed stat breakdown.':
      'Сравните стартовые характеристики, выберите подходящий стиль игры и изучите подробные параметры класса.',
    'Browse classes': 'Смотреть классы',
    'Keep track of major milestones, optional areas, and useful stops as you explore.':
      'Следите за важными событиями, дополнительными областями и полезными остановками.',
    'View overview': 'К обзору',
    'Follow character questlines and keep an eye on steps that can be easy to miss.':
      'Следуйте цепочкам заданий персонажей и не пропускайте важные шаги.',
    'Learn how major choices and completed questlines can shape the conclusion of your journey.':
      'Узнайте, как важные решения и завершённые задания влияют на концовку.',
    Builds: 'Сборки',
    'Start with a class and adjust all eight attributes in the build planner.':
      'Выберите класс и распределите восемь характеристик в планировщике.',
    'A route, not a checklist': 'Маршрут, а не список заданий',
    'Find your footing': 'Освойтесь в Междуземье',
    'Activate Gatefront’s Site of Grace to meet Melina and receive Torrent. Collect the Limgrave map, visit the Church of Elleh, and use the Stormveil gate route to reach Margit.':
      'Активируйте место благодати у ворот, чтобы встретить Мелину и получить Потока. Найдите карту Замогилья, посетите храм Элле и через ворота Штормвейла доберитесь до Маргита.',
    'Optional early detour: Weeping Peninsula and Castle Morne.':
      'Ранний дополнительный маршрут: Плачущий полуостров и замок Морн.',
    'Defeat Margit, then explore Stormveil Castle for its shortcuts and loot.':
      'Победите Маргита, затем исследуйте замок Штормвейл и найдите короткие пути и добычу.',
    'Suggested range: level 20–30; upgrade your weapon before the castle.':
      'Рекомендуемый уровень: 20–30. Перед замком улучшите оружие.',
    'Reach the Academy': 'Доберитесь до Академии',
    'Enter Liurnia through Stormveil or take the cliff path around it. Find the Academy Glintstone Key west of Raya Lucaria, then defeat Rennala to unlock rebirth.':
      'Попадите в Лиурнию через Штормвейл или обойдите его по скале. Найдите Ключ от Академии Райя Лукария к западу от неё и победите Ренналу, чтобы открыть возможность перерождения.',
    'Explore Caria Manor and the Three Sisters to begin Ranni’s quest.':
      'Исследуйте поместье Кария и Три сестры, чтобы начать задание Ренни.',
    'Raya Lucaria is the next major Great Rune route.':
      'Следующий крупный путь к Великой руне лежит через Райя Лукарию.',
    'Attend the festival': 'Отправляйтесь на фестиваль',
    'Caelid is dangerous early. Prepare for Scarlet Rot, then challenge Starscourge Radahn at Redmane Castle when ready. His defeat opens the way to Nokron.':
      'На ранних этапах Звёздные пустоши опасны. Подготовьтесь к Алой гнили и сразитесь с Раданом Бичом Звёзд в замке Рыжей Гривы. Его поражение откроет путь в Нокрон.',
    'Continue Ranni’s quest in Nokron to obtain the Fingerslayer Blade.':
      'Продолжите задание Ренни в Нокроне и найдите Клинок убийцы Пальцев.',
    'Use Flame, Cleanse Me or boluses for Rot-heavy areas.':
      'В заражённых местах используйте молитву «Пламя, очисти меня» или пилюли от гнили.',
    'Approach the capital': 'Путь к столице',
    'Reach Altus with both Dectus Medallion halves or through the Ruin-Strewn Precipice. Explore Mt. Gelmir and Volcano Manor before entering Leyndell.':
      'Попадите на плато Альтус с обеими половинами медальона Дектуса или через Усыпанный руинами обрыв. До Лейнделла исследуйте Гельмир и Вулканово поместье.',
    'Volcano Manor contracts are optional; Rykard can be defeated without completing all of them.':
      'Задания Вулканова поместья необязательны: Райкарда можно победить, не выполняя их все.',
    'Collect Golden Seeds and Sacred Tears while crossing Altus.':
      'По пути через Альтус собирайте Золотые семена и Священные слёзы.',
    'Claim the capital': 'Завоюйте столицу',
    'Enter Leyndell after claiming two Great Runes. Defeat Morgott to receive the Rold Medallion and gain access to the Mountaintops.':
      'Попадите в Лейнделл, заполучив две Великие руны. Победите Морготта, получите медальон Рольда и откройте путь на Вершины великанов.',
    'Explore the Royal Capital before the final boss of Crumbling Farum Azula changes it.':
      'Исследуйте столицу до того, как победа над финальным боссом Рассыпающегося Фарум-Азулы изменит её.',
    'Finish capital pickups and NPC conversations you do not want to miss.':
      'Соберите всё важное в столице и завершите нужные диалоги с персонажами.',
    'Decide what to finish': 'Завершите важные дела',
    'Cross the Forbidden Lands to the Mountaintops and defeat the Fire Giant. Before using the Forge, finish any remaining Leyndell exploration and side quests.':
      'Пересеките Запретные земли, доберитесь до Вершин великанов и победите Огненного великана. Перед использованием горна завершите исследование Лейнделла и побочные задания.',
    'Haligtree is an optional, high-difficulty endgame area; find both Secret Medallion halves.':
      'Святое Древо — необязательная сложная локация поздней игры. Найдите обе половины Тайного медальона.',
    'Using the Forge advances the story; Maliketh later transforms the capital.':
      'Использование горна продвигает сюжет. Позже Маликет изменит столицу.',
    'Face the final path': 'Последний путь',
    'Complete Crumbling Farum Azula and defeat Maliketh. Return to the changed capital and make your way through the final encounters.':
      'Пройдите Рассыпающийся Фарум-Азула и победите Маликета. Вернитесь в изменившуюся столицу и пройдите последние испытания.',
    'Finish remaining quests and collectables before defeating Maliketh.':
      'Завершите оставшиеся задания и соберите предметы до победы над Маликетом.',
    'After the final boss, choose an available ending interaction.':
      'После финального босса выберите одну из доступных концовок.',
    'Characters move after key events. Talk until dialogue repeats, then check the next listed location. Spoiler details are in the expandable cards.':
      'Персонажи перемещаются после важных событий. Исчерпайте диалог и проверьте следующую локацию. Подробности со спойлерами скрыты в раскрывающихся карточках.',
    'Ranni the Witch': 'Ведьма Ренни',
    'Fia, Deathbed Companion': 'Фия, спутница мёртвых',
    'Loathsome Dung Eater': 'Омерзительный Поедатель Отбросов',
    'Millicent': 'Миллисента',
    'Iron Fist Alexander': 'Александр, Железный Кулак',
    'White Mask Varre': 'Варрэ в Белой Маске',
    'Brother Corhyn & Goldmask': 'Брат Корин и Золотая Маска',
    'After defeating the final boss': 'После победы над финальным боссом',
    'Age of Fracture': 'Эпоха Раскола',
    'Defeat the final boss and choose “Mend the Elden Ring.” No optional ending quest is required.':
      'Победите финального босса и выберите «Восстановить Кольцо Элдена». Дополнительные задания не нужны.',
    'Complete Fia’s quest and use the Mending Rune of the Death-Prince at the end.':
      'Завершите задание Фии и в конце используйте Руны Починки Принца Смерти.',
    'Complete Corhyn and Goldmask’s quest, including the Law of Regression clue, then use the Mending Rune of Perfect Order.':
      'Завершите задание Корина и Золотой Маски, включая загадку о Законе Регрессии, затем используйте Руны Починки Совершенного Порядка.',
    'Complete the Dung Eater’s quest by giving him five Seedbed Curses; use the Mending Rune of the Fell Curse.':
      'Завершите задание Поедателя Отбросов, отдав ему пять Проклятий посева. Используйте Руну Починки Проклятия.',
    'Finish Ranni’s quest. After the final boss, interact with her blue summon sign instead of the Elden Ring.':
      'Завершите задание Ренни. После финального босса взаимодействуйте с её синим знаком призыва, а не с Кольцом Элдена.',
    'Meet the Three Fingers beneath Leyndell. This locks other endings unless you complete Millicent’s quest, obtain Miquella’s Needle, and use it in Dragonlord Placidusax’s arena.':
      'Встретьтесь с Тремя Пальцами под Лейнделлом. Это закроет остальные концовки, если не завершить задание Миллисенты, не получить Иглу Микеллы и не использовать её на арене Повелителя драконов Плацидусакса.',
    'Do not accept the Three Fingers’ embrace until you are sure. The other five endings can remain available together; after the final battle, choose only one for this playthrough.':
      'Не принимайте объятие Трёх Пальцев, пока не будете уверены в выборе. Остальные пять концовок могут оставаться доступными одновременно — после финальной битвы выберите только одну.',
    'A reliable build starts with survivability, a weapon you enjoy, and enough attributes to use it. Tune the exact numbers in the planner.':
      'Надёжная сборка начинается с выживаемости, подходящего оружия и нужных для него характеристик. Настройте точные значения в планировщике.',
    'Vigor is valuable on every build. Many players aim for about 40 by midgame and 60 by endgame; treat these as useful targets, not rules.':
      'Жизненная сила полезна в любой сборке. Многие стремятся к 40 к середине игры и 60 к финалу — это ориентиры, а не строгие правила.',
    'Early weapon upgrades often add more damage than spreading levels across several offensive stats. Find smithing stones and improve one main weapon.':
      'В начале улучшение оружия часто даёт больше урона, чем распределение уровней между несколькими характеристиками. Найдите кузнечные камни и улучшите основное оружие.',
    'Meet weapon requirements first, then focus Strength, Dexterity, Intelligence, Faith, or Arcane according to its scaling and your playstyle.':
      'Сначала выполните требования оружия, затем развивайте Силу, Ловкость, Интеллект, Веру или Колдовство — в зависимости от скейлинга и стиля игры.',
    'Stay below 70% equip load for a medium roll. Endurance raises stamina and maximum equip load, so invest when armor or weapons make you heavy.':
      'Для среднего переката нагрузка должна быть ниже 70%. Выносливость повышает запас сил и переносимый вес — вкладывайте в неё, если экипировка слишком тяжёлая.',
    'How to use this database': 'Как пользоваться базой данных',
    'Choose a category above or from the Database menu. Search filters the entries already loaded; use “Load more” to bring in additional entries.':
      'Выберите категорию выше или в меню базы данных. Поиск работает по уже загруженным записям; нажмите «Загрузить ещё», чтобы получить новые.',
    'Weapon and armor values are base-game reference stats. Spell requirements show the minimum attributes needed to cast them. Ashes of War list their skill and affinity.':
      'Показатели оружия и брони приведены для базовой игры. Требования заклинаний показывают минимальные характеристики для их применения. Для прахов войны указаны навык и свойство.',
    'The map is hosted by MapGenie. Catalog information comes from the Elden Ring Fan API and may contain community-maintained errors.':
      'Карта размещена на MapGenie. Данные каталога поступают из Elden Ring Fan API и могут содержать ошибки сообщества.',
    'Explore regions, Sites of Grace, bosses, quests, equipment, and other points of interest.':
      'Исследуйте регионы, места благодати, боссов, задания, снаряжение и другие интересные места.',
    'Field notes': 'Полевые заметки',
    'Open full map ↗': 'Открыть полную карту ↗',
    'Interactive map provided by': 'Интерактивная карта предоставлена',
    'Catalog data provided by the': 'Данные каталога предоставлены',
    'No soundtrack themes match your search.': 'По запросу ничего не найдено.',
    'Elden Ring Lore & Database': 'История и база данных Elden Ring',
    '© 2026 Elden Ring Fan Project. Made with ambition and dark aesthetics.':
      '© 2026 Фан-проект Elden Ring. Создано с амбициями и мрачной эстетикой.',
    'Elden Ring Lore & Database': 'История и база данных Elden Ring',
    'Elden Ring Trailer': 'Трейлер Elden Ring',
    'Trailer Poster': 'Постер трейлера',
    'Show Shadow of the Erdtree': 'Показать Shadow of the Erdtree',
    'Show Elden Ring Nightreign': 'Показать Elden Ring Nightreign',
    'Show Tarnished of the Land of Shadow': 'Показать Tarnished of the Land of Shadow',
    'Show PvP and Duels': 'Показать PvP и дуэли',
    'Choose a featured game': 'Выберите игру',
    'More from Elden Ring': 'Больше о Elden Ring',
    'Next featured game': 'Следующая игра',
    'Previous featured game': 'Предыдущая игра',
    'Elden Ring games and expansions': 'Игры и дополнения Elden Ring',
    'The open world of the Lands Between, from Limgrave to the Elden Throne. Over a hundred hours of bosses, dungeons and secrets.':
      'Открытый мир Междуземья — от Замогилья до трона Элдена. Боссы, подземелья и тайны на сотни часов.',
    'Master precise parry windows, optimize your stat distribution, and combine devastating Ashes of War with high-tier incantations to claim victory over your opponents.':
      'Освойте точное парирование, распределите характеристики и сочетайте мощные прахи войны с сильными молитвами, чтобы одержать победу.',
    'Journey across vast landscapes filled with hidden dungeons, towering legacy castles, and forgotten ruins. Every horizon holds secrets, rare artifacts, and ancient lore waiting to be uncovered.':
      'Исследуйте бескрайние земли со скрытыми подземельями, огромными замками наследия и забытыми руинами. За каждым горизонтом скрываются тайны, редкие артефакты и древняя история.',
    'Traverse diverse biomes on horseback, discover hidden passages, and chart your own path through a seamless world full of wonder and danger.':
      'Путешествуйте верхом по разнообразным местам, находите тайные проходы и прокладывайте собственный путь по цельному миру, полному чудес и опасностей.',
    'Unveil mysterious underground rivers, catacombs guarded by traps, and optional encounters that challenge even seasoned adventurers. The world rewards curiosity at every turn.':
      'Откройте подземные реки, катакомбы с ловушками и необязательные испытания, опасные даже для опытных искателей приключений. Любопытство здесь вознаграждается.',
    'Interact with enigmatic NPCs, follow intricate questlines, and gather rare crafting materials as you uncover the history of the Shattering.':
      'Знакомьтесь с загадочными персонажами, проходите их цепочки заданий и собирайте редкие материалы, раскрывая историю Раскола.',
    'Journey through breathtaking landscapes, from the golden light of Limgrave and the academy-crested waters of Liurnia to the crimson wasteland of Caelid. Every region has its own distinct identity, dynamic weather, and captivating atmosphere.':
      'Путешествуйте по великолепным землям: от золотых просторов Замогилья и вод Лиурнии с Академией до багровых пустошей Звёздных пустошей. У каждого региона свой облик, погода и атмосфера.',
    'Vast & Diverse Realms': 'Обширные и разнообразные земли',
    'Discover majestic architecture, sprawling subterranean worlds, and quiet vistas that showcase the unforgettable scale and beauty of the Lands Between.':
      'Откройте величественную архитектуру, бескрайние подземные миры и тихие пейзажи, раскрывающие масштаб и красоту Междуземья.',
    'No soundtrack themes match your search.': 'По запросу ничего не найдено.',
    'Elden Ring Lore & Database': 'История и база данных Elden Ring',
    'Elden Ring Lore & Database': 'История и база данных Elden Ring',
    '© 2026 Elden Ring Fan Project. Made with ambition and dark aesthetics.':
      '© 2026 Фан-проект Elden Ring. Создано с амбициями и мрачной эстетикой.',
    'A route, not a checklist': 'Маршрут, а не список заданий',
    '01 · LIMGRAVE': '01 · ЗАМОГИЛЬЕ',
    '02 · LIURNIA': '02 · ЛИУРНИЯ',
    '03 · CAELID': '03 · ЗВЁЗДНЫЕ ПУСТОШИ',
    '04 · ALTUS & GELMIR': '04 · АЛЬТУС И ГЕЛЬМИР',
    '05 · LEYNDELL': '05 · ЛЕЙНДЕЛЛ',
    '06 · MOUNTAINTOPS': '06 · ВЕРШИНЫ ВЕЛИКАНОВ',
    '07 · FARUM AZULA': '07 · ФАРУМ-АЗУЛА',
    'Suggested range: level 40–60.': 'Рекомендуемый уровень: 40–60.',
    'Suggested range: level 60–80.': 'Рекомендуемый уровень: 60–80.',
    'Suggested range: level 70–100.': 'Рекомендуемый уровень: 70–100.',
    'Suggested range: level 90–110.': 'Рекомендуемый уровень: 90–110.',
    'Suggested range: level 100–130.': 'Рекомендуемый уровень: 100–130.',
    'Suggested range: level 120–150 with a well-upgraded weapon.':
      'Рекомендуемый уровень: 120–150 с хорошо улучшенным оружием.',
    'ENDING · RANNI': 'КОНЦОВКА · РЕННИ',
    'ENDING · FIA': 'КОНЦОВКА · ФИЯ',
    'ENDING · DUNG EATER': 'КОНЦОВКА · ПОЕДАТЕЛЬ ОТБРОСОВ',
    'QUEST · MILLICENT': 'ЗАДАНИЕ · МИЛЛИСЕНТА',
    'QUEST · ALEXANDER': 'ЗАДАНИЕ · АЛЕКСАНДР',
    'ENDING · VARRE': 'ЗАДАНИЕ · ВАРРЭ',
    'ENDING · GOLDMASK': 'КОНЦОВКА · ЗОЛОТАЯ МАСКА',
    'Caria Manor · Nokron · Ainsel River': 'Поместье Кария · Нокрон · Река Ансель',
    'Roundtable Hold · Deeproot Depths': 'Крепость Круглого стола · Глубины Глубокого корня',
    'Roundtable Hold · Leyndell sewers · Outer moat':
      'Крепость Круглого стола · Канализация Лейнделла · Внешний ров',
    'Caelid · Altus · Mountaintops · Haligtree':
      'Звёздные пустоши · Альтус · Вершины великанов · Святое Древо',
    'Limgrave · Gael Tunnel · Caelid · Farum Azula':
      'Замогилье · Туннель Гаэля · Звёздные пустоши · Фарум-Азула',
    'The First Step · Rose Church · Mohgwyn Palace':
      'Первый шаг · Храм розы · Дворец Могвинов',
    'Altus Plateau · Leyndell · Mountaintops':
      'Плато Альтус · Лейнделл · Вершины великанов',
    'Meet Ranni at Ranni’s Rise after clearing Caria Manor; agree to serve her.':
      'Встретьтесь с Ренни в её башне после прохождения поместья Кария и согласитесь служить ей.',
    'Speak with Blaidd, Iji, and Seluvis at the tower, then meet Blaidd in Siofra River.':
      'Поговорите в башне с Блайддом, Иджи и Селувисом, затем встретьте Блайдда на реке Сиофра.',
    'Defeat Radahn; enter the crater in Limgrave and retrieve the Fingerslayer Blade from Nokron.':
      'Победите Радана, войдите в кратер в Замогилье и найдите в Нокроне Клинок убийцы Пальцев.',
    'Give the blade to Ranni. Continue through Renna’s Rise, Ainsel River, Nokstella, and the Lake of Rot.':
      'Отдайте клинок Ренни. Продолжите путь через башню Ренны, реку Ансель, Нокстеллу и Озеро гнили.',
    'Defeat Astel, use the Dark Moon Ring at the Cathedral of Manus Celes, and finish her quest.':
      'Победите Астеля, используйте Кольцо тёмной луны в соборе Мануса Селеса и завершите задание.',
    'After the final boss, use Ranni’s blue summon sign to choose her ending.':
      'После финального босса воспользуйтесь синим знаком призыва Ренни, чтобы выбрать её концовку.',
    'Accept Fia’s embrace at the Roundtable Hold and exhaust her dialogue.':
      'Примите объятия Фии в Крепости Круглого стола и исчерпайте все варианты диалога.',
    'Give D the Weathered Dagger when Fia offers it; reload the Hold and find the aftermath.':
      'Отдайте Ди потёртый кинжал, когда Фия его предложит. Перезагрузите локацию и найдите последствия.',
    'Progress through Ranni’s quest until you can obtain the Cursemark of Death.':
      'Продвиньтесь в задании Ренни, чтобы получить Знак проклятия смерти.',
    'Reach Deeproot Depths, speak to Fia, and defeat the champions.':
      'Доберитесь до Глубин Глубокого корня, поговорите с Фией и победите чемпионов.',
    'Give Fia the Cursemark of Death and enter her dream to defeat Lichdragon Fortissax.':
      'Отдайте Фии Знак проклятия смерти и войдите в её сон, чтобы победить дракона-лича Фортисакса.',
    'Collect the Mending Rune of the Death-Prince; use it after the final boss for the Duskborn ending.':
      'Получите Руну Починки Принца Смерти и используйте её после финального босса для концовки Эпохи Сумеречнорожденных.',
    'After reaching Altus, find his apparition at the Roundtable Hold and show him a Seedbed Curse to receive the Sewer-Gaol Key.':
      'Добравшись до Альтуса, найдите его призрак в Крепости Круглого стола и покажите Проклятие посева, чтобы получить ключ от канализации.',
    'Use the key to reach his cell in the Subterranean Shunning-Grounds beneath Leyndell. Speak to him and choose to release him.':
      'Используйте ключ, чтобы попасть в его камеру в Подземелье изгоев под Лейнделлом. Поговорите с ним и освободите его.',
    'Read his message at the Roundtable Hold, then meet and defeat his invasion at the outer moat in Leyndell.':
      'Прочитайте его послание в Крепости Круглого стола, затем найдите и победите его во время вторжения у внешнего рва Лейнделла.',
    'Return to his cell and give him five Seedbed Curses, found across areas including Leyndell, Volcano Manor, and Elphael.':
      'Вернитесь в камеру и отдайте ему пять Проклятий посева. Они находятся, в частности, в Лейнделле, Вулкановом поместье и Эльфаэле.',
    'Collect the Mending Rune of the Fell Curse from him; use it after the final boss for the Blessing of Despair ending.':
      'Получите у него Руну Починки Проклятия и используйте её после финального босса для концовки Благословения Отчаяния.',
    'Speak to Gowry in his shack, retrieve the Unalloyed Gold Needle from Commander O’Neil, and have it repaired.':
      'Поговорите с Гоури в его хижине, заберите Чистую золотую иглу у командира О’Нила и почините её.',
    'Give the needle to Millicent at the Church of the Plague; reload and speak with her again.':
      'Отдайте иглу Миллисенте в Храме чумы, перезагрузите локацию и поговорите с ней снова.',
    'Meet her at Gowry’s Shack, then at the Erdtree-Gazing Hill after she leaves the church.':
      'Встретьте её у хижины Гоури, а после ухода из храма — на холме у Древа Эрд.',
    'Give her the Valkyrie’s Prosthesis in the Shaded Castle; speak to her at Windmill Village after defeating the Godskin Apostle.':
      'Отдайте ей протез Валькирии в Затенённом замке. После победы над Апостолом богохульников поговорите с ней в Деревне ветряных мельниц.',
    'Talk to her at the Ancient Snow Valley Ruins and then at the Prayer Room in Elphael.':
      'Поговорите с ней у древних руин снежной долины, а затем в молельне Эльфаэля.',
    'After defeating the Ulcerated Tree Spirit in Elphael, choose the gold sign to assist her. Return to the pool afterward to recover the Unalloyed Gold Needle; use it to obtain Miquella’s Needle for a late-game ending safeguard.':
      'После победы над Изъязвлённым древесным духом в Эльфаэле выберите золотой знак, чтобы помочь Миллисенте. Затем вернитесь к месту битвы и заберите Чистую золотую иглу. Она понадобится, чтобы получить Иглу Микеллы и сохранить возможность отменить концовку Пламени Безумия.',
    'Free Alexander from the ground north of Agheel Lake; speak with him after helping.':
      'Освободите Александра из земли к северу от озера Эгхил и поговорите с ним после этого.',
    'Meet him in Gael Tunnel and at the Radahn Festival. Speak with him after the battle.':
      'Встретьте его в туннеле Гаэля и на фестивале Радана. Поговорите с ним после битвы.',
    'Find him in the lava near Fort Laiedd on Mt. Gelmir.':
      'Найдите его в лаве у форта Лейдд на горе Гельмир.',
    'Use an Oil Pot to free him in the Mountaintops, then speak with him.':
      'Освободите его на Вершинах великанов с помощью масляного горшка и поговорите с ним.',
    'Meet him in Crumbling Farum Azula and accept his duel. His shard rewards skill-focused builds.':
      'Встретьте его в Рассыпающемся Фарум-Азуле и примите вызов. Его талисман полезен для сборок на навыках оружия.',
    'Speak with Varre at The First Step, then again at Rose Church in Liurnia.':
      'Поговорите с Варрэ у Первого шага, а затем в Храме розы в Лиурнии.',
    'Complete three invasions with his fingers; victories are not required. Offline alternative: defeat Magnus the Beast Claw at Writheblood Ruins using his red summon sign.':
      'Совершите три вторжения с его пальцами — побеждать не обязательно. В автономном режиме победите Магнуса Звериный Коготь, используя красный знак призыва у руин Кровавого следа.',
    'Soak the Lord of Blood’s Favor in a maiden’s blood, then return to Varre.':
      'Пропитайте Благосклонность Повелителя крови кровью девы и вернитесь к Варрэ.',
    'Accept the Pureblood Knight’s Medal to reach Mohgwyn Palace early.':
      'Примите медаль чистокровного рыцаря, чтобы раньше попасть во дворец Могвинов.',
    'Complete his invasion sign near the mausoleum and speak with him for his quest rewards.':
      'Воспользуйтесь знаком вторжения у мавзолея и поговорите с ним, чтобы получить награды за задание.',
    'After reaching Altus, find Corhyn there and meet the silent Goldmask on the Forest-Spanning Greatbridge.':
      'Добравшись до Альтуса, найдите там Корина и встретьте молчаливую Золотую Маску на Великом мосту через лес.',
    'Speak to both, then meet them near the colosseum in Leyndell.':
      'Поговорите с ними обоими, а затем встретьтесь у Колизея в Лейнделле.',
    'Learn Law of Regression (requires 37 Intelligence) and cast it at the statue message in the capital; report the revelation to Goldmask.':
      'Изучите Закон регрессии (требуется 37 Интеллекта) и примените его у послания возле статуи в столице. Расскажите об открытии Золотой Маске.',
    'After the Forge, find them in the Mountaintops and later in the changed capital.':
      'После использования горна найдите их на Вершинах великанов, а позднее — в изменившейся столице.',
    'Collect the Mending Rune of Perfect Order from Goldmask’s body and use it after the final boss for that ending.':
      'Заберите у тела Золотой Маски Руну Починки Совершенного Порядка и используйте её после финального босса.',
  }).map(([key, value]) => [key.replace(/[’‘]/g, "'"), value]),
);
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
let localizationObserver;
let switchBound = false;

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function translateValue(value) {
  if (lang !== 'ru') return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const normalized = normalizeText(value).replace(/[’‘]/g, "'");
  const translated = SITE_RU.get(normalized);
  return translated ? `${leading}${translated}${trailing}` : value;
}

function translateTextNode(node) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue);
  const source = originalText.get(node);
  const translated = lang === 'ru' ? translateValue(source) : source;
  if (node.nodeValue !== translated) node.nodeValue = translated;
}

function translateSite(root = document.documentElement) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    if (
      !root.parentElement?.closest(
        'script, style, noscript, [data-no-translate]',
      )
    ) translateTextNode(root);
  } else if (
    root.nodeType === Node.ELEMENT_NODE ||
    root.nodeType === Node.DOCUMENT_NODE ||
    root.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  ) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest(
          'script, style, noscript, [data-no-translate]',
        )
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  const elements = typeof root.querySelectorAll === 'function'
    ? root.nodeType === Node.ELEMENT_NODE
      ? [root, ...root.querySelectorAll('*')]
      : [...root.querySelectorAll('*')]
    : [];
  elements.forEach((element) => {
    for (const name of ['placeholder', 'aria-label', 'title']) {
      if (!element.hasAttribute(name)) continue;
      let saved = originalAttributes.get(element);
      if (!saved) {
        saved = new Map();
        originalAttributes.set(element, saved);
      }
      if (!saved.has(name)) saved.set(name, element.getAttribute(name));
      const source = saved.get(name);
      const translated = lang === 'ru' ? translateValue(source) : source;
      if (element.getAttribute(name) !== translated)
        element.setAttribute(name, translated);
    }
  });
}

function syncLangSwitch(root = document) {
  root.querySelectorAll?.('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function initSiteLocalization() {
  bindLangSwitch(document);
  translateSite(document.documentElement);
  syncLangSwitch();
  window.addEventListener('lang-change', () => {
    translateSite();
    syncLangSwitch();
  });
  localizationObserver?.disconnect();
  localizationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE)
          translateSite(node);
      });
    });
    syncLangSwitch();
  });
  localizationObserver.observe(document.body, { childList: true, subtree: true });
}

export const getLang = () => lang;
export const t = (key) =>
  DICT[lang][key] ?? DICT.en[key] ?? (lang === 'ru' ? SITE_RU.get(key) : null) ?? key;

// Неизвестное значение показываем как есть: "some_value" -> "some value"
export function statLabel(value) {
  const known = STATS[value];
  if (known) return known[lang === 'ru' ? 1 : 0];
  return String(value).replaceAll('_', ' ');
}

export function setLang(next) {
  if (next !== 'en' && next !== 'ru') return;
  if (next === lang) return;
  lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ничего */
  }
  document.documentElement.lang = next;
  window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang: next } }));
}

document.documentElement.lang = lang;

// Переключатель RU / EN. Разметка; клики ловит bindLangSwitch.
export function langSwitchHtml() {
  const btn = (code) =>
    `<button type="button" class="lang-switch__btn${lang === code ? ' is-active' : ''}" data-lang="${code}" aria-pressed="${lang === code}">${code.toUpperCase()}</button>`;
  return `<div class="lang-switch" role="group" aria-label="Language">${btn('ru')}${btn('en')}</div>`;
}

export function bindLangSwitch(root) {
  if (!root || switchBound) return;
  switchBound = true;
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lang]');
    if (button) setLang(button.dataset.lang);
  });
  window.addEventListener('lang-change', () => syncLangSwitch(root));
  syncLangSwitch(root);
}
