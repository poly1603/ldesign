import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Template Examples',
  description: '智能模板切换演示项目 - 完整的登录页面模板解决方案',
  
  // 基础配置
  base: '/ldesign-template-examples/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'API 文档', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/your-org/ldesign' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '模板系统', link: '/guide/templates' },
            { text: '动态加载', link: '/guide/dynamic-loading' },
            { text: '切换动画', link: '/guide/animations' },
            { text: '响应式设计', link: '/guide/responsive' }
          ]
        },
        {
          text: '组件',
          items: [
            { text: '登录表单', link: '/guide/components/login-form' },
            { text: '验证码', link: '/guide/components/captcha' },
            { text: '动画包装器', link: '/guide/components/animation-wrapper' }
          ]
        },
        {
          text: '定制化',
          items: [
            { text: '主题定制', link: '/guide/customization/themes' },
            { text: '样式覆盖', link: '/guide/customization/styles' },
            { text: '自定义模板', link: '/guide/customization/templates' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '组件 API', link: '/api/components' },
            { text: 'Composables', link: '/api/composables' },
            { text: '工具函数', link: '/api/utils' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/' },
            { text: '桌面端模板', link: '/examples/desktop' },
            { text: '平板端模板', link: '/examples/tablet' },
            { text: '移动端模板', link: '/examples/mobile' },
            { text: '动画效果', link: '/examples/animations' },
            { text: '自定义主题', link: '/examples/custom-themes' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/ldesign' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-org/ldesign/edit/main/packages/template/examples/docs/:path',
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
    theme: 'github-dark',
    lineNumbers: true,
    config: (md) => {
      // 添加自定义 markdown 插件
    }
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
          javascriptEnabled: true
        }
      }
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Template Examples' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }]
  ]
})
