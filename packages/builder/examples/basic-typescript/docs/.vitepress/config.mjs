/**
 * VitePress 配置文件
 * 用于 basic-typescript 项目的文档站点
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Basic TypeScript Example',
  description: '基础 TypeScript 库示例 - 展示如何使用 @ldesign/builder 构建简单的 TypeScript 库',
  
  // 基础配置
  base: '/basic-typescript/',
  outDir: '../dist-docs',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: 'API 文档', link: '/api' },
      { text: '示例', link: '/examples' }
    ],
    
    // 侧边栏
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/' },
          { text: '快速开始', link: '/getting-started' },
          { text: '安装', link: '/installation' }
        ]
      },
      {
        text: 'API 参考',
        items: [
          { text: 'API 概览', link: '/api' },
          { text: 'createUser', link: '/api/create-user' },
          { text: 'validateEmail', link: '/api/validate-email' },
          { text: 'formatUser', link: '/api/format-user' }
        ]
      },
      {
        text: '示例',
        items: [
          { text: '基础用法', link: '/examples' },
          { text: '高级用法', link: '/examples/advanced' },
          { text: '集成示例', link: '/examples/integration' }
        ]
      }
    ],
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' }
    ],
    
    // 搜索
    search: {
      provider: 'local'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/builder/examples/basic-typescript/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 LDesign Team'
    }
  },
  
  // Markdown 配置
  markdown: {
    // 代码块主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    
    // 代码块行号
    lineNumbers: true
  },
  
  // Vite 配置
  vite: {
    // 可以在这里添加 Vite 特定的配置
    resolve: {
      alias: {
        '@': '../src'
      }
    }
  }
})
