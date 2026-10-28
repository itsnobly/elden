//  Запуск один раз:  npm i -D sharp  &&  node scripts/export-bosses.mjs

import { mkdir, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';

const API = 'https://eldenring.fanapis.com/api/bosses';
const PAGE_SIZE = 20;
const IMG_DIR = 'assets/img/bosses';
const IMG_WIDTH = 640;
const CONCURRENCY = 6;

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadAllBosses() {
  const first = await getJson(`${API}?limit=${PAGE_SIZE}&page=0`);
  const pages = Math.ceil(first.total / PAGE_SIZE);
  const list = [...first.data];

  for (let page = 1; page < pages; page++) {
    list.push(
      ...(await getJson(`${API}?limit=${PAGE_SIZE}&page=${page}`)).data,
    );
  }

  const seen = new Set();
  return list.filter((boss) => !seen.has(boss.id) && seen.add(boss.id));
}

async function saveImage(boss) {
  if (!boss.image) return null;

  const file = `${IMG_DIR}/${boss.id}.webp`;
  if (await exists(file)) return `/${file}`;

  try {
    const response = await fetch(boss.image);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .resize({ width: IMG_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(file);

    return `/${file}`;
  } catch (error) {
    console.warn(`Картинка не скачалась: ${boss.name} (${error.message})`);
    return boss.image; // оставляем ссылку на оригинал
  }
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir('data', { recursive: true });

  console.log('Загружаю список боссов...');
  const bosses = await loadAllBosses();
  console.log(`Боссов: ${bosses.length}. Скачиваю картинки...`);

  let done = 0;
  const queue = [...bosses];

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const boss = queue.shift();
        boss.image = await saveImage(boss);
        process.stdout.write(`\r${++done}/${bosses.length}`);
      }
    }),
  );

  await writeFile('data/bosses.json', JSON.stringify(bosses, null, 2));
  console.log('\nГотово: data/bosses.json и картинки в', IMG_DIR);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
