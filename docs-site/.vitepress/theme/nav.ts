import type { DefaultTheme } from 'vitepress'

export function getNav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '指南',
      link: '/guide/introduction',
      activeMatch: '/guide/'
    },
    {
      text: '核心包',
      items: [
        {
          text: '数据管理',
          items: [
            { text: 'Cache 缓存', link: '/packages/cache/' },
            { text: 'Store 状态管理', link: '/packages/store/' },
            { text: 'Storage 存储', link: '/packages/storage/' }
          ]
        },
        {
          text: '网络通信',
          items: [
            { text: 'HTTP 客户端', link: '/packages/http/' },
            { text: 'WebSocket', link: '/packages/websocket/' },
            { text: 'API 管理', link: '/packages/api/' }
          ]
        },
        {
          text: '路由导航',
          items: [
            { text: 'Router 路由', link: '/packages/router/' },
            { text: 'Menu 菜单', link: '/packages/menu/' },
            { text: 'Tabs 标签页', link: '/packages/tabs/' }
          ]
        },
        {
          text: '用户体验',
          items: [
            { text: 'Animation 动画', link: '/packages/animation/' },
            { text: 'I18n 国际化', link: '/packages/i18n/' },
            { text: 'Notification 通知', link: '/packages/notification/' },
            { text: 'Color 颜色', link: '/packages/color/' },
            { text: 'Size 尺寸', link: '/packages/size/' }
          ]
        },
        {
          text: '安全认证',
          items: [
            { text: 'Auth 认证', link: '/packages/auth/' },
            { text: 'Crypto 加密', link: '/packages/crypto/' },
            { text: 'Permission 权限', link: '/packages/permission/' }
          ]
        },
        {
          text: '开发工具',
          items: [
            { text: 'Logger 日志', link: '/packages/logger/' },
            { text: 'Validator 验证', link: '/packages/validator/' },
            { text: 'Template 模板', link: '/packages/template/' },
            { text: 'Config 配置', link: '/packages/config/' }
          ]
        }
      ]
    },
    {
      text: '组件库',
      items: [
        {
          text: '编辑器',
          items: [
            { text: 'Code Editor 代码编辑器', link: '/libraries/code-editor/' },
            { text: 'Editor 富文本编辑器', link: '/libraries/editor/' },
            { text: 'Markdown 编辑器', link: '/libraries/markdown/' }
          ]
        },
        {
          text: '数据展示',
          items: [
            { text: 'Table 表格', link: '/libraries/table/' },
            { text: 'Tree 树形控件', link: '/libraries/tree/' },
            { text: 'Timeline 时间轴', link: '/libraries/timeline/' },
            { text: 'Chart 图表', link: '/libraries/chart/' }
          ]
        },
        {
          text: '媒体组件',
          items: [
            { text: '3D Viewer 全景查看器', link: '/libraries/3d-viewer/' },
            { text: 'Video 视频播放器', link: '/libraries/video/' },
            { text: 'Player 音频播放器', link: '/libraries/player/' },
            { text: 'Lottie 动画', link: '/libraries/lottie/' }
          ]
        },
        {
          text: '业务组件',
          items: [
            { text: 'Form 表单', link: '/libraries/form/' },
            { text: 'Upload 上传', link: '/libraries/upload/' },
            { text: 'Cropper 图片裁剪', link: '/libraries/cropper/' },
            { text: 'Signature 签名', link: '/libraries/signature/' }
          ]
        },
        {
          text: '办公组件',
          items: [
            { text: 'Excel 表格', link: '/libraries/excel/' },
            { text: 'Word 文档', link: '/libraries/word/' },
            { text: 'PDF 阅读器', link: '/libraries/pdf/' }
          ]
        }
      ]
    },
    {
      text: '工具链',
      items: [
        { text: 'CLI 命令行工具', link: '/tools/cli/' },
        { text: 'Builder 构建工具', link: '/tools/builder/' },
        { text: 'Analyzer 分析工具', link: '/tools/analyzer/' },
        { text: 'Generator 代码生成器', link: '/tools/generator/' }
      ]
    },
    {
      text: '生态系统',
      items: [
        { text: 'Awesome LDesign', link: '/ecosystem/awesome' },
        { text: '社区资源', link: '/ecosystem/community' },
        { text: '案例展示', link: '/ecosystem/showcase' }
      ]
    },
    {
      text: 'v1.0.0',
      items: [
        { text: '更新日志', link: '/changelog' },
        { text: '从 v0.x 迁移', link: '/migration' }
      ]
    }
  ]
}
