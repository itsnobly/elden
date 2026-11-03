import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const bossDataFiles = [
  'main.json',
  'dlc.json',
  'optional.json',
  'ru.json',
  'items.json',
  'difficulty.json',
];

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(projectRoot, 'partials'),
      // Указываем явный путь к корню шаблонов, чтобы вложенные страницы видели partials
      reloadOnPartialChange: true,
    }),
    {
      name: 'copy-boss-data',
      apply: 'build',
      async closeBundle() {
        const outputDirectory = resolve(projectRoot, 'dist/data');
        await mkdir(outputDirectory, { recursive: true });
        await Promise.all(
          bossDataFiles.map((file) =>
            copyFile(
              resolve(projectRoot, 'data', file),
              resolve(outputDirectory, file),
            ),
          ),
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        bosses: resolve(projectRoot, 'pages/bosses/bosses.html'),
        boss: resolve(projectRoot, 'pages/bosses/boss.html'),
        classes: resolve(projectRoot, 'pages/guide/classes.html'),
        class: resolve(projectRoot, 'pages/guide/class.html'),
        tools: resolve(projectRoot, 'pages/tools/tools.html'),
        arsenal: resolve(projectRoot, 'pages/arsenal.html'),
        guide: resolve(projectRoot, 'pages/guide.html'),
        music: resolve(projectRoot, 'pages/music.html'),
      },
    },
  },
});
