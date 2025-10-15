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
   { text: 'API', link: '/api/' },
   { text: 'Vue 集成', link: '/vue/' },
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
      { text: '配置选项', link: '/guide/configuration' },
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
     text: '扩展模块',
     items: [
      { text: '网络模块', link: '/guide/network-module' },
      { text: '电池模块', link: '/guide/battery-module' },
      { text: '地理位置模块', link: '/guide/geolocation-module' },
     ],
    },
    {
     text: '进阶',
     items: [
      { text: '最佳实践', link: '/guide/best-practices' },
      { text: '性能优化', link: '/guide/performance' },
      { text: '常见问题', link: '/guide/faq' },
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
    {
     text: '模块 API',
     items: [
      { text: 'NetworkModule', link: '/api/network-module' },
      { text: 'BatteryModule', link: '/api/battery-module' },
      { text: 'GeolocationModule', link: '/api/geolocation-module' },
     ],
    },
    {
     text: '类型定义',
     items: [
      { text: '类型概览', link: '/api/types' },
     ],
    },
   ],
   '/vue/': [
    {
     text: 'Vue 集成',
     items: [
      { text: 'Vue 概览', link: '/vue/' },
      { text: 'Vue 插件', link: '/vue/plugin' },
     ],
    },
    {
     text: 'Composition API',
     items: [
      { text: 'useDevice', link: '/vue/use-device' },
      { text: 'useNetwork', link: '/vue/use-network' },
      { text: 'useBattery', link: '/vue/use-battery' },
      { text: 'useGeolocation', link: '/vue/use-geolocation' },
     ],
    },
    {
     text: '指令',
     items: [
      { text: '指令概览', link: '/vue/directives' },
     ],
    },
    {
     text: '组件',
     items: [
      { text: 'DeviceInfo', link: '/vue/device-info' },
      { text: 'NetworkStatus', link: '/vue/network-status' },
     ],
    },
   ],
   '/examples/': [
    {
     text: '示例',
     items: [
      { text: '基础使用', link: '/examples/' },
      { text: '响应式设计', link: '/examples/responsive' },
      { text: '网络状态监听', link: '/examples/network' },
      { text: '电池监控', link: '/examples/battery' },
      { text: '地理位置', link: '/examples/geolocation' },
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
