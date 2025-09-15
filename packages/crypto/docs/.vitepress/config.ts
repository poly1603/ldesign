import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/crypto',
  description:
    '一个全面的加解密库，支持所有主流 JavaScript 框架，并专门为 Vue 3 生态系统提供了深度集成',

  base: '/crypto/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/crypto' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quick-start' },
          ],
        },
        {
          text: '核心概念',
          items: [
            { text: '加密算法', link: '/guide/encryption' },
            { text: '哈希算法', link: '/guide/hashing' },
            { text: '编码算法', link: '/guide/encoding' },
            { text: '数字签名', link: '/guide/digital-signature' },
          ],
        },
        {
          text: 'Vue 3 集成',
          items: [
            { text: 'Composition API', link: '/guide/vue-composables' },
            { text: '插件使用', link: '/guide/vue-plugin' },
            { text: '最佳实践', link: '/guide/vue-best-practices' },
          ],
        },
        {
          text: '高级用法',
          items: [
            { text: '自定义配置', link: '/guide/configuration' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '安全考虑', link: '/guide/security' },
          ],
        },
      ],
      '/api/': [
        {
          text: '核心 API',
          items: [
            { text: '概览', link: '/api/' },
            { text: '加密 API', link: '/api/encryption' },
            { text: '解密 API', link: '/api/decryption' },
            { text: '哈希 API', link: '/api/hashing' },
            { text: '编码 API', link: '/api/encoding' },
            { text: '密钥生成', link: '/api/key-generation' },
            { text: '管理器', link: '/api/manager' },
          ],
        },
        {
          text: '工具与类型',
          items: [
            { text: '工具函数', link: '/api/utilities' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
        {
          text: 'Vue 3 API',
          items: [
            { text: 'useCrypto', link: '/guide/vue-composables' },
            { text: '插件使用', link: '/guide/vue-plugin' },
            { text: '最佳实践', link: '/guide/vue-best-practices' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '概览', link: '/examples/' },
            { text: 'AES 加密', link: '/examples/aes' },
            { text: 'RSA 加密', link: '/examples/rsa' },
            { text: '哈希计算', link: '/examples/hash' },
            { text: '编码转换', link: '/examples/encoding' },
            { text: 'DES', link: '/examples/des' },
            { text: '3DES', link: '/examples/tripledes' },
            { text: 'Blowfish', link: '/examples/blowfish' },
            { text: '数字签名', link: '/examples/signature' },
          ],
        },
        {
          text: 'Vue 3 示例',
          items: [
            { text: 'Composition API', link: '/guide/vue-composables' },
            { text: '插件使用', link: '/guide/vue-plugin' },
            { text: '最佳实践', link: '/guide/vue-best-practices' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/crypto' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern:
        'https://github.com/ldesign/crypto/edit/main/packages/crypto/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/crypto/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: '@ldesign/crypto' }],
    ['meta', { name: 'og:image', content: '/crypto/og-image.png' }],
  ],
})
