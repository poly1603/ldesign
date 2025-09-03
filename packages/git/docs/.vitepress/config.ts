import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/git',
  description: '功能完整的 Git 操作封装库',
  base: '/git/',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/git' },
      { text: 'CLI', link: '/cli/commands' },
      { text: '示例', link: '/examples/basic' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '仓库操作', link: '/guide/repository' },
            { text: '分支管理', link: '/guide/branches' },
            { text: '状态查询', link: '/guide/status' },
            { text: '远程仓库', link: '/guide/remote' }
          ]
        },
        {
          text: '高级特性',
          items: [
            { text: '事件系统', link: '/guide/events' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '配置选项', link: '/guide/configuration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Git 主类', link: '/api/git' },
            { text: 'GitRepository', link: '/api/repository' },
            { text: 'GitBranch', link: '/api/branch' },
            { text: 'GitStatus', link: '/api/status' },
            { text: 'GitRemote', link: '/api/remote' },
            { text: 'GitError', link: '/api/error' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/cli/': [
        {
          text: 'CLI 工具',
          items: [
            { text: '命令概览', link: '/cli/commands' },
            { text: '基础操作', link: '/cli/basic' },
            { text: '分支管理', link: '/cli/branches' },
            { text: '远程仓库', link: '/cli/remote' },
            { text: '配置选项', link: '/cli/options' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '使用示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '高级用法', link: '/examples/advanced' },
            { text: '集成示例', link: '/examples/integration' },
            { text: '最佳实践', link: '/examples/best-practices' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/git' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
