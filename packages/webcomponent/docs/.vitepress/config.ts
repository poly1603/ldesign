import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LDesign WebComponent',
  description: '基于 Stencil 的高质量 Web Components 组件库',
  base: '/ldesign-webcomponent/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#722ED1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'LDesign WebComponent' }],
  ],

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('ldesign-') || tag.startsWith('l-')
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: '组件', link: '/components/button' },
      { text: '设计', link: '/design/tokens' },
      {
        text: '资源',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/webcomponent' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/@ldesign/webcomponent' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theming' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '最佳实践', link: '/guide/best-practices' },
          ]
        }
      ],
      '/components/': [
        {
          text: '基础组件',
          items: [
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Icon 图标', link: '/components/icon' },
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Draggable 拖拽缩放', link: '/components/draggable' },
          ]
        },
        {
          text: '导航组件',
          items: [
            { text: 'Menu 菜单', link: '/components/menu' },
            { text: 'Tabs 选项卡', link: '/components/tabs' },
            { text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
            { text: 'DropdownPanel 下拉面板', link: '/components/dropdown-panel' },
            { text: 'Pagination 分页', link: '/components/pagination' },
            { text: 'CircleNavigation 圆形导航', link: '/components/circle-navigation' },
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Avatar 头像', link: '/components/avatar' },
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Image 图片', link: '/components/image' },
            { text: 'ImageViewer 图片预览器', link: '/components/image-viewer' },
            { text: 'Ellipsis 文本省略', link: '/components/ellipsis' },
            { text: 'Swiper 轮播图', link: '/components/swiper' },
            { text: 'Draggable 拖拽缩放', link: '/components/draggable' },
            { text: 'Tree 树', link: '/components/tree' },
            { text: 'Calendar 日历', link: '/components/calendar' },
            { text: 'Countdown 倒计时', link: '/components/countdown' },
          ]
        },
        {
          text: '布局组件',
          items: [
            { text: 'Affix 固钉', link: '/components/affix' },
            { text: 'BackTop 返回顶部', link: '/components/backtop' },
            { text: 'Grid 栅格布局', link: '/components/grid' },
            { text: 'Space 间距', link: '/components/space' },
            { text: 'ResizeBox 伸缩框', link: '/components/resize-box' },
            { text: 'Split 面板分割', link: '/components/split' },
            { text: 'Scrollbar 滚动条', link: '/components/scrollbar' },
          ]
        },
        {
          text: '表单组件',
          items: [
            { text: 'Input 输入框', link: '/components/input' },
            { text: 'InputNumber 数字输入框', link: '/components/input-number' },
            { text: 'Mention 提及', link: '/components/mention' },
            { text: 'Select 选择器', link: '/components/select' },
            { text: 'Transfer 穿梭框', link: '/components/transfer' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'Radio 单选框', link: '/components/radio' },
            { text: 'Switch 开关', link: '/components/switch' },
            { text: 'Slider 滑块', link: '/components/slider' },
            { text: 'ColorPicker 颜色选择器', link: '/components/color-picker' },
            { text: 'ColorPickerPanel 颜色选择面板', link: '/components/color-picker-panel' },
            { text: 'Rate 评分', link: '/components/rate' },
            { text: 'TimePicker 时间选择器', link: '/components/time-picker' },
            { text: 'DatePicker 日期选择器', link: '/components/date-picker' },
            { text: 'Picker 滚轮选择器', link: '/components/picker' },
          ]
        },
        {
          text: '反馈组件',
          items: [
            { text: 'Collapse 折叠面板', link: '/components/collapse' },
            { text: 'Popup 弹出层', link: '/components/popup' },
            { text: 'Popconfirm 气泡确认框', link: '/components/popconfirm' },
            { text: 'Tooltip 工具提示', link: '/components/tooltip' },
            { text: 'Modal 模态框', link: '/components/modal' },
            { text: 'Drawer 抽屉', link: '/components/drawer' },
            { text: 'Alert 警告', link: '/components/alert' },
            { text: 'Message 全局提示', link: '/components/message' },
            { text: 'Notification 通知提醒', link: '/components/notification' },
            { text: 'Loading 加载', link: '/components/loading' },
            { text: 'Progress 进度条', link: '/components/progress' },
            { text: 'Ripple 水波纹', link: '/components/ripple' },
          ]
        }
      ],
      '/design/': [
        {
          text: '设计规范',
          items: [
            { text: '设计令牌', link: '/design/tokens' },
            { text: '颜色系统', link: '/design/colors' },
            { text: '字体排版', link: '/design/typography' },
            { text: '间距系统', link: '/design/spacing' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/webcomponent' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/webcomponent/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
    },
    server: {
      port: 5173,
      host: true
    },
    // 确保正确处理 webcomponent 的模块解析
    resolve: {
      alias: {
        '@ldesign/webcomponent': '/packages/webcomponent/dist/ldesign-webcomponent/ldesign-webcomponent.esm.js'
      }
    },
    optimizeDeps: {
      include: ['@ldesign/webcomponent/loader'],
      exclude: ['@ldesign/webcomponent']
    }
  }
})
