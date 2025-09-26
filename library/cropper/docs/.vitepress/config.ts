import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/cropper',
  description: '功能强大的图片裁剪插件，支持多设备、多框架',
  
  // 基础配置
  base: '/cropper/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/cropper' },
      { text: '示例', link: '/examples/basic' },
      { text: '更新日志', link: '/changelog' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '配置选项', link: '/guide/configuration' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '图片加载', link: '/guide/image-loading' },
            { text: '裁剪操作', link: '/guide/cropping' },
            { text: '变换操作', link: '/guide/transforms' },
            { text: '导出功能', link: '/guide/export' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '主题系统', link: '/guide/themes' },
            { text: '事件系统', link: '/guide/events' },
            { text: '插件开发', link: '/guide/plugins' },
            { text: '自定义UI', link: '/guide/custom-ui' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
            { text: 'Angular', link: '/guide/angular' },
            { text: '原生JS', link: '/guide/vanilla' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'Cropper 类', link: '/api/cropper' },
            { text: '配置选项', link: '/api/config' },
            { text: '事件系统', link: '/api/events' },
            { text: '类型定义', link: '/api/types' }
          ]
        },
        {
          text: '核心模块',
          items: [
            { text: 'ImageProcessor', link: '/api/image-processor' },
            { text: 'CanvasRenderer', link: '/api/canvas-renderer' },
            { text: 'CropAreaManager', link: '/api/crop-area-manager' },
            { text: 'TransformManager', link: '/api/transform-manager' },
            { text: 'EventManager', link: '/api/event-manager' }
          ]
        },
        {
          text: 'UI 组件',
          items: [
            { text: 'BaseComponent', link: '/api/base-component' },
            { text: 'Button', link: '/api/button' },
            { text: 'Toolbar', link: '/api/toolbar' },
            { text: 'CropToolbar', link: '/api/crop-toolbar' }
          ]
        },
        {
          text: '框架适配器',
          items: [
            { text: 'Vue 适配器', link: '/api/vue-adapter' },
            { text: 'React 适配器', link: '/api/react-adapter' },
            { text: 'Angular 适配器', link: '/api/angular-adapter' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例',
          items: [
            { text: '基本用法', link: '/examples/basic' },
            { text: '图片上传', link: '/examples/upload' },
            { text: '多种形状', link: '/examples/shapes' },
            { text: '预设比例', link: '/examples/aspect-ratios' }
          ]
        },
        {
          text: '高级示例',
          items: [
            { text: '自定义主题', link: '/examples/custom-theme' },
            { text: '多图片处理', link: '/examples/multiple-images' },
            { text: '实时预览', link: '/examples/live-preview' },
            { text: '批量处理', link: '/examples/batch-processing' }
          ]
        },
        {
          text: '框架示例',
          items: [
            { text: 'Vue 3 示例', link: '/examples/vue-example' },
            { text: 'React 示例', link: '/examples/react-example' },
            { text: 'Angular 示例', link: '/examples/angular-example' },
            { text: '原生JS示例', link: '/examples/vanilla-example' }
          ]
        },
        {
          text: '实际应用',
          items: [
            { text: '头像上传', link: '/examples/avatar-upload' },
            { text: '图片编辑器', link: '/examples/image-editor' },
            { text: '证件照处理', link: '/examples/id-photo' },
            { text: '社交媒体', link: '/examples/social-media' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/cropper' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 LDESIGN'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/cropper/edit/main/docs/:path',
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
    theme: 'material-theme-palenight',
    lineNumbers: true,
    config: (md) => {
      // 添加自定义插件
    }
  },

  // 构建配置
  build: {
    outDir: '../dist-docs'
  },

  // 开发服务器配置
  server: {
    port: 3000,
    host: true
  }
})
