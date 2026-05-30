// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { astroImageTools } from 'astro-imagetools';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://ericfrommelt.com',
  integrations: [mdx(), sitemap(), astroImageTools, react()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});