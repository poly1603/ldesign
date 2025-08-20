import { defineConfig } from 'vitepress';
import { resolve } from 'path';

export default defineConfig({
  title: 'LDesign Web Components',
  description: 'Cross-framework component library built with StencilJS',
  lang: 'zh-CN',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'LDesign Web Components',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '介绍',
          items: [
            { text: '什么是 LDesign Web Components', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
        {
          text: '使用指南',
          items: [
            { text: '在 HTML 中使用', link: '/guide/usage-html' },
            { text: '在 Vue 中使用', link: '/guide/usage-vue' },
            { text: '在 React 中使用', link: '/guide/usage-react' },
            { text: '在 Angular 中使用', link: '/guide/usage-angular' },
          ],
        },
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Textarea 多行文本框', link: '/components/textarea' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present LDesign Team',
    },
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/components/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },
  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('ld-'),
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
});
