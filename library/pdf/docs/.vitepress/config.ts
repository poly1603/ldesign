import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/pdf',
  description: '功能完整的PDF预览器库',
  base: '/pdf/',
  
  head: [
    ['link', { rel: 'icon', href: '/pdf/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#007bff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: '@ldesign/pdf' }],
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
          { text: 'GitHub', link: 'https://github.com/ldesign/pdf' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/pdf' },
          { text: '在线演示', link: 'https://ldesign-pdf-demo.vercel.app' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '基础功能',
          items: [
            { text: '文档加载', link: '/guide/document-loading' },
            { text: '页面导航', link: '/guide/page-navigation' },
            { text: '缩放控制', link: '/guide/zoom-control' },
            { text: '页面旋转', link: '/guide/rotation' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '文本搜索', link: '/guide/text-search' },
            { text: '缩略图导航', link: '/guide/thumbnails' },
            { text: '全屏模式', link: '/guide/fullscreen' },
            { text: '下载打印', link: '/guide/download-print' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue3' },
            { text: '原生JavaScript', link: '/guide/vanilla' },
          ],
        },
        {
          text: '配置与定制',
          items: [
            { text: '配置选项', link: '/guide/configuration' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '事件处理', link: '/guide/events' },
          ],
        },
        {
          text: '最佳实践',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '内存管理', link: '/guide/memory-management' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'PdfViewer', link: '/api/pdf-viewer' },
            { text: 'PdfDocumentManager', link: '/api/document-manager' },
            { text: 'PdfPageRenderer', link: '/api/page-renderer' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: '核心类型', link: '/api/types' },
            { text: '配置选项', link: '/api/config-types' },
            { text: '事件类型', link: '/api/event-types' },
          ],
        },
        {
          text: 'Vue 3 集成',
          items: [
            { text: 'PdfViewer 组件', link: '/api/vue-component' },
            { text: 'usePdfViewer Hook', link: '/api/vue-hooks' },
            { text: 'usePdfSearch Hook', link: '/api/vue-search-hook' },
          ],
        },
        {
          text: '工具函数',
          items: [
            { text: '文件工具', link: '/api/file-utils' },
            { text: 'PDF工具', link: '/api/pdf-utils' },
            { text: '缓存管理', link: '/api/cache-manager' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基本使用', link: '/examples/basic' },
            { text: '自定义工具栏', link: '/examples/custom-toolbar' },
            { text: '响应式布局', link: '/examples/responsive' },
          ],
        },
        {
          text: 'Vue 3 示例',
          items: [
            { text: '组件方式', link: '/examples/vue-component' },
            { text: 'Hook方式', link: '/examples/vue-hooks' },
            { text: '完整应用', link: '/examples/vue-app' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '多文档预览', link: '/examples/multi-document' },
            { text: '自定义主题', link: '/examples/custom-theme' },
            { text: '插件扩展', link: '/examples/plugins' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/pdf' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/pdf/edit/main/packages/pdf/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
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
