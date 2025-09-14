import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/tree',
  description: '功能完整的树形组件库',
  base: '/tree/',
  
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例', link: '/examples/' },
      { text: '插件', link: '/plugins/' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
        {
          text: '基础功能',
          items: [
            { text: '数据结构', link: '/guide/data-structure' },
            { text: '选择模式', link: '/guide/selection' },
            { text: '展开收起', link: '/guide/expand-collapse' },
            { text: '搜索过滤', link: '/guide/search' },
          ],
        },
        {
          text: '高级功能',
          items: [
            { text: '拖拽排序', link: '/guide/drag-drop' },
            { text: '异步加载', link: '/guide/async-loading' },
            { text: '虚拟滚动', link: '/guide/virtual-scroll' },
            { text: '节点操作', link: '/guide/node-operations' },
          ],
        },
        {
          text: '定制化',
          items: [
            { text: '主题样式', link: '/guide/theming' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '事件系统', link: '/guide/events' },
          ],
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Angular', link: '/guide/angular' },
          ],
        },
      ],
      
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Tree 类', link: '/api/tree' },
            { text: '配置选项', link: '/api/options' },
            { text: '节点数据', link: '/api/node-data' },
            { text: '事件系统', link: '/api/events' },
            { text: '插件接口', link: '/api/plugins' },
          ],
        },
      ],
      
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础示例', link: '/examples/basic' },
            { text: '选择模式', link: '/examples/selection' },
            { text: '拖拽排序', link: '/examples/drag-drop' },
            { text: '搜索过滤', link: '/examples/search' },
            { text: '异步加载', link: '/examples/async' },
            { text: '虚拟滚动', link: '/examples/virtual-scroll' },
            { text: '自定义主题', link: '/examples/theming' },
            { text: '插件开发', link: '/examples/plugins' },
          ],
        },
      ],
      
      '/plugins/': [
        {
          text: '插件',
          items: [
            { text: '插件概述', link: '/plugins/' },
            { text: '内置插件', link: '/plugins/built-in' },
            { text: '开发插件', link: '/plugins/development' },
            { text: '插件API', link: '/plugins/api' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/tree' },
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 ldesign',
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
})
