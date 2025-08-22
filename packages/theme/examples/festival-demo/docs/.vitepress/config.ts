/**
 * @ldesign/theme - VitePress 文档配置
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Festival Demo',
  description: '节日主题挂件系统演示文档',

  // 基础配置
  base: '/festival-demo/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' },
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '基础概念', link: '/guide/concepts' },
            { text: '主题系统', link: '/guide/theme-system' },
            { text: '挂件系统', link: '/guide/widget-system' },
            { text: '自定义开发', link: '/guide/customization' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '主题管理器', link: '/api/theme-manager' },
            { text: '挂件管理器', link: '/api/widget-manager' },
            { text: '主题切换器', link: '/api/theme-switcher' },
            { text: '辅助函数', link: '/api/helpers' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '主题切换', link: '/examples/theme-switching' },
            { text: '挂件应用', link: '/examples/widget-application' },
            { text: '自定义主题', link: '/examples/custom-theme' },
            { text: '高级配置', link: '/examples/advanced' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' },
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    // 搜索
    search: {
      provider: 'local',
    },

    // 编辑链接
    editLink: {
      pattern:
        'https://github.com/ldesign/ldesign/edit/main/packages/theme/examples/festival-demo/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  // Markdown 配置
  markdown: {
    theme: 'github-dark',
    lineNumbers: true,

    // 代码组
    config: md => {
      // 自定义 markdown 插件
    },
  },

  // 构建配置
  build: {
    outDir: '../dist-docs',
  },

  // 开发服务器配置
  server: {
    port: 5174,
    host: true,
  },
})
