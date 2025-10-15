import { defineConfig } from 'vitepress'

export default defineConfig({
 title: '@ldesign/device',
 description: '现代化的设备检测库 - 轻量、强大、易用',
 base: '/device/',

 head: [
  ['link', { rel: 'icon', href: '/device/favicon.ico' }],
  ['meta', { name: 'theme-color', content: '#646cff' }],
 ],

 themeConfig: {
  logo: '/logo.svg',

  nav: [
   { text: '指南', link: '/guide/' },
   { text: '模块', link: '/modules/' },
   { text: 'API', link: '/api/' },
   { text: 'Vue', link: '/vue/' },
   { text: '示例', link: '/examples/' },
   {
    text: '相关链接',
    items: [
     { text: 'GitHub', link: 'https://github.com/ldesign-org/device' },
     {
      text: 'NPM',
      link: 'https://www.npmjs.com/package/@ldesign/device',
     },
    ],
   },
  ],

  sidebar: {
   '/guide/': [
    {
     text: '开始',
     items: [
      { text: '介绍', link: '/guide/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '核心概念', link: '/guide/core-concepts' },
     ],
    },
    {
     text: '核心功能',
     items: [
      { text: '设备检测', link: '/guide/device-detection' },
      { text: '事件系统', link: '/guide/events' },
      { text: '模块系统', link: '/guide/modules' },
     ],
    },
    {
     text: '进阶',
     items: [
      { text: '最佳实践', link: '/guide/best-practices' },
      { text: '常见问题', link: '/guide/faq' },
     ],
    },
   ],
   '/modules/': [
    {
     text: '功能模块',
     items: [
      { text: '模块概览', link: '/modules/' },
      { text: 'FeatureDetectionModule', link: '/modules/feature-detection' },
      { text: 'PerformanceModule', link: '/modules/performance' },
      { text: 'NetworkModule', link: '/modules/network' },
      { text: 'BatteryModule', link: '/modules/battery' },
      { text: 'MediaModule', link: '/modules/media' },
      { text: 'GeolocationModule', link: '/modules/geolocation' },
     ],
    },
   ],
   '/api/': [
    {
     text: 'API 参考',
     items: [
      { text: 'API 概览', link: '/api/' },
      { text: 'DeviceDetector', link: '/api/device-detector' },
      { text: 'EventEmitter', link: '/api/event-emitter' },
      { text: 'ModuleLoader', link: '/api/module-loader' },
     ],
    },
   ],
   '/vue/': [
    {
     text: 'Vue 集成',
     items: [
      { text: 'Vue 概览', link: '/vue/' },
      { text: 'useDevice 组合式 API', link: '/vue/composables' },
      { text: 'Vue 插件', link: '/vue/plugin' },
      { text: 'Vue 指令', link: '/vue/directives' },
     ],
    },
   ],
   '/examples/': [
    {
     text: '示例',
     items: [
      { text: '基础示例', link: '/examples/' },
      { text: '响应式设计', link: '/examples/responsive' },
      { text: '性能优化', link: '/examples/performance' },
      { text: '渐进增强', link: '/examples/progressive' },
     ],
    },
   ],
  },

  socialLinks: [
   { icon: 'github', link: 'https://github.com/ldesign-org/device' },
  ],

  footer: {
   message: 'Released under the MIT License.',
   copyright: 'Copyright © 2024 LDesign',
  },

  search: {
   provider: 'local',
  },
 },

 markdown: {
  theme: {
   light: 'github-light',
   dark: 'github-dark',
  },
  lineNumbers: true,
 },

 vite: {
  define: {
   __VUE_OPTIONS_API__: false,
  },
 },
})
