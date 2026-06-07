import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      mkdirSync(dist, { recursive: true });
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));
      copyFileSync(
        resolve(__dirname, 'src/pages/file-access-help.html'),
        resolve(dist, 'file-access-help.html'),
      );
      const iconsSrc = resolve(__dirname, 'public/icons');
      const iconsDest = resolve(dist, 'icons');
      mkdirSync(iconsDest, { recursive: true });
      for (const size of [16, 32, 48, 128]) {
        copyFileSync(resolve(iconsSrc, `icon${size}.png`), resolve(iconsDest, `icon${size}.png`));
      }
      const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf-8'));
      manifest.background.service_worker = 'service-worker.js';
      manifest.web_accessible_resources = [
        {
          resources: ['assets/*', 'main.js', 'loader.js', 'content.css'],
          matches: ['http://*/*', 'https://*/*', 'file://*/*'],
        },
      ];
      writeFileSync(resolve(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        loader: resolve(__dirname, 'src/content/loader.ts'),
        main: resolve(__dirname, 'src/content/main.tsx'),
        'file-access-help': resolve(__dirname, 'src/pages/file-access-help.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'content.css';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
