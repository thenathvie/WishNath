import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : fonctionne sur Firebase Hosting comme sur GitHub Pages.
  base: './',
  build: { target: 'es2020', sourcemap: false },
});
