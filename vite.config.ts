import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true
  },
  plugins: [{
    name: 'route-entrypoints-and-worker-precache',
    closeBundle() {
      const indexPath = resolve('dist', 'index.html');
      let index = readFileSync(indexPath, 'utf8');
      // Keep the app shell self-contained for a controlled offline reload. The
      // hashed files remain available for normal cacheable delivery as well.
      index = index.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, (_match, source: string) => {
        const code = readFileSync(resolve('dist', source.replace(/^\//, '')), 'utf8');
        return `<script type="module">${code}</script>`;
      });
      index = index.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, (_match, source: string) => {
        const css = readFileSync(resolve('dist', source.replace(/^\//, '')), 'utf8');
        return `<style>${css}</style>`;
      });
      writeFileSync(indexPath, index);
      for (const route of ['privacy', 'terms']) {
        const folder = resolve('dist', route);
        mkdirSync(folder, { recursive: true });
        copyFileSync(indexPath, resolve(folder, 'index.html'));
      }
      const builtAssets = readdirSync(resolve('dist', 'assets'))
        .filter((file) => !file.endsWith('.map') && !/^(icon-|mark\.|page-pointer-)/.test(file))
        .map((file) => `/assets/${file}`);
      const workerPath = resolve('dist', 'sw.js');
      const worker = readFileSync(workerPath, 'utf8').replace('/* BUILD_ASSETS */', builtAssets.map((asset) => JSON.stringify(asset)).join(', '));
      writeFileSync(workerPath, worker);
      copyFileSync(resolve('staticwebapp.config.json'), resolve('dist', 'staticwebapp.config.json'));
    }
  }]
});
