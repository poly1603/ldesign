import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/pdf-viewer',
  description: 'A powerful, feature-rich PDF viewer library that works with any framework',
  base: '/pdf-viewer/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Usage',
          items: [
            { text: 'Vanilla JavaScript', link: '/guide/vanilla' },
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Events', link: '/guide/events' },
            { text: 'Theming', link: '/guide/theming' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'PDFViewer', link: '/api/pdf-viewer' },
            { text: 'Vue Components', link: '/api/vue' },
            { text: 'Types', link: '/api/types' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/pdf-viewer' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present ldesign'
    },

    search: {
      provider: 'local'
    }
  }
})
