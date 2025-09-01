import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign Template',
  description: '🎨 多模板管理及动态渲染系统 - 为 Vue 3 而生的模板管理解决方案',

  // 基础配置
  base: '/template/',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/template/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign Template' }],
    ['meta', { name: 'og:image', content: '/template/og-image.png' }],
  ],

  themeConfig: {
    // 网站标题和Logo
    logo: '/logo.svg',
    siteTitle: 'LDesign Template',

    // 导航栏
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API参考', link: '/api/scanner' },
      { text: '模板库', link: '/templates/overview' },
      { text: '示例', link: '/examples/basic' },
      {
        text: '生态系统',
        items: [
          { text: 'LDesign Cache', link: 'https://cache.ldesign.com' },
          { text: 'LDesign Device', link: 'https://device.ldesign.com' },
          { text: 'LDesign Engine', link: 'https://engine.ldesign.com' },
        ],
      },
      {
        text: 'v0.1.0',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing' },
        ],
      },
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' },
            { text: '项目结构', link: '/guide/project-structure' },
          ],
        },
        {
          text: '核心功能',
          items: [
            { text: '模板扫描', link: '/guide/template-scanning' },
            { text: '模板渲染', link: '/guide/template-rendering' },
            { text: '设备检测', link: '/guide/device-detection' },
            { text: '缓存管理', link: '/guide/caching' },
            { text: '热更新', link: '/guide/hot-reload' },
          ],
        },
        {
          text: '高级特性',
          items: [
            { text: '性能优化', link: '/guide/performance' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '自定义配置', link: '/guide/configuration' },
            { text: '类型安全', link: '/guide/typescript' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心API',
          items: [
            { text: '模板扫描器', link: '/api/scanner' },
            { text: '配置管理器', link: '/api/config' },
            { text: '模板管理器', link: '/api/template-manager' },
            { text: '模板加载器', link: '/api/template-loader' },
          ],
        },
        {
          text: '组合式函数',
          items: [
            { text: 'useTemplateScanner', link: '/api/composables/use-template-scanner' },
            { text: 'useTemplateSelector', link: '/api/composables/use-template-selector' },
            { text: 'useTemplateRenderer', link: '/api/composables/use-template-renderer' },
            { text: 'useDeviceDetection', link: '/api/composables/use-device-detection' },
            { text: 'useTemplateConfig', link: '/api/composables/use-template-config' },
          ],
        },
        {
          text: 'Vue组件',
          items: [
            { text: 'TemplateRenderer', link: '/api/components/template-renderer' },
            { text: 'TemplateSelector', link: '/api/components/template-selector' },
            { text: 'VirtualTemplateSelector', link: '/api/components/virtual-template-selector' },
          ],
        },
        {
          text: '工具函数',
          items: [
            { text: '缓存系统', link: '/api/utils/cache' },
            { text: '文件监听器', link: '/api/utils/file-watcher' },
            { text: '热更新管理器', link: '/api/utils/hot-reload-manager' },
            { text: '性能监控', link: '/api/utils/performance' },
          ],
        },
        {
          text: '类型定义',
          items: [
            { text: '模板类型', link: '/api/types/template' },
            { text: '配置类型', link: '/api/types/config' },
            { text: '设备类型', link: '/api/types/device' },
            { text: '事件类型', link: '/api/types/events' },
          ],
        },
      ],
      '/templates/': [
        {
          text: '模板概览',
          items: [
            { text: '模板库总览', link: '/templates/overview' },
            { text: '模板分类', link: '/templates/categories' },
            { text: '设备适配', link: '/templates/devices' },
            { text: '模板规范', link: '/templates/standards' },
          ],
        },
        {
          text: '认证模板',
          items: [
            { text: '登录模板', link: '/templates/auth/login' },
            { text: '注册模板', link: '/templates/auth/register' },
            { text: '重置密码', link: '/templates/auth/reset-password' },
            { text: '邮箱验证', link: '/templates/auth/verify' },
          ],
        },
        {
          text: '仪表板模板',
          items: [
            { text: '概览仪表板', link: '/templates/dashboard/overview' },
            { text: '数据分析', link: '/templates/dashboard/analytics' },
            { text: '报告中心', link: '/templates/dashboard/reports' },
            { text: '指标监控', link: '/templates/dashboard/metrics' },
          ],
        },
        {
          text: '用户管理模板',
          items: [
            { text: '用户资料', link: '/templates/user/profile' },
            { text: '账户设置', link: '/templates/user/settings' },
            { text: '权限管理', link: '/templates/user/permissions' },
          ],
        },
        {
          text: '表单模板',
          items: [
            { text: '联系表单', link: '/templates/form/contact' },
            { text: '调查问卷', link: '/templates/form/survey' },
            { text: '反馈表单', link: '/templates/form/feedback' },
            { text: '多步骤表单', link: '/templates/form/wizard' },
          ],
        },
        {
          text: '电商模板',
          items: [
            { text: '产品页面', link: '/templates/ecommerce/product' },
            { text: '购物车', link: '/templates/ecommerce/cart' },
            { text: '结账页面', link: '/templates/ecommerce/checkout' },
            { text: '订单管理', link: '/templates/ecommerce/order' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '快速开始', link: '/examples/basic' },
            { text: '模板选择器', link: '/examples/template-selector' },
            { text: '模板渲染器', link: '/examples/template-renderer' },
            { text: '设备适配', link: '/examples/device-adaptation' },
          ],
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义模板', link: '/examples/custom-template' },
            { text: '插件开发', link: '/examples/plugin-development' },
            { text: '性能优化', link: '/examples/performance-optimization' },
            { text: '主题定制', link: '/examples/theme-customization' },
          ],
        },
        {
          text: '集成示例',
          items: [
            { text: 'Vue 3 项目', link: '/examples/vue3-integration' },
            { text: 'Nuxt 3 项目', link: '/examples/nuxt3-integration' },
            { text: 'Vite 项目', link: '/examples/vite-integration' },
            { text: 'TypeScript 项目', link: '/examples/typescript-integration' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign-org/template' },
      { icon: 'discord', link: 'https://discord.gg/ldesign' },
      { icon: 'twitter', link: 'https://twitter.com/ldesign_org' },
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign-org/template/edit/main/packages/template/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    // 最后更新时间
    lastUpdatedText: '最后更新时间',

    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    // 文档页脚导航
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航',
    },

    // 返回顶部
    returnToTopLabel: '返回顶部',

    // 侧边栏菜单标签
    sidebarMenuLabel: '菜单',

    // 深色模式切换标签
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  // Markdown配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    config: (md) => {
      // 自定义markdown插件
    },
  },

  // Vite配置
  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    server: {
      host: true,
      port: 3000,
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
})
