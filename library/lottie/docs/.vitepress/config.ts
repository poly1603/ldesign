import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/lottie',
  description: 'A powerful, feature-rich Lottie animation manager for any framework',
  base: '/lottie/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/vanilla' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'LottieManager', link: '/guide/lottie-manager' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Events', link: '/guide/events' },
            { text: 'Performance', link: '/guide/performance' },
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vanilla JS', link: '/guide/vanilla' },
            { text: 'Vue', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Instance Pool', link: '/guide/instance-pool' },
            { text: 'Caching', link: '/guide/caching' },
            { text: 'Performance Monitoring', link: '/guide/monitoring' },
            { text: 'Custom Loaders', link: '/guide/custom-loaders' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core', link: '/api/core' },
            { text: 'LottieManager', link: '/api/lottie-manager' },
            { text: 'LottieInstance', link: '/api/lottie-instance' },
            { text: 'Types', link: '/api/types' },
          ]
        },
        {
          text: 'Framework APIs',
          items: [
            { text: 'Vue API', link: '/api/vue' },
            { text: 'React API', link: '/api/react' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Vanilla JS', link: '/examples/vanilla' },
            { text: 'Vue', link: '/examples/vue' },
            { text: 'React', link: '/examples/react' },
          ]
        },
        {
          text: 'Use Cases',
          items: [
            { text: 'Loading Animations', link: '/examples/loading' },
            { text: 'Interactive Animations', link: '/examples/interactive' },
            { text: 'Background Animations', link: '/examples/background' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/lottie' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign Team'
    },

    search: {
      provider: 'local'
    }
  }
})
