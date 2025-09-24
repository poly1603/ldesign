import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LemonForm',
  description: '一个强大、灵活、易用的动态表单库，专为 Vue 3 设计',
  lang: 'zh-CN',

  base: '/',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#f7d51d' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    [
      'meta',
      { property: 'og:title', content: 'LemonForm | Vue 3 动态表单库' },
    ],
    ['meta', { property: 'og:site_name', content: 'LemonForm' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    [
      'meta',
      { property: 'og:url', content: 'https://lemonform.github.io/form/' },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'LemonForm',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '最佳实践', link: '/best-practices' },
      {
        text: '链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/lemonform/form' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@lemonform/form' },
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing' }
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基础概念', link: '/guide/concepts' },
          ],
        },
        {
          text: '使用方式',
          items: [
            { text: 'Vue 组件', link: '/guide/vue-component' },
            { text: 'Composition API', link: '/guide/composition-api' },
            { text: '原生 JavaScript', link: '/guide/vanilla-js' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '表单验证', link: '/guide/validation' },
            { text: '布局系统', link: '/guide/layout' },
            { text: '事件系统', link: '/guide/events' },
            { text: '状态管理', link: '/guide/state-management' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '条件渲染', link: '/guide/conditional-rendering' },
            { text: '动态表单', link: '/guide/dynamic-forms' },
            { text: '自定义组件', link: '/guide/custom-components' },
            { text: '国际化', link: '/guide/i18n' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '组件', link: '/api/components' },
            { text: 'Composables', link: '/api/composables' },
            { text: '类型定义', link: '/api/types' },
            { text: '工具函数', link: '/api/utils' },
          ],
        },
        {
          text: '组件详情',
          items: [
            { text: 'DynamicForm', link: '/api/dynamic-form' },
            { text: 'FormInput', link: '/api/form-input' },
            { text: 'FormSelect', link: '/api/form-select' },
            { text: 'FormCheckbox', link: '/api/form-checkbox' },
            { text: 'FormRadio', link: '/api/form-radio' },
            { text: 'FormDatePicker', link: '/api/form-date-picker' },
            { text: 'FormTimePicker', link: '/api/form-time-picker' },
            { text: 'FormTextarea', link: '/api/form-textarea' },
            { text: 'FormSwitch', link: '/api/form-switch' },
            { text: 'FormSlider', link: '/api/form-slider' },
            { text: 'FormRate', link: '/api/form-rate' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基础表单', link: '/examples/basic' },
            { text: '表单验证', link: '/examples/validation' },
            { text: '布局示例', link: '/examples/layout' },
            { text: '字段类型', link: '/examples/field-types' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '动态表单', link: '/examples/dynamic' },
            { text: '条件渲染', link: '/examples/conditional' },
            { text: '嵌套表单', link: '/examples/nested' },
            { text: '复杂场景', link: '/examples/complex' },
          ],
        },
        {
          text: '实际应用',
          items: [
            { text: '用户注册', link: '/examples/user-registration' },
            { text: '商品配置', link: '/examples/product-config' },
            { text: '调查问卷', link: '/examples/survey' },
            { text: '设置面板', link: '/examples/settings' },
          ],
        },
      ],
      '/theme/': [
        {
          text: '主题系统',
          items: [
            { text: '预设主题', link: '/theme/presets' },
            { text: '自定义主题', link: '/theme/custom' },
            { text: '样式变量', link: '/theme/variables' },
            { text: '主题切换', link: '/theme/switching' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/lemonform/form' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LemonForm Team',
    },

    editLink: {
      pattern:
        'https://github.com/lemonform/form/edit/main/packages/form/docs/:path',
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
          'zh-CN': {
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
    config: (md) => {
      // 添加自定义 markdown 插件
    },
  },

  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, '../'),
        '@ldesign/form': resolve(__dirname, '../../src'),
      },
    },
    define: {
      __VUE_OPTIONS_API__: false,
    },
    server: {
      port: 3000,
      host: true,
    },
  },
})
