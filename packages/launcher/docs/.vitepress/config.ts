/**
 * VitePress 配置文件
 *
 * @ldesign/launcher 文档配置
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/launcher',
  description: '基于 Vite JavaScript API 的前端项目启动器',

  // 基础配置
  base: '/launcher/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'CLI', link: '/cli/' },
      { text: '配置', link: '/config/' },
      { text: '插件', link: '/plugins/' },
      { text: '示例', link: '/examples/' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/launcher' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/launcher' },
          { text: 'Vite', link: 'https://vitejs.dev/' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '基础',
          items: [
            { text: '基本概念', link: '/guide/concepts' },
            { text: '配置文件', link: '/guide/config-file' },
            { text: '开发服务器', link: '/guide/dev-server' },
            { text: '生产构建', link: '/guide/build' },
            { text: '预览服务器', link: '/guide/preview' }
          ]
        },
        {
          text: '高级',
          items: [
            { text: '插件系统', link: '/guide/plugins' },
            { text: '性能监控', link: '/guide/performance' },
            { text: '事件系统', link: '/guide/events' },
            { text: '错误处理', link: '/guide/error-handling' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'ViteLauncher', link: '/api/vite-launcher' },
            { text: 'ConfigManager', link: '/api/config-manager' },
            { text: 'PluginManager', link: '/api/plugin-manager' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: '配置类型', link: '/api/types/config' },
            { text: '插件类型', link: '/api/types/plugin' },
            { text: '事件类型', link: '/api/types/events' }
          ]
        },
        {
          text: '工具函数',
          items: [
            { text: '配置工具', link: '/api/utils/config' },
            { text: '服务器工具', link: '/api/utils/server' },
            { text: '构建工具', link: '/api/utils/build' },
            { text: '验证工具', link: '/api/utils/validation' }
          ]
        }
      ],

      '/cli/': [
        {
          text: 'CLI 工具',
          items: [
            { text: '概览', link: '/cli/' },
            { text: 'dev 命令', link: '/cli/dev' },
            { text: 'build 命令', link: '/cli/build' },
            { text: 'preview 命令', link: '/cli/preview' },
            { text: 'config 命令', link: '/cli/config' },
            { text: 'help 命令', link: '/cli/help' },
            { text: 'version 命令', link: '/cli/version' }
          ]
        }
      ],

      '/config/': [
        {
          text: '配置参考',
          items: [
            { text: '概览', link: '/config/' },
            { text: '服务器配置', link: '/config/server' },
            { text: '构建配置', link: '/config/build' },
            { text: '预览配置', link: '/config/preview' },
            { text: 'Launcher 配置', link: '/config/launcher' }
          ]
        }
      ],

      '/plugins/': [
        {
          text: '插件开发',
          items: [
            { text: '概览', link: '/plugins/' },
            { text: '创建插件', link: '/plugins/creating' },
            { text: '插件 API', link: '/plugins/api' },
            { text: '生命周期', link: '/plugins/lifecycle' },
            { text: '最佳实践', link: '/plugins/best-practices' }
          ]
        }
      ],

      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基础用法', link: '/examples/basic' },
            { text: '自定义配置', link: '/examples/custom-config' },
            { text: '插件开发', link: '/examples/plugin-development' },
            { text: '性能优化', link: '/examples/performance' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/launcher' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/launcher/edit/main/packages/launcher/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
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

  // 构建配置
  vite: {
    // Vite 配置
    define: {
      __VUE_OPTIONS_API__: false
    }
  },

  // 站点地图
  sitemap: {
    hostname: 'https://ldesign.github.io/launcher'
  }
})
