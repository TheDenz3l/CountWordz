import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://wordcounters.dev',

  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/.bg-shell/**'],
      },
    },
  },

  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-ES',
          fr: 'fr-FR',
          de: 'de-DE',
          pt: 'pt-PT',
        },
      },
    }),
  ],
});
