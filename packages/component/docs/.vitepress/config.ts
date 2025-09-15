import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Component',
  description: '基于 Vue 3 + TypeScript + Vite 的现代化组件库',

  // 基础配置
  base: '/',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: '设计', link: '/design/color' },
      { text: 'API', link: '/api/' },
      {
        text: '更多',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: 'GitHub', link: 'https://github.com/ldesign/ldesign' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '按需引入', link: '/guide/tree-shaking' }
          ]
        },
        {
          text: '开发',
          items: [
            { text: '组件开发规范', link: '/guide/component-development' },
            { text: '贡献指南', link: '/guide/contributing' }
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' }
          ]
        },
        {
          text: '表单组件',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'Radio 单选框', link: '/components/radio' },
            { text: 'Switch 开关', link: '/components/switch' }
          ]
        },
        {
          text: '布局组件',
          items: [
            { text: 'Card 卡片', link: '/components/card' }
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Badge 徽标', link: '/components/badge' },
            { text: 'Tag 标签', link: '/components/tag' }
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Loading 加载', link: '/components/loading' }
          ]
        }
      ],
      '/design/': [
        {
          text: '设计语言',
          items: [
            { text: '色彩', link: '/design/color' },
            { text: '字体', link: '/design/typography' },
            { text: '间距', link: '/design/spacing' },
            { text: '图标', link: '/design/icons' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/ldesign' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/component/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    // 文档页脚导航
    docFooter: {
      prev: '上一页',
      next: '下一页'
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
    lineNumbers: true,

    // 代码组
    codeTransformers: []
  },

  // Vite 配置
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `
            @import "../src/styles/variables.less";
            @import "../src/styles/mixins.less";
          `
        }
      }
    },
    define: {
      // 支持 Vue 3 组件
      'process.env': {},
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    },
    optimizeDeps: {
      // 预构建 Vue 组件
      include: ['vue', 'lucide-vue-next']
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Component' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }]
  ],

  // 站点地图
  sitemap: {
    hostname: 'https://ldesign.github.io'
  }
})
