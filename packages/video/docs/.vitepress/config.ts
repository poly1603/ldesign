import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Video Player',
  description: '跨设备、跨框架的现代化视频播放器组件库',
  
  base: '/video/',
  
  head: [
    ['link', { rel: 'icon', href: '/video/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Video Player' }],
    ['meta', { name: 'og:image', content: '/video/og-image.png' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/player' },
      { text: '示例', link: '/examples/basic' },
      { text: '插件', link: '/plugins/overview' },
      { text: '主题', link: '/themes/overview' },
      {
        text: '生态系统',
        items: [
          { text: 'Vue 集成', link: '/frameworks/vue' },
          { text: 'React 集成', link: '/frameworks/react' },
          { text: 'Angular 集成', link: '/frameworks/angular' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '配置选项', link: '/guide/configuration' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '播放器实例', link: '/guide/player-instance' },
            { text: '事件系统', link: '/guide/events' },
            { text: '状态管理', link: '/guide/state-management' },
            { text: '错误处理', link: '/guide/error-handling' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '快捷键', link: '/guide/hotkeys' },
            { text: '手势控制', link: '/guide/gestures' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '无障碍支持', link: '/guide/accessibility' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'VideoPlayer', link: '/api/player' },
            { text: 'PluginManager', link: '/api/plugin-manager' },
            { text: 'ThemeManager', link: '/api/theme-manager' },
            { text: 'HotkeyManager', link: '/api/hotkey-manager' },
            { text: 'GestureManager', link: '/api/gesture-manager' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: 'PlayerOptions', link: '/api/types/player-options' },
            { text: 'PlayerStatus', link: '/api/types/player-status' },
            { text: 'PlayerEvents', link: '/api/types/player-events' },
            { text: 'PluginTypes', link: '/api/types/plugin-types' },
            { text: 'ThemeTypes', link: '/api/types/theme-types' }
          ]
        }
      ],
      
      '/plugins/': [
        {
          text: '插件系统',
          items: [
            { text: '插件概览', link: '/plugins/overview' },
            { text: '插件开发', link: '/plugins/development' },
            { text: '插件生命周期', link: '/plugins/lifecycle' },
            { text: '插件通信', link: '/plugins/communication' }
          ]
        },
        {
          text: '内置插件',
          items: [
            { text: '弹幕插件', link: '/plugins/danmaku' },
            { text: '字幕插件', link: '/plugins/subtitle' },
            { text: '截图插件', link: '/plugins/screenshot' },
            { text: '画中画插件', link: '/plugins/pip' }
          ]
        }
      ],
      
      '/themes/': [
        {
          text: '主题系统',
          items: [
            { text: '主题概览', link: '/themes/overview' },
            { text: '预设主题', link: '/themes/presets' },
            { text: '自定义主题', link: '/themes/customization' },
            { text: '响应式设计', link: '/themes/responsive' }
          ]
        }
      ],
      
      '/frameworks/': [
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/frameworks/vue' },
            { text: 'React', link: '/frameworks/react' },
            { text: 'Angular', link: '/frameworks/angular' },
            { text: '原生 JavaScript', link: '/frameworks/vanilla' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础播放', link: '/examples/basic' },
            { text: '插件使用', link: '/examples/plugins' },
            { text: '主题切换', link: '/examples/themes' },
            { text: '高级功能', link: '/examples/advanced' },
            { text: '跨框架', link: '/examples/frameworks' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-team/video-player' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    editLink: {
      pattern: 'https://github.com/ldesign-team/video-player/edit/main/packages/video/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
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
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
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
    resolve: {
      alias: {
        '@ldesign/video': '../src/index.ts'
      }
    }
  }
})
