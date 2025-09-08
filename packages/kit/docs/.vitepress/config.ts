import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/kit',
  description: '功能完整的 TypeScript 工具包，提供现代 Node.js 开发所需的各种工具模块',

  // 基础配置
  base: '/kit/',
  lang: 'zh-CN',
  ignoreDeadLinks: true,

  // 主题配置
  themeConfig: {
    // 网站标题和 Logo
    siteTitle: '@ldesign/kit',
    logo: '/logo.svg',

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/', activeMatch: '/guide/' },
      { text: 'API 参考', link: '/api/', activeMatch: '/api/' },
      { text: '示例', link: '/examples/', activeMatch: '/examples/' },
      { text: '最佳实践', link: '/best-practices/', activeMatch: '/best-practices/' },
      {
        text: '更多',
        items: [
          { text: '教程', link: '/tutorials/' },
          { text: '故障排除', link: '/troubleshooting/' },
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing/' },
          { text: 'GitHub', link: 'https://github.com/ldesign/kit' },
        ],
      },
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '配置', link: '/guide/configuration' },
            { text: '打包与发布 (tsup)', link: '/guide/build-and-publish' },
          ],
        },
        {
          text: '集成指南',
          items: [
            { text: 'Node.js 项目', link: '/guide/integration/nodejs' },
            { text: 'TypeScript 项目', link: '/guide/integration/typescript' },
            { text: 'Web 应用', link: '/guide/integration/web' },
            { text: 'CLI 工具', link: '/guide/integration/cli' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [{ text: '概览', link: '/api/' }],
        },
        {
          text: '核心模块',
          items: [
            { text: 'Utils 工具', link: '/api/utils' },
            { text: 'FileSystem 文件系统', link: '/api/filesystem' },
            { text: 'Cache 缓存', link: '/api/cache' },
            { text: 'Validation 验证', link: '/api/validation' },
          ],
        },
        {
          text: '开发工具',
          items: [
            { text: 'Git 操作', link: '/api/git' },
            { text: 'Package 包管理', link: '/api/package' },
            { text: 'SSL 证书', link: '/api/ssl' },
            { text: 'CLI 命令行', link: '/api/cli' },
          ],
        },
        {
          text: '用户界面',
          items: [
            { text: 'Inquirer 交互', link: '/api/inquirer' },
            { text: 'Notification 通知', link: '/api/notification' },
            { text: 'Performance 性能', link: '/api/performance' },
          ],
        },
      ],

      '/examples/': [
        {
          text: '使用示例',
          collapsed: false,
          items: [{ text: '概览', link: '/examples/' }],
        },
        {
          text: '基础工具示例',
          collapsed: false,
          items: [
            { text: 'Utils 字符串处理', link: '/examples/utils/string-processing' },
            { text: 'FileSystem 文件操作', link: '/examples/filesystem/' },
            { text: 'Cache 缓存应用', link: '/examples/cache/' },
            { text: 'Validation 数据验证', link: '/examples/validation/' },
          ],
        },
        {
          text: '开发工具示例',
          collapsed: false,
          items: [
            { text: 'Git 版本控制', link: '/examples/git/' },
            { text: 'Package 包管理', link: '/examples/package/' },
            { text: 'SSL 证书管理', link: '/examples/ssl/' },
            { text: 'CLI 命令行应用', link: '/examples/cli/command-line-app' },
          ],
        },
        {
          text: '用户界面示例',
          collapsed: false,
          items: [
            { text: 'Inquirer 交互询问', link: '/examples/inquirer/' },
            { text: 'Notification 系统通知', link: '/examples/notification/' },
            { text: 'Performance 性能监控', link: '/examples/performance/' },
          ],
        },
        {
          text: '综合应用',
          collapsed: false,
          items: [
            { text: 'Web 应用开发', link: '/examples/web-development/' },
            { text: '桌面应用开发', link: '/examples/desktop-development/' },
            { text: 'DevOps 工具', link: '/examples/devops/' },
            { text: '数据处理', link: '/examples/data-processing/' },
          ],
        },
      ],

      '/best-practices/': [
        {
          text: '最佳实践',
          items: [
            { text: '概览', link: '/best-practices/' },
            { text: '性能优化', link: '/best-practices/performance' },
            { text: '错误处理', link: '/best-practices/error-handling' },
            { text: '安全考虑', link: '/best-practices/security' },
            { text: '代码组织', link: '/best-practices/code-organization' },
          ],
        },
      ],

      '/tutorials/': [
        {
          text: '教程',
          collapsed: false,
          items: [{ text: '概览', link: '/tutorials/' }],
        },
        {
          text: '入门教程',
          collapsed: false,
          items: [
            { text: '环境搭建', link: '/tutorials/getting-started/setup' },
            { text: '第一个应用', link: '/tutorials/getting-started/first-app' },
            { text: '基础概念', link: '/tutorials/getting-started/basic-concepts' },
            { text: '常用模式', link: '/tutorials/getting-started/common-patterns' },
          ],
        },
        {
          text: '进阶教程',
          collapsed: false,
          items: [
            { text: '高级特性', link: '/tutorials/advanced/advanced-features' },
            { text: '性能调优', link: '/tutorials/advanced/performance-tuning' },
            { text: '扩展开发', link: '/tutorials/advanced/extension-development' },
            { text: '生产部署', link: '/tutorials/advanced/production-deployment' },
          ],
        },
        {
          text: '专题教程',
          collapsed: false,
          items: [
            { text: '微服务架构', link: '/tutorials/topics/microservices' },
            { text: '实时应用开发', link: '/tutorials/topics/realtime-apps' },
            { text: '数据库集成', link: '/tutorials/topics/database-integration' },
            { text: '第三方服务集成', link: '/tutorials/topics/third-party-integration' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/ldesign/kit' }],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign',
    },

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

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/ldesign/edit/main/packages/kit/docs/:path',
      text: '在 GitHub 上编辑此页面',
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
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    config: md => {
      // 可以在这里添加 markdown-it 插件
    },
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
