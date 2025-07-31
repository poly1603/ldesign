import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/device',
  description: '现代化的设备检测库，支持 Vue 3 集成',
  base: '/device/',
  
  head: [
    ['link', { rel: 'icon', href: '/device/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign-org/device' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/device' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '设备检测', link: '/guide/device-detection' },
            { text: '事件系统', link: '/guide/events' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'DeviceDetector', link: '/api/device-detector' },
            { text: 'EventEmitter', link: '/api/event-emitter' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-org/device' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
  },
})