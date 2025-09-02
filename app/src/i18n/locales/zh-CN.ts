/**
 * 中文语言包
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

export default {
  // 通用词汇
  common: {
    ok: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    loading: '加载中...',
    noData: '暂无数据',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    close: '关闭',
    refresh: '刷新',
    more: '更多',
    less: '收起',
    all: '全部',
    none: '无',
    yes: '是',
    no: '否',
  },

  // 导航菜单
  nav: {
    home: '首页',
    about: '关于我们',
    products: '产品中心',
    services: '服务支持',
    contact: '联系我们',
    blog: '博客',
    news: '新闻',
    help: '帮助中心',
    profile: '个人中心',
    settings: '设置',
    logout: '退出登录',
  },

  // 页面标题
  page: {
    home: {
      title: 'LDesign 演示应用',
      subtitle: '现代化的前端开发框架',
      description: '基于 Vue 3 + TypeScript 构建的企业级前端解决方案',
    },
    about: {
      title: '关于我们',
      subtitle: '了解 LDesign 团队',
      description: '我们致力于打造最优秀的前端开发体验',
    },
    products: {
      title: '产品中心',
      subtitle: '探索我们的产品',
      description: '为您提供完整的前端解决方案',
    },
    contact: {
      title: '联系我们',
      subtitle: '与我们取得联系',
      description: '我们很乐意为您提供帮助',
    },
  },

  // 表单相关
  form: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的手机号码',
    password: '密码长度至少为 6 位',
    confirmPassword: '两次输入的密码不一致',
    minLength: '长度不能少于 {min} 位',
    maxLength: '长度不能超过 {max} 位',
    invalidFormat: '格式不正确',
    placeholder: {
      name: '请输入姓名',
      email: '请输入邮箱地址',
      phone: '请输入手机号码',
      password: '请输入密码',
      confirmPassword: '请确认密码',
      message: '请输入留言内容',
      search: '请输入搜索关键词',
    },
  },

  // 用户相关
  user: {
    login: '登录',
    register: '注册',
    logout: '退出',
    profile: '个人资料',
    settings: '账户设置',
    changePassword: '修改密码',
    forgotPassword: '忘记密码',
    rememberMe: '记住我',
    loginSuccess: '登录成功',
    logoutSuccess: '退出成功',
    registerSuccess: '注册成功',
    updateSuccess: '更新成功',
    name: '用户姓名',
    email: '邮箱地址',
  },

  // 语言切换
  language: {
    title: '语言设置',
    current: '当前语言',
    switch: '切换语言',
    chinese: '中文',
    english: 'English',
    switchSuccess: '语言切换成功',
    switchFailed: '语言切换失败',
  },

  // 主题相关
  theme: {
    title: '主题设置',
    light: '浅色主题',
    dark: '深色主题',
    auto: '跟随系统',
    switchSuccess: '主题切换成功',
  },

  // 错误消息
  error: {
    network: '网络连接失败',
    timeout: '请求超时',
    server: '服务器错误',
    notFound: '页面未找到',
    forbidden: '访问被拒绝',
    unauthorized: '未授权访问',
    unknown: '未知错误',
    retry: '重试',
  },

  // 成功消息
  success: {
    save: '保存成功',
    delete: '删除成功',
    update: '更新成功',
    create: '创建成功',
    upload: '上传成功',
    download: '下载成功',
  },

  // 确认对话框
  confirm: {
    delete: '确定要删除这个项目吗？',
    save: '确定要保存更改吗？',
    exit: '确定要退出吗？',
    reset: '确定要重置所有设置吗？',
    clear: '确定要清空所有数据吗？',
  },

  // 时间相关
  time: {
    now: '刚刚',
    minutesAgo: '{minutes} 分钟前',
    hoursAgo: '{hours} 小时前',
    daysAgo: '{days} 天前',
    weeksAgo: '{weeks} 周前',
    monthsAgo: '{months} 个月前',
    yearsAgo: '{years} 年前',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
  },

  // 数量相关
  count: {
    items: '{count} 个项目',
    users: '{count} 个用户',
    files: '{count} 个文件',
    pages: '{count} 页',
    results: '共 {total} 条结果',
    selected: '已选择 {count} 项',
  },

  // 状态相关
  status: {
    active: '活跃',
    inactive: '非活跃',
    pending: '待处理',
    completed: '已完成',
    cancelled: '已取消',
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  },

  // 操作相关
  action: {
    view: '查看',
    edit: '编辑',
    delete: '删除',
    copy: '复制',
    move: '移动',
    rename: '重命名',
    download: '下载',
    upload: '上传',
    share: '分享',
    export: '导出',
    import: '导入',
    print: '打印',
  },

  // 演示内容
  demo: {
    welcome: '欢迎使用 LDesign 演示应用',
    description: '这是一个展示 LDesign 框架功能的演示应用，包含了路由、模板、国际化等核心功能。',
    features: {
      title: '核心功能',
      router: '智能路由系统',
      template: '模板渲染引擎',
      i18n: '国际化支持',
      theme: '主题切换',
      responsive: '响应式设计',
    },
    getStarted: '开始使用',
    learnMore: '了解更多',

    // I18n 演示页面
    title: 'I18n 功能演示',
    languageSwitcher: '语言切换器',
    dropdownMode: '下拉选择器模式',
    tabsMode: '标签页模式',
    buttonsMode: '按钮组模式',
    linksMode: '链接模式',
    basicTranslation: '基础翻译组件',
    i18nTComponent: 'I18nT 组件',
    withDifferentTags: '使用不同标签',
    important: '这是重要信息',
    subtitle: '这是副标题',
    numberFormatting: '数字格式化',
    basicNumber: '基础数字',
    currency: '货币格式',
    percentage: '百分比格式',
    dateFormatting: '日期格式化',
    basicDate: '基础日期',
    longDate: '长日期格式',
    shortDate: '短日期格式',
    relativeDate: '相对时间',
    directives: '指令演示',
    vTDirective: 'v-t 指令',
    clickMe: '点击我',
    vTTitleDirective: 'v-t-title 指令',
    tooltip: '这是一个提示信息',
    hoverMe: '悬停查看提示',
    translationProvider: '翻译提供者',
    scopedTranslation: '作用域翻译',
    status: '状态信息',
    currentLanguage: '当前语言',
    availableLanguages: '可用语言',
    cacheStatus: '缓存状态',
    enabled: '已启用'
  },


}
