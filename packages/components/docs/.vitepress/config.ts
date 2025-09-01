import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'LDesign Components',
  description: 'A comprehensive Stencil-based component library with Vue 3 integration',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#1890ff' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/button' },
      { text: 'Customization', link: '/customization/theming' },
      { text: 'Examples', link: '/examples/basic' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Vue 3 Integration', link: '/guide/vue-integration' },
            { text: 'TypeScript Support', link: '/guide/typescript' },
          ]
        },
        {
          text: 'Development',
          items: [
            { text: 'Contributing', link: '/guide/contributing' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'Building', link: '/guide/building' },
          ]
        }
      ],
      '/components/': [
        {
          text: 'Basic Components',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' },
            { text: 'Icon', link: '/components/icon' },
          ]
        },
        {
          text: 'Layout Components',
          items: [
            { text: 'Card', link: '/components/card' },
          ]
        }
      ],
      '/customization/': [
        {
          text: 'Customization',
          items: [
            { text: 'Theming', link: '/customization/theming' },
            { text: 'CSS Variables', link: '/customization/css-variables' },
            { text: 'Custom Styles', link: '/customization/custom-styles' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/basic' },
            { text: 'Form Examples', link: '/examples/forms' },
            { text: 'Theme Switching', link: '/examples/theme-switching' },
            { text: 'Vue Integration', link: '/examples/vue-integration' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/components' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/components/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
});