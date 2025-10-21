import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'LDesign DatePicker',
  description: '功能丰富、性能优秀、框架无关的日期时间选择器',
  lang: 'zh-CN',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/datepicker' },
      { text: 'API', link: '/api/props' },
      { text: 'GitHub', link: 'https://github.com/ldesign/datepicker' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ],
        },
        {
          text: '进阶',
          items: [
            { text: '国际化', link: '/guide/i18n' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '可访问性', link: '/guide/accessibility' },
          ],
        },
      ],
      
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'DatePicker', link: '/components/datepicker' },
            { text: '日期选择', link: '/components/date' },
            { text: '日期范围', link: '/components/daterange' },
            { text: '月份选择', link: '/components/month' },
            { text: '年份选择', link: '/components/year' },
            { text: '时间选择', link: '/components/time' },
          ],
        },
      ],
      
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Props', link: '/api/props' },
            { text: 'Events', link: '/api/events' },
            { text: 'Methods', link: '/api/methods' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/datepicker' },
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team',
    },
    
    search: {
      provider: 'local',
    },
  },
});





