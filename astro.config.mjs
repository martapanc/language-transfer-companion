// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // A fully static site — every page is prerendered at build time.
  output: 'static',

  // Update this to your production URL once you deploy (used for canonical
  // links, sitemaps, etc.). Example: 'https://language-transfer-companion.vercel.app'
  // site: 'https://your-domain.example',
});
