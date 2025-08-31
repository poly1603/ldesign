import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/shared',
  description: 'LDesign 共享工具库 - 提供通用的工具函数、Vue Hooks 和类型定义',
  base: '/shared/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '工具函数', link: '/utils/array' },
      { text: 'Vue Hooks', link: '/hooks/use-async-validator' },
      { text: 'API 参考', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/ldesign/shared' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '迁移指南', link: '/guide/migration' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '工具函数', link: '/guide/utils' },
            { text: 'Vue Hooks', link: '/guide/hooks' },
            { text: '类型定义', link: '/guide/types' }
          ]
        }
      ],
      '/utils/': [
        {
          text: '工具函数',
          items: [
            { text: '数组操作', link: '/utils/array' },
            { text: '浏览器相关', link: '/utils/browser' },
            { text: '日期处理', link: '/utils/date' },
            { text: 'DOM 操作', link: '/utils/dom' },
            { text: '缓动函数', link: '/utils/easing' },
            { text: '文件处理', link: '/utils/file' },
            { text: '格式化', link: '/utils/format' },
            { text: '通用工具', link: '/utils/general' },
            { text: '观察者', link: '/utils/observe' },
            { text: '渲染节点', link: '/utils/render-node' },
            { text: '样式设置', link: '/utils/set-style' },
            { text: '字符串处理', link: '/utils/string' },
            { text: '树结构', link: '/utils/tree' },
            { text: '验证函数', link: '/utils/validate' },
            { text: '安装工具', link: '/utils/with-install' }
          ]
        }
      ],

      '/hooks/': [
        {
          text: 'Vue Hooks',
          items: [
            { text: '异步数据', link: '/hooks/use-async-data' },
            { text: '异步验证器', link: '/hooks/use-async-validator' },
            { text: '剪贴板', link: '/hooks/use-clipboard' },
            { text: '暗黑模式', link: '/hooks/use-dark-mode' },
            { text: '防抖', link: '/hooks/use-debounce' },
            { text: '默认值', link: '/hooks/use-default-value' },
            { text: '元素懒渲染', link: '/hooks/use-element-lazy-render' },
            { text: '数据获取', link: '/hooks/use-fetch' },
            { text: '表单管理', link: '/hooks/use-form' },
            { text: '表单验证', link: '/hooks/use-form-validation' },
            { text: '全屏', link: '/hooks/use-fullscreen' },
            { text: '无限滚动', link: '/hooks/use-infinite-scroll' },
            { text: '交叉观察器', link: '/hooks/use-intersection-observer' },
            { text: '懒加载', link: '/hooks/use-lazy-load' },
            { text: '事件监听', link: '/hooks/use-listener' },
            { text: '本地存储', link: '/hooks/use-local-storage' },
            { text: '模态框', link: '/hooks/use-modal' },
            { text: '变更观察', link: '/hooks/use-mutation-observable' },
            { text: '网络状态', link: '/hooks/use-network' },
            { text: '分页', link: '/hooks/use-pagination' },
            { text: '尺寸观察器', link: '/hooks/use-resize-observer' },
            { text: '提示', link: '/hooks/use-toast' },
            { text: '双向绑定', link: '/hooks/use-v-model' },
            { text: '虚拟列表', link: '/hooks/use-virtual-list' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],

    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/shared' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/shared/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 LDesign'
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
