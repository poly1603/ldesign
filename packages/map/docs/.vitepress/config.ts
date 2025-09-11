import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/map',
  description: '功能全面的地图插件，支持多种地图类型和框架',
  base: '/ldesign-map/',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: '示例', link: '/examples/basic' },
      { text: 'GitHub', link: 'https://github.com/ldesign/map' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '地图基础', link: '/guide/map-basics' },
            { text: '标记点', link: '/guide/markers' },
            { text: '图层管理', link: '/guide/layers' },
            { text: '路径规划', link: '/guide/routing' },
            { text: '地理围栏', link: '/guide/geofence' },
            { text: '热力图', link: '/guide/heatmap' },
            { text: '地址搜索', link: '/guide/search' },
            { text: '测量工具', link: '/guide/measurement' },
            { text: '3D地图', link: '/guide/3d' },
            { text: '行政区划', link: '/guide/administrative' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: '原生 JavaScript', link: '/guide/vanilla' }
          ]
        },
        {
          text: '高级主题',
          items: [
            { text: '样式定制', link: '/guide/styling' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '故障排除', link: '/guide/troubleshooting' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心 API', link: '/api/core' },
            { text: '类型定义', link: '/api/types' },
            { text: '地图引擎', link: '/api/engine' },
            { text: '功能模块', link: '/api/modules' }
          ]
        },
        {
          text: '模块 API',
          items: [
            { text: '路径规划', link: '/api/routing' },
            { text: '地理围栏', link: '/api/geofence' },
            { text: '热力图', link: '/api/heatmap' },
            { text: '搜索', link: '/api/search' },
            { text: '测量', link: '/api/measurement' },
            { text: '图层', link: '/api/layers' },
            { text: '3D', link: '/api/3d' },
            { text: '行政区划', link: '/api/administrative' }
          ]
        },
        {
          text: '适配器 API',
          items: [
            { text: 'Vue 适配器', link: '/api/vue' },
            { text: 'React 适配器', link: '/api/react' },
            { text: '原生适配器', link: '/api/vanilla' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本地图', link: '/examples/basic' },
            { text: '标记点', link: '/examples/markers' },
            { text: '弹窗', link: '/examples/popups' }
          ]
        },
        {
          text: '功能示例',
          items: [
            { text: '路径规划', link: '/examples/routing' },
            { text: '地理围栏', link: '/examples/geofence' },
            { text: '热力图', link: '/examples/heatmap' },
            { text: '搜索', link: '/examples/search' },
            { text: '测量', link: '/examples/measurement' }
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 示例', link: '/examples/vue' },
            { text: 'React 示例', link: '/examples/react' },
            { text: '原生 JS 示例', link: '/examples/vanilla' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义样式', link: '/examples/custom-styling' },
            { text: '多地图实例', link: '/examples/multiple-maps' },
            { text: '数据可视化', link: '/examples/data-visualization' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/map' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDESIGN'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
