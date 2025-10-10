import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@ldesign/qrcode',
  description: 'A powerful and flexible QR code generator for web applications',
  base: '/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Styling', link: '/guide/styling' },
            { text: 'Logo Integration', link: '/guide/logo' },
            { text: 'Error Correction', link: '/guide/error-correction' },
          ],
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vue', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Vanilla JS', link: '/guide/vanilla' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core API', link: '/api/core' },
            { text: 'Types', link: '/api/types' },
            { text: 'Vue API', link: '/api/vue' },
            { text: 'React API', link: '/api/react' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Examples', link: '/examples/basic' },
            { text: 'Advanced Examples', link: '/examples/advanced' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/qrcode' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present',
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
});
