import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/form',
  description:
    '智能表单布局系统 - 支持自适应布局、展开收起、弹窗模式的多框架表单解决方案',

  base: '/form/',

  head: [
    ['link', { rel: 'icon', href: '/form/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    [
      'meta',
      { property: 'og:title', content: '@ldesign/form | 智能表单布局系统' },
    ],
    ['meta', { property: 'og:site_name', content: '@ldesign/form' }],
    ['meta', { property: 'og:image', content: '/form/og-image.png' }],
    [
      'meta',
      { property: 'og:url', content: 'https://ldesign.github.io/form/' },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      { text: '更新日志', link: '/changelog' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/form' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/form' },
          { text: 'Issues', link: 'https://github.com/ldesign/form/issues' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: '基本概念', link: '/guide/concepts' },
            { text: '表单配置', link: '/guide/form-config' },
            { text: '布局系统', link: '/guide/layout' },
            { text: '验证系统', link: '/guide/validation' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: '原生 JavaScript', link: '/guide/native' },
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Angular', link: '/guide/angular' },
            { text: 'Svelte', link: '/guide/svelte' },
          ],
        },
        {
          text: '高级',
          items: [
            { text: '自定义组件', link: '/guide/custom-components' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '插件开发', link: '/guide/plugins' },
            { text: '性能优化', link: '/guide/performance' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '表单管理器', link: '/api/form-manager' },
            { text: '布局计算器', link: '/api/layout-calculator' },
            { text: '验证引擎', link: '/api/validation-engine' },
            { text: '渲染器', link: '/api/renderer' },
          ],
        },
        {
          text: '适配器',
          items: [
            { text: '原生适配器', link: '/api/native-adapter' },
            { text: 'Vue 适配器', link: '/api/vue-adapter' },
            { text: 'React 适配器', link: '/api/react-adapter' },
            { text: 'Angular 适配器', link: '/api/angular-adapter' },
            { text: 'Svelte 适配器', link: '/api/svelte-adapter' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: '表单类型', link: '/api/types/form' },
            { text: '布局类型', link: '/api/types/layout' },
            { text: '验证类型', link: '/api/types/validation' },
            { text: '事件类型', link: '/api/types/events' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本表单', link: '/examples/basic' },
            { text: '响应式布局', link: '/examples/responsive' },
            { text: '表单验证', link: '/examples/validation' },
            { text: '动态表单', link: '/examples/dynamic' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '多步骤表单', link: '/examples/multi-step' },
            { text: '弹窗表单', link: '/examples/modal' },
            { text: '表单分组', link: '/examples/grouping' },
            { text: '文件上传', link: '/examples/file-upload' },
          ],
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 示例', link: '/examples/vue-examples' },
            { text: 'React 示例', link: '/examples/react-examples' },
            { text: 'Angular 示例', link: '/examples/angular-examples' },
            { text: 'Svelte 示例', link: '/examples/svelte-examples' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/form' }],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/form/edit/main/packages/form/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    lastUpdated: {
      text: '最后更新于',
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
    config: md => {
      // 添加自定义 markdown 插件
    },
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
  },
})
