export const zhCN = {
  // 通用
  common: {
    ok: '确定',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    submit: '提交',
    reset: '重置',
    search: '搜索',
    loading: '加载中...',
    sending: '发送中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    retry: '重试',
    refresh: '刷新',
    configure: '配置',
    view: '查看'
  },

  // 导航
  nav: {
    home: '首页',
    dashboard: '仪表板',
    login: '登录',
    register: '注册',
    profile: '个人资料',
    settings: '设置',
    about: '关于',
    logout: '退出登录'
  },

  // 认证
  auth: {
    // 通用
    login: '登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    email: '邮箱',
    confirmPassword: '确认密码',
    usernamePlaceholder: '请输入用户名',
    passwordPlaceholder: '请输入密码',
    emailPlaceholder: '请输入邮箱地址',
    confirmPasswordPlaceholder: '请再次输入密码',
    loggingIn: '登录中...',
    registering: '注册中...',
    welcome: '欢迎',
    loginToAccount: '登录您的账户',
    noAccount: '还没有账户？',
    alreadyHaveAccount: '已有账户？',
    createAccount: '创建账户',
    passwordMismatch: '两次输入的密码不一致',

    // 登录相关
    loginTitle: '用户登录',
    loginSubtitle: '欢迎回来，请登录您的账户',
    remember: '记住我',
    forgotPassword: '忘记密码？',
    loginButton: '登录',
    registerLink: '立即注册',
    loginSuccess: '登录成功',
    loginFailed: '登录失败',
    invalidCredentials: '用户名或密码错误',
    accountLocked: '账户已被锁定，请稍后再试',

    // 注册相关
    registerTitle: '用户注册',
    registerSubtitle: '创建您的新账户',
    registerButton: '注册',
    hasAccount: '已有账户？',
    loginLink: '立即登录',
    registerSuccess: '注册成功',
    registerFailed: '注册失败',
    usernameExists: '用户名已存在',
    emailExists: '邮箱已被注册',

    // 忘记密码
    forgotPasswordTitle: '忘记密码',
    forgotPasswordSubtitle: '请输入您的邮箱地址，我们将发送重置链接',
    sendButton: '发送重置链接',
    backToLogin: '返回登录',
    emailSent: '重置链接已发送到您的邮箱',
    emailNotFound: '邮箱地址不存在'
  },

  // 仪表板
  dashboard: {
    title: '仪表板',
    welcome: '欢迎回来，{username}',
    overview: '概览',
    statistics: '统计数据',
    recentActivity: '最近活动',
    quickActions: '快速操作'
  },

  // 个人资料
  profile: {
    title: '个人资料',
    subtitle: '管理您的个人信息',
    basicInfo: '基本信息',
    avatar: '头像',
    changeAvatar: '更换头像',
    username: '用户名',
    email: '邮箱',
    phone: '电话',
    bio: '个人简介',
    role: '角色',
    joinDate: '加入时间',
    updateSuccess: '资料更新成功',
    updateFailed: '资料更新失败'
  },

  // 设置
  settings: {
    title: '系统设置',
    subtitle: '管理您的应用设置',
    general: '常规设置',
    securityTab: '安全设置',
    appearanceTab: '外观设置',
    language: '语言',
    theme: '主题',
    notifications: '通知设置',
    privacy: '隐私设置',
    emailNotifications: '邮件通知',
    pushNotifications: '推送通知',

    // 外观设置
    appearance: {
      title: '外观设置',
      theme: {
        label: '主题模式',
        light: '浅色主题',
        dark: '深色主题',
        auto: '跟随系统'
      },
      primaryColor: '主色调',
      borderRadius: '圆角大小',
      watermark: {
        title: '水印设置',
        enabled: '启用水印',
        text: '水印文本',
        showUserInfo: '显示用户信息',
        showTimestamp: '显示时间戳',
        opacity: '透明度',
        fontSize: '字体大小',
        angle: '旋转角度'
      }
    },

    // 安全设置
    security: {
      title: '安全设置',
      changePassword: '修改密码',
      currentPassword: '当前密码',
      newPassword: '新密码',
      confirmNewPassword: '确认新密码',
      twoFactor: '双因素认证',
      loginHistory: '登录历史',
      activeSessions: '活跃会话'
    }
  },

  // 模板
  templates: {
    title: '模板展示',
    subtitle: '浏览和选择应用模板',
    loginTemplates: '登录模板',
    classic: '经典模板',
    modern: '现代模板',
    minimal: '简约模板',
    creative: '创意模板',
    switchTemplate: '切换模板',
    preview: '预览',
    apply: '应用',
    select: '选择',
    noTemplates: '暂无模板',
    categories: {
      all: '全部',
      login: '登录模板',
      dashboard: '仪表板模板',
      admin: '管理模板'
    },
    status: {
      active: '可用',
      beta: '测试版',
      deprecated: '已弃用'
    }
  },

  // 错误页面
  error: {
    404: {
      title: '页面未找到',
      message: '抱歉，您访问的页面不存在',
      backHome: '返回首页'
    },
    500: {
      title: '服务器错误',
      message: '服务器遇到了一些问题，请稍后再试',
      retry: '重试'
    },
    network: {
      title: '网络错误',
      message: '网络连接失败，请检查您的网络设置',
      offline: '您当前处于离线状态'
    },
    suggestions: {
      title: '您可以尝试：',
      checkUrl: '检查网址是否正确',
      useNavigation: '使用导航菜单',
      contactSupport: '联系技术支持',
      waitAndRetry: '等待几分钟后重试',
      checkStatus: '检查服务状态页面',
      contactAdmin: '联系系统管理员',
      reportIssue: '报告此问题'
    },
    quickLinks: {
      title: '快速链接'
    },
    details: {
      title: '错误详情',
      time: '发生时间',
      id: '错误ID',
      status: '状态码'
    },
    support: {
      title: '需要帮助？',
      description: '如果问题持续存在，请联系我们的技术支持团队。',
      reportIssue: '报告问题',
      contactSupport: '联系支持',
      issueReported: '问题已报告，我们会尽快处理。'
    },
    showDetails: '显示详情',
    hideDetails: '隐藏详情'
  },

  // 表单验证
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    minLength: '至少需要 {min} 个字符',
    maxLength: '最多只能输入 {max} 个字符',
    pattern: '格式不正确',
    numeric: '请输入数字',
    phone: '请输入有效的手机号码',
    url: '请输入有效的URL地址'
  },

  // 通知消息
  notification: {
    loginSuccess: '登录成功，欢迎回来！',
    logoutSuccess: '已安全退出登录',
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    updateSuccess: '更新成功',
    operationFailed: '操作失败，请重试',
    networkError: '网络连接失败',
    permissionDenied: '权限不足',
    sessionExpired: '会话已过期，请重新登录'
  },

  // 时间相关
  time: {
    now: '刚刚',
    minutesAgo: '{count} 分钟前',
    hoursAgo: '{count} 小时前',
    daysAgo: '{count} 天前',
    weeksAgo: '{count} 周前',
    monthsAgo: '{count} 个月前',
    yearsAgo: '{count} 年前'
  },

  // 关于
  about: {
    title: '关于我们',
    version: '版本',
    description: {
      title: '关于 LDesign',
      content: 'LDesign 是一个现代化的企业级前端开发框架，基于 Vue 3 和 TypeScript 构建。它提供了完整的解决方案，包括组件库、主题系统、国际化支持等，帮助开发者快速构建高质量的Web应用。'
    },
    features: {
      modular: {
        title: '模块化架构',
        description: '采用模块化设计，支持按需加载，提高应用性能'
      },
      typescript: {
        title: 'TypeScript 支持',
        description: '完整的 TypeScript 支持，提供更好的开发体验'
      },
      responsive: {
        title: '响应式设计',
        description: '支持多种设备和屏幕尺寸，提供一致的用户体验'
      },
      i18n: {
        title: '国际化',
        description: '内置国际化支持，轻松构建多语言应用'
      },
      themes: {
        title: '主题系统',
        description: '灵活的主题系统，支持深色模式和自定义主题'
      },
      performance: {
        title: '高性能',
        description: '优化的构建配置和运行时性能，确保应用快速响应'
      }
    },
    techStack: {
      title: '技术栈'
    },
    team: {
      title: '开发团队'
    },
    contact: {
      title: '联系我们',
      email: '邮箱',
      website: '官网',
      github: 'GitHub'
    },
    license: {
      title: '开源许可',
      content: '本项目基于 MIT 许可证开源，欢迎贡献代码和提出建议。'
    }
  }
}
