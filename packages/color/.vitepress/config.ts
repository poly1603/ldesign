/**
 * VitePress 配置文件
 *
 * 为 @ldesign/color 包提供完整的文档站点配置
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  // 站点基本信息
  title: '@ldesign/color',
  description: '功能强大、性能卓越的现代颜色处理库',
  base: '/color/',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '架构', link: '/summary/' },
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '颜色转换', link: '/guide/color-conversion' },
            { text: '调色板生成', link: '/guide/palette-generation' },
            { text: '可访问性检查', link: '/guide/accessibility' },
            { text: '主题管理', link: '/guide/theme-management' },
          ],
        },
        {
          text: 'Vue 集成',
          items: [
            { text: 'Vue 插件', link: '/guide/vue-plugin' },
            { text: '组件使用', link: '/guide/vue-components' },
            { text: '组合式 API', link: '/guide/composition-api' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '自定义扩展', link: '/guide/customization' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '颜色处理', link: '/api/color-processing' },
            { text: '调色板', link: '/api/palette' },
            { text: '可访问性', link: '/api/accessibility' },
            { text: '主题管理', link: '/api/theme-management' },
          ],
        },
        {
          text: 'Vue 组件',
          items: [
            { text: 'ColorPicker', link: '/api/components/color-picker' },
            { text: 'PaletteGenerator', link: '/api/components/palette-generator' },
            { text: 'AccessibilityChecker', link: '/api/components/accessibility-checker' },
            { text: 'ThemeToggle', link: '/api/components/theme-toggle' },
          ],
        },
        {
          text: '工具类',
          items: [
            { text: 'ThemeManager', link: '/api/utils/theme-manager' },
            { text: 'ColorGenerator', link: '/api/utils/color-generator' },
            { text: 'IdleProcessor', link: '/api/utils/idle-processor' },
            { text: 'Cache', link: '/api/utils/cache' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例项目',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: '颜色转换器', link: '/examples/color-converter' },
            { text: '调色板工具', link: '/examples/palette-tool' },
            { text: '主题切换器', link: '/examples/theme-switcher' },
            { text: '可访问性检查器', link: '/examples/accessibility-checker' },
          ],
        },
        {
          text: '集成示例',
          items: [
            { text: 'Vue 3 项目', link: '/examples/vue3-integration' },
            { text: 'Nuxt 3 项目', link: '/examples/nuxt3-integration' },
            { text: 'Vite 项目', link: '/examples/vite-integration' },
          ],
        },
      ],
      '/summary/': [
        {
          text: '项目架构',
          items: [
            { text: '概览', link: '/summary/' },
            { text: '主要功能', link: '/summary/features' },
            { text: '设计理念', link: '/summary/design-philosophy' },
            { text: '架构设计', link: '/summary/architecture' },
            { text: '实现细节', link: '/summary/implementation' },
            { text: '使用指南', link: '/summary/usage-guide' },
            { text: '扩展性设计', link: '/summary/extensibility' },
            { text: '项目总结', link: '/summary/conclusion' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/color' }],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign',
    },

    // 搜索
    search: {
      provider: 'local',
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/color/edit/main/packages/color/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  // Markdown 配置
  markdown: {
    // 代码块主题
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },

    // 代码块行号
    lineNumbers: true,

    // 代码块复制按钮
    codeTransformers: [
      // 自定义代码转换器可以在这里添加
    ],
  },

  // 构建配置
  build: {
    outDir: '../dist-docs',
  },

  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
  },
})
