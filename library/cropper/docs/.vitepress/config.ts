import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/cropper',
  description: 'A powerful, flexible image cropper library that works with any framework',
  base: '/cropper/',
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/cropper' },
      { text: 'Examples', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/cropper' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Basic Usage', link: '/guide/basic-usage' }
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vanilla JavaScript', link: '/guide/vanilla-js' },
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Angular', link: '/guide/angular' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Methods', link: '/guide/methods' },
            { text: 'Events', link: '/guide/events' },
            { text: 'Plugins', link: '/guide/plugins' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Cropper', link: '/api/cropper' },
            { text: 'Options', link: '/api/options' },
            { text: 'Methods', link: '/api/methods' },
            { text: 'Events', link: '/api/events' },
            { text: 'Types', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Examples', link: '/examples/' },
            { text: 'Advanced Examples', link: '/examples/advanced' },
            { text: 'Mobile Examples', link: '/examples/mobile' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/cropper' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present ldesign'
    },

    search: {
      provider: 'local'
    }
  }
})
