import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/builder',
  description: '强大的库构建工具，支持 TypeScript、Vue、样式等多种项目类型',
  
  // 基础配置
  base: '/builder/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/start' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '配置', link: '/configuration' },
      {
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/builder' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/builder' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/start' },
            { text: '配置文件', link: '/guide/config' },
            { text: '构建项目', link: '/guide/build' },
            { text: '迁移指南', link: '/guide/migration' }
          ]
        },
        {
          text: '进阶指南',
          items: [
            { text: 'API 使用', link: '/guide/api' },
            { text: '类型声明', link: '/guide/dts' },
            { text: '高级配置', link: '/guide/advanced' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'build', link: '/api/build' },
            { text: 'watch', link: '/api/watch' },
            { text: 'analyze', link: '/api/analyze' },
            { text: 'clean', link: '/api/clean' },
            { text: 'examples', link: '/api/examples' },
            { text: 'init', link: '/api/init' },
            { text: 'define-config', link: '/api/define-config' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: 'BuildOptions', link: '/api/build-options' },
            { text: 'BuildResult', link: '/api/build-result' },
            { text: 'ProjectScanResult', link: '/api/project-scan-result' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: '基本用法', link: '/examples/basic' },
            { text: 'TypeScript 库', link: '/examples/typescript' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 组件库', link: '/examples/vue' },
            { text: 'React 组件库', link: '/examples/react' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/builder' }
    ],
    
    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
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
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/builder/edit/main/packages/builder/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },
    
    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    
    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign Team'
    },
    
    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    }
  },
  
  // Markdown 配置
  markdown: {
    // 代码块主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    
    // 代码块配置
    lineNumbers: true,
    
    // 容器配置
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '警告',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
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
    hostname: 'https://ldesign.github.io/builder'
  }
})
