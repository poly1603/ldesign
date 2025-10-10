import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@ldesign/pdf',
  description: '功能强大的PDF阅读器插件',
  lang: 'zh-CN',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/pdf' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '配置选项', link: '/guide/configuration' },
            { text: '事件系统', link: '/guide/events' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '搜索功能', link: '/guide/search' },
            { text: '缩略图', link: '/guide/thumbnails' },
            { text: '打印下载', link: '/guide/print-download' },
            { text: '插件系统', link: '/guide/plugins' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: '原生 JS', link: '/guide/vanilla' },
          ],
        },
        {
          text: '其他',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'PDFViewer', link: '/api/pdf-viewer' },
            { text: '配置选项', link: '/api/config' },
            { text: '事件', link: '/api/events' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: 'Vue API',
          items: [
            { text: 'PDFViewer 组件', link: '/api/vue-component' },
            { text: 'usePDFViewer', link: '/api/use-pdf-viewer' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础示例', link: '/examples/basic' },
            { text: '高级功能', link: '/examples/advanced' },
            { text: 'Vue 3 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/pdf' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present ldesign',
    },

    search: {
      provider: 'local',
    },
  },
});
