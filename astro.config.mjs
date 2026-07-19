// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // A fully static site — every page is prerendered at build time.
  output: 'static',

  // Tailwind CSS v4 via its Vite plugin (no separate config file needed —
  // the theme lives in src/styles/global.css under @theme).
  vite: {
    plugins: [tailwindcss()],
  },

  // Update this to your production URL once you deploy (used for canonical
  // links, sitemaps, etc.). Example: 'https://language-transfer-companion.vercel.app'
  // site: 'https://your-domain.example',
});
