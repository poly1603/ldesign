import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/builder',
  description: '智能化前端库打包工具 - 基于 Rollup 的零配置多格式输出',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/start' },
      { text: 'API 参考', link: '/api/build' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/builder' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/start' },
            { text: '配置选项', link: '/guide/config' },
            { text: '构建流程', link: '/guide/build' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '类型声明', link: '/guide/dts' },
            { text: '高级配置', link: '/guide/advanced' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'build', link: '/api/build' },
            { text: 'watch', link: '/api/watch' },
            { text: 'analyze', link: '/api/analyze' },
            { text: 'defineConfig', link: '/api/define-config' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: 'BuildOptions', link: '/api/build-options' },
            { text: 'ProjectScanResult', link: '/api/project-scan-result' },
            { text: 'BuildResult', link: '/api/build-result' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: 'Vue 组件库', link: '/examples/vue' },
            { text: 'React 组件库', link: '/examples/react' },
            { text: 'TypeScript 库', link: '/examples/typescript' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/builder' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/ldesign/builder/edit/main/packages/builder/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
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
})
