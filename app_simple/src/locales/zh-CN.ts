/**
 * 中文语言包
 */

export default {
  // 应用信息
  app: {
    name: 'LDesign 简单应用',
    title: 'LDesign 简单应用',
    description: '基于 LDesign Engine 的示例应用',
    copyright: '© 2024 LDesign. 保留所有权利。'
  },

  // 导航菜单
  nav: {
    home: '首页',
    about: '关于',
    dashboard: '仪表盘',
    login: '登录',
    logout: '退出登录',
    language: '语言'
  },

  // 首页
  home: {
    title: '欢迎来到 LDesign',
    subtitle: '现代化、高性能的前端开发框架',
    description: '这是一个基于 @ldesign/engine 构建的简单应用示例',
    features: {
      title: '核心特性',
      list: {
        performance: '极致性能',
        performanceDesc: '基于 Vue 3 构建，提供卓越的运行时性能',
        modular: '模块化架构',
        modularDesc: '灵活的插件系统，按需加载功能',
        typescript: 'TypeScript 支持',
        typescriptDesc: '完整的类型定义，提供最佳的开发体验'
      }
    },
    getStarted: '开始使用',
    learnMore: '了解更多',
    viewDocs: '查看文档',
    currentTime: '当前时间',
    welcomeMessage: '你好，{name}！欢迎使用 LDesign。',
    stats: {
      routes: '路由数量',
      visits: '访问次数',
      cacheSize: '缓存大小'
    }
  },

  // 关于页面
  about: {
    title: '关于 LDesign',
    subtitle: '了解更多关于这个项目的信息',
    description: 'LDesign 是一个现代化的前端开发框架，旨在提供最佳的开发体验和性能。',
    version: '版本',
    author: '作者',
    license: '许可证',
    repository: '代码仓库',
    techStack: '技术栈',
    goals: {
      title: '我们的目标',
      api: '提供简洁而强大的 API',
      performance: '优化性能，减少内存占用',
      typescript: '完善的 TypeScript 支持',
      integration: '与 @ldesign/engine 深度集成',
      extensible: '丰富的功能扩展'
    },
    features: {
      title: '主要特点',
      items: {
        vue3: '基于 Vue 3',
        vite: 'Vite 构建工具',
        typescript: 'TypeScript 支持',
        i18n: '国际化支持',
        router: '智能路由系统',
        engine: '强大的引擎核心'
      },
      vue3Desc: '基于 Vue 3 构建，提供出色的性能',
      viteDesc: '快速的开发服务器和构建工具',
      i18nDesc: '完整的国际化支持'
    },
    team: {
      title: '开发团队',
      description: '由一群充满激情的开发者共同维护'
    },
    contact: {
      title: '联系我们',
      email: '邮箱',
      github: 'GitHub',
      website: '官网',
      community: '讨论区'
    }
  },

  // 登录页面
  login: {
    title: '登录到您的账户',
    subtitle: '请输入您的凭据以继续',
    username: '用户名',
    password: '密码',
    usernamePlaceholder: '请输入用户名',
    passwordPlaceholder: '请输入密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    submit: '登录',
    submitting: '正在登录...',
    noAccount: '还没有账户？',
    register: '立即注册',
    or: '或',
    loginWith: '使用 {provider} 登录',
    errors: {
      required: '此字段是必填的',
      invalid: '用户名或密码错误',
      usernameRequired: '请输入用户名',
      passwordRequired: '请输入密码',
      minLength: '至少需要 {min} 个字符',
      network: '网络错误，请稍后重试'
    },
    success: '登录成功！正在跳转...'
  },

  // 仪表盘页面
  dashboard: {
    title: '仪表盘',
    subtitle: '欢迎回来，{username}',
    currentRoute: '当前路由信息',
    engineStatus: 'Engine 状态',
    appName: '应用名称',
    environment: '环境',
    debugMode: '调试模式',
    routeHistory: '路由历史',
    noHistory: '暂无历史记录',
    performanceMonitor: '性能监控',
    navigationTime: '导航时间',
    cacheHitRate: '缓存命中率',
    totalNavigations: '总导航次数',
    memoryUsage: '内存使用',
    allRoutes: '所有路由',
    auth: '认证',
    requiresAuth: '需要认证',
    public: '公开',
    history: '历史',
    errors: {
      loadHistory: '加载路由历史失败'
    },
    overview: {
      title: '概览',
      totalUsers: '总用户数',
      activeUsers: '活跃用户',
      newUsers: '新用户',
      revenue: '收入'
    },
    stats: {
      title: '统计数据',
      daily: '日',
      weekly: '周',
      monthly: '月',
      yearly: '年'
    },
    activity: {
      title: '最近活动',
      noActivity: '暂无活动记录'
    },
    quickActions: {
      title: '快速操作',
      newPost: '发布新内容',
      viewReports: '查看报告',
      settings: '设置',
      help: '帮助中心'
    },
    notifications: {
      title: '通知',
      markAllRead: '全部标记为已读',
      noNotifications: '暂无新通知'
    }
  },

  // 通用
  common: {
    loading: '加载中...',
    path: '路径',
    name: '名称',
    params: '参数',
    query: '查询',
    unnamed: '未命名',
    on: '开启',
    off: '关闭',
    visit: '访问',
    actions: '操作',
    clear: '清除',
    guest: '访客',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    export: '导出',
    import: '导入',
    refresh: '刷新',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    close: '关闭',
    yes: '是',
    no: '否',
    ok: '确定',
    apply: '应用',
    reset: '重置',
    selectAll: '全选',
    deselectAll: '取消全选',
    more: '更多',
    less: '收起',
    showMore: '显示更多',
    showLess: '显示更少',
    noData: '暂无数据',
    noResults: '没有找到结果',
    tryAgain: '重试',
    viewDetails: '查看详情'
  },

  // 错误信息
  errors: {
    404: {
      title: '页面未找到',
      message: '抱歉，您访问的页面不存在。',
      action: '返回首页',
      back: '返回上一页'
    },
    500: {
      title: '服务器错误',
      message: '抱歉，服务器遇到了问题。',
      action: '刷新页面'
    },
    network: {
      title: '网络错误',
      message: '请检查您的网络连接。',
      action: '重试'
    },
    unauthorized: {
      title: '未授权',
      message: '您需要登录才能访问此页面。',
      action: '去登录'
    },
    forbidden: {
      title: '禁止访问',
      message: '您没有权限访问此页面。',
      action: '返回'
    }
  },

  // 验证消息
  validation: {
    required: '{field}是必填的',
    email: '请输入有效的邮箱地址',
    min: '{field}至少需要{min}个字符',
    max: '{field}不能超过{max}个字符',
    between: '{field}必须在{min}和{max}之间',
    numeric: '{field}必须是数字',
    alphanumeric: '{field}只能包含字母和数字',
    pattern: '{field}格式不正确',
    confirmed: '{field}确认不匹配',
    unique: '{field}已经存在',
    date: '请输入有效的日期',
    dateAfter: '日期必须在{date}之后',
    dateBefore: '日期必须在{date}之前',
    url: '请输入有效的URL',
    phone: '请输入有效的电话号码'
  },

  // 日期时间
  datetime: {
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    thisWeek: '本周',
    lastWeek: '上周',
    nextWeek: '下周',
    thisMonth: '本月',
    lastMonth: '上月',
    nextMonth: '下月',
    thisYear: '今年',
    lastYear: '去年',
    nextYear: '明年',
    selectDate: '选择日期',
    selectTime: '选择时间',
    selectDateTime: '选择日期时间'
  },

  // 主题设置
  theme: {
    title: '主题设置',
    selectThemeColor: '选择主题色',
    customColor: '自定义颜色',
    custom: '当前颜色',
    mode: '主题模式',
    light: '浅色',
    dark: '深色',
    apply: '应用',
    add: '添加',
    remove: '删除',
    searchPlaceholder: '搜索颜色...',
    presetThemes: '预设主题',
    addCustomTheme: '添加自定义主题',
    themeName: '主题名称',
    confirmRemove: '确定要删除该主题吗？',
    presets: {
      blue: '拂晓蓝',
      purple: '酱紫',
      cyan: '明青',
      green: '极光绿',
      magenta: '法式洋红',
      red: '薄暮红',
      orange: '日暮橙',
      yellow: '日出黄',
      volcano: '火山橙',
      geekblue: '极客蓝',
      lime: '青柠绿',
      gold: '金盏花',
      gray: '中性灰',
      'dark-blue': '深海蓝',
      'dark-green': '森林绿',
      // 自定义主题
      sunset: '日落橙',
      forest: '森林绿',
      midnight: '午夜蓝',
      lavender: '薰衣草梦',
      coral: '珊瑚礁'
    }
  }
};
