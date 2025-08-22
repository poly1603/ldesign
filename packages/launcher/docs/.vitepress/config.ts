import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vite Launcher',
  description: '🚀 强大的 Vite 前端项目启动器，让创建项目变得简单有趣！',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'author', content: 'Vite Launcher Team' }],
    ['meta', { name: 'keywords', content: 'vite, launcher, frontend, build tool, vue, react, typescript' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '📚 指南', link: '/guide/' },
      { text: '📖 API', link: '/api/' },
      { text: '🛠️ 配置', link: '/config/' },
      { text: '🎯 示例', link: '/examples/' },
      { text: '🤔 FAQ', link: '/faq' },
      {
        text: '🔗 相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/packages/tree/main/packages/launcher' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/launcher' },
          { text: 'Vite', link: 'https://vitejs.dev' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '🚀 快速开始',
          items: [
            { text: '什么是 Vite Launcher？', link: '/guide/' },
            { text: '安装与设置', link: '/guide/installation' },
            { text: '第一个项目', link: '/guide/getting-started' },
          ]
        },
        {
          text: '📖 基础教程',
          items: [
            { text: '创建项目', link: '/guide/creating-projects' },
            { text: '开发服务器', link: '/guide/dev-server' },
            { text: '项目构建', link: '/guide/building' },
            { text: '预览部署', link: '/guide/preview' },
          ]
        },
        {
          text: '🔧 高级功能',
          items: [
            { text: '项目检测', link: '/guide/project-detection' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '配置管理', link: '/guide/configuration' },
            { text: '构建分析', link: '/guide/build-analysis' },
          ]
        },
        {
          text: '🎨 最佳实践',
          items: [
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '调试技巧', link: '/guide/debugging' },
            { text: '部署策略', link: '/guide/deployment' },
          ]
        }
      ],
      '/api/': [
        {
          text: '📚 API 参考',
          items: [
            { text: 'ViteLauncher 类', link: '/api/launcher' },
            { text: '便捷函数', link: '/api/utilities' },
            { text: '类型定义', link: '/api/types' },
            { text: '错误处理', link: '/api/errors' },
          ]
        },
        {
          text: '🛠️ 核心服务',
          items: [
            { text: 'ProjectGenerator', link: '/api/project-generator' },
            { text: 'BuildAnalyzer', link: '/api/build-analyzer' },
            { text: 'ProjectDetector', link: '/api/project-detector' },
            { text: 'ConfigManager', link: '/api/config-manager' },
          ]
        }
      ],
      '/config/': [
        {
          text: '⚙️ 配置选项',
          items: [
            { text: '启动器配置', link: '/config/launcher' },
            { text: '开发服务器', link: '/config/dev-server' },
            { text: '构建配置', link: '/config/build' },
            { text: '预览配置', link: '/config/preview' },
          ]
        },
        {
          text: '🎯 项目模板',
          items: [
            { text: 'Vue 项目', link: '/config/vue-template' },
            { text: 'React 项目', link: '/config/react-template' },
            { text: 'TypeScript 项目', link: '/config/typescript-template' },
            { text: '自定义模板', link: '/config/custom-template' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '💡 使用示例',
          items: [
            { text: '基础用法', link: '/examples/basic' },
            { text: '高级用法', link: '/examples/advanced' },
            { text: 'CLI 集成', link: '/examples/cli' },
            { text: 'CI/CD 集成', link: '/examples/cicd' },
          ]
        },
        {
          text: '🎨 项目模板',
          items: [
            { text: 'Vue 3 + TypeScript', link: '/examples/vue3-ts' },
            { text: 'React + TypeScript', link: '/examples/react-ts' },
            { text: 'Vanilla TypeScript', link: '/examples/vanilla-ts' },
            { text: '多页应用', link: '/examples/multi-page' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/packages' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Vite Launcher Team'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/ldesign/packages/edit/main/packages/launcher/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // 自定义 markdown 配置
    }
  },

  vite: {
    server: {
      port: 5173
    }
  }
})