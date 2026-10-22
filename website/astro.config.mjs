import { defineConfig, passthroughImageService } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeUrls from 'rehype-urls';
import bundleAudioWorkletPlugin from 'vite-plugin-bundle-audioworklet';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import { execSync } from 'child_process';

// DESKTOP=1 собирает автономный Node-сервер (для Electron-десктопа), иначе — Vercel.
const isDesktop = !!process.env.DESKTOP;

import tailwind from '@astrojs/tailwind';
import AstroPWA from '@vite-pwa/astro';

// Get git commit hash
let GIT_COMMIT = 'dev';
try {
  GIT_COMMIT = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.warn('Could not get git commit hash');
}

// Build timestamp
const BUILD_TIME = new Date().toISOString();

// No versioning - just use git commit
const APP_VERSION = GIT_COMMIT;

console.log(`📦 Building Bulka ${GIT_COMMIT}`);

const site = `https://bulka.app/`; // root url without a path
const base = '/'; // base path of the site
const baseNoTrailing = base.endsWith('/') ? base.slice(0, -1) : base;

// English pages (src/pages/en/**) show the English function reference: <JsDoc> gets lang="en".
function englishJsDoc() {
  return (tree, file) => {
    if (!file.history[0].replace(/\\/g, '/').includes('/src/pages/en/')) return;
    const walk = (node) => {
      if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === 'JsDoc') {
        node.attributes = [
          ...node.attributes.filter((a) => a.name !== 'lang'),
          { type: 'mdxJsxAttribute', name: 'lang', value: 'en' },
        ];
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// this rehype plugin fixes relative links
// it works by prepending the base + page path to anchor links
// and by prepending the base path to other relative links starting with /
// this is necessary when using a base href like <base href={base} />
// examples with base as "mybase":
//   #gain -> /mybase/learn/effects/#gain
//   /some/page -> /mybase/some/page
// on English pages (src/pages/en/**) site links get the /en prefix
function relativeURLFix() {
  return (tree, file) => {
    const filePath = file.history[0].replace(/\\/g, '/'); // file.history[0] is the file path
    // mdx imported from packages/*/docs renders inside a page: its own #anchors stay relative
    const isPage = filePath.includes('/src/pages/');
    const path = filePath.split('/src/pages/').pop().slice(0, -4); // only path inside src/pages, without .mdx
    return rehypeUrls((url) => {
      let newHref = baseNoTrailing;
      if (url.href.startsWith('#')) {
        if (!isPage) return;
        // special case: a relative anchor link to the current page
        newHref += `/${path}/${url.href}`;
      } else if (url.href.startsWith('/')) {
        // any other relative url starting with /
        const isAsset = url.pathname.split('/').pop().includes('.');
        if (path.startsWith('en/') && !isAsset && !/^\/(en|api)(\/|$)/.test(url.pathname)) newHref += '/en';
        newHref += url.pathname;
        if (url.pathname.indexOf('.') == -1) {
          // append trailing slash to resource only if there is no file extension
          newHref += url.pathname.endsWith('/') ? '' : '/';
        }
        newHref += url.search || '';
        newHref += url.hash || '';
      } else {
        // leave this URL alone
        return;
      }
      // console.log(url.href + ' -> ', newHref);
      return newHref;
    })(tree);
  };
}
const options = {
  // See https://mdxjs.com/advanced/plugins
  remarkPlugins: [
    remarkToc,
    englishJsDoc,
    // E.g. `remark-frontmatter`
  ],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }], relativeURLFix],
};

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isDesktop ? node({ mode: 'standalone' }) : vercel(),
  // Десктоп: sharp (нативный) не нужен — раздаём картинки как есть, чтобы сервер бандлился автономно.
  ...(isDesktop ? { image: { service: passthroughImageService() } } : {}),
  integrations: [
    react(),
    mdx(options),
    tailwind(),
    AstroPWA({
      experimental: { directoryAndTrailingSlashHandler: true },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        maximumFileSizeToCacheInBytes: 4194304, // 4MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wav,mp3,ogg,ttf,woff2,TTF,otf}'],
        globIgnores: ['img/**', '_astro/csound*.js'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              [
                /^https:\/\/raw\.githubusercontent\.com\/.*/i,
                /^https:\/\/freesound\.org\/.*/i,
                /^https:\/\/cdn\.freesound\.org\/.*/i,
                /^https:\/\/shabda\.ndre\.gr\/.*/i,
                /^https:\/\/felixroos\.github\.io\/webaudiofontdata\/.*/i,
              ].some((regex) => regex.test(url)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-samples',
              expiration: {
                maxEntries: 5000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // <== 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      manifest: {
        includeAssets: ['favicon.ico', 'icons/apple-icon-180.png'],
        name: 'Strudel REPL',
        short_name: 'Strudel',
        description:
          'Strudel is a music live coding environment for the browser, porting the TidalCycles pattern language to JavaScript.',
        theme_color: '#222222',
        icons: [
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  site,
  base,
  vite: {
    plugins: [bundleAudioWorkletPlugin()],
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION),
      __GIT_COMMIT__: JSON.stringify(GIT_COMMIT),
      __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    },
    ssr: {
      // Example: Force a broken package to skip SSR processing, if needed
      // external: ['fraction.js'], // https://github.com/infusion/Fraction.js/issues/51
    },
  },
});
