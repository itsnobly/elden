import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const bossDataFiles = ['main.json', 'dlc.json', 'optional.json', 'ru.json', 'items.json', 'difficulty.json'];

export default defineConfig({
  plugins: [
    {
      name: 'copy-boss-data',
      apply: 'build',
      async closeBundle() {
        const outputDirectory = resolve(projectRoot, 'dist/data');
        await mkdir(outputDirectory, { recursive: true });
        await Promise.all(
          bossDataFiles.map((file) =>
            copyFile(resolve(projectRoot, 'data', file), resolve(outputDirectory, file)),
          ),
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        bosses: resolve(projectRoot, 'pages/bosses.html'),
      },
    },
  },
});
