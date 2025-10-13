/**
 * @ldesign/i18n - Common Translation Keys
 * 内置的常用翻译键集合，提供开箱即用的多语言支持
 */

export interface CommonKeys {
  // 通用操作
  actions: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    submit: string;
    reset: string;
    refresh: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    retry: string;
    download: string;
    upload: string;
    search: string;
    filter: string;
    sort: string;
    expand: string;
    collapse: string;
    copy: string;
    paste: string;
    cut: string;
  };

  // 状态消息
  status: {
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    empty: string;
    noData: string;
    processing: string;
    completed: string;
    failed: string;
    pending: string;
    active: string;
    inactive: string;
    online: string;
    offline: string;
    connected: string;
    disconnected: string;
  };

  // 表单验证
  validation: {
    required: string;
    email: string;
    url: string;
    minLength: string;
    maxLength: string;
    minValue: string;
    maxValue: string;
    pattern: string;
    numeric: string;
    alphanumeric: string;
    phone: string;
    password: string;
    confirmPassword: string;
    accepted: string;
    date: string;
    time: string;
    fileSize: string;
    fileType: string;
  };

  // 错误消息
  errors: {
    general: string;
    network: string;
    timeout: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
    badRequest: string;
    conflict: string;
    tooManyRequests: string;
    maintenance: string;
    invalidInput: string;
    sessionExpired: string;
    accountLocked: string;
    invalidCredentials: string;
  };

  // 用户界面
  ui: {
    table: {
      noData: string;
      loading: string;
      total: string;
      selected: string;
      actions: string;
      itemsPerPage: string;
      page: string;
      of: string;
    };
    pagination: {
      first: string;
      last: string;
      next: string;
      previous: string;
      goTo: string;
      showingXofY: string;
    };
    dialog: {
      title: string;
      confirm: string;
      cancel: string;
      close: string;
    };
    form: {
      submit: string;
      reset: string;
      cancel: string;
      optional: string;
      required: string;
      selectOption: string;
      selectDate: string;
      selectTime: string;
      selectFile: string;
      dropFilesHere: string;
    };
    menu: {
      home: string;
      dashboard: string;
      profile: string;
      settings: string;
      help: string;
      about: string;
      logout: string;
      login: string;
      register: string;
    };
  };

  // 日期时间
  datetime: {
    today: string;
    yesterday: string;
    tomorrow: string;
    now: string;
    ago: string;
    later: string;
    justNow: string;
    secondsAgo: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
    inSeconds: string;
    inMinutes: string;
    inHours: string;
    inDays: string;
    inWeeks: string;
    inMonths: string;
    inYears: string;
  };

  // 通知消息
  notifications: {
    success: {
      saved: string;
      updated: string;
      deleted: string;
      created: string;
      copied: string;
      sent: string;
      uploaded: string;
      downloaded: string;
    };
    error: {
      saveFailed: string;
      updateFailed: string;
      deleteFailed: string;
      createFailed: string;
      uploadFailed: string;
      downloadFailed: string;
      copyFailed: string;
      sendFailed: string;
    };
    info: {
      processing: string;
      pleaseWait: string;
      redirecting: string;
      loading: string;
    };
    warning: {
      unsavedChanges: string;
      confirmDelete: string;
      confirmLogout: string;
      dataLoss: string;
    };
  };

  // 权限相关
  auth: {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    verifyEmail: string;
    twoFactorAuth: string;
    username: string;
    password: string;
    email: string;
    rememberMe: string;
    stayLoggedIn: string;
    loginSuccess: string;
    logoutSuccess: string;
    registrationSuccess: string;
    passwordResetSuccess: string;
  };
}

// 英文翻译
export const enCommonKeys: CommonKeys = {
  actions: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    submit: 'Submit',
    reset: 'Reset',
    refresh: 'Refresh',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    retry: 'Retry',
    download: 'Download',
    upload: 'Upload',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    expand: 'Expand',
    collapse: 'Collapse',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut'
  },
  status: {
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    empty: 'Empty',
    noData: 'No data available',
    processing: 'Processing...',
    completed: 'Completed',
    failed: 'Failed',
    pending: 'Pending',
    active: 'Active',
    inactive: 'Inactive',
    online: 'Online',
    offline: 'Offline',
    connected: 'Connected',
    disconnected: 'Disconnected'
  },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    url: 'Please enter a valid URL',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must not exceed {max} characters',
    minValue: 'Must be at least {min}',
    maxValue: 'Must not exceed {max}',
    pattern: 'Invalid format',
    numeric: 'Must be a number',
    alphanumeric: 'Must contain only letters and numbers',
    phone: 'Please enter a valid phone number',
    password: 'Password must be at least {min} characters',
    confirmPassword: 'Passwords do not match',
    accepted: 'You must accept the terms',
    date: 'Please enter a valid date',
    time: 'Please enter a valid time',
    fileSize: 'File size must not exceed {max}',
    fileType: 'Invalid file type'
  },
  errors: {
    general: 'An error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access forbidden.',
    serverError: 'Server error. Please try again later.',
    badRequest: 'Invalid request.',
    conflict: 'A conflict occurred. Please refresh and try again.',
    tooManyRequests: 'Too many requests. Please wait and try again.',
    maintenance: 'System is under maintenance. Please try again later.',
    invalidInput: 'Invalid input. Please check and try again.',
    sessionExpired: 'Your session has expired. Please log in again.',
    accountLocked: 'Your account has been locked.',
    invalidCredentials: 'Invalid username or password.'
  },
  ui: {
    table: {
      noData: 'No data available',
      loading: 'Loading...',
      total: 'Total',
      selected: 'Selected',
      actions: 'Actions',
      itemsPerPage: 'Items per page',
      page: 'Page',
      of: 'of'
    },
    pagination: {
      first: 'First',
      last: 'Last',
      next: 'Next',
      previous: 'Previous',
      goTo: 'Go to page',
      showingXofY: 'Showing {start} to {end} of {total} results'
    },
    dialog: {
      title: 'Dialog',
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close'
    },
    form: {
      submit: 'Submit',
      reset: 'Reset',
      cancel: 'Cancel',
      optional: 'Optional',
      required: 'Required',
      selectOption: 'Select an option',
      selectDate: 'Select date',
      selectTime: 'Select time',
      selectFile: 'Choose file',
      dropFilesHere: 'Drop files here or click to upload'
    },
    menu: {
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      logout: 'Logout',
      login: 'Login',
      register: 'Register'
    }
  },
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    now: 'Now',
    ago: 'ago',
    later: 'later',
    justNow: 'Just now',
    secondsAgo: '{count} second ago | {count} seconds ago',
    minutesAgo: '{count} minute ago | {count} minutes ago',
    hoursAgo: '{count} hour ago | {count} hours ago',
    daysAgo: '{count} day ago | {count} days ago',
    weeksAgo: '{count} week ago | {count} weeks ago',
    monthsAgo: '{count} month ago | {count} months ago',
    yearsAgo: '{count} year ago | {count} years ago',
    inSeconds: 'in {count} second | in {count} seconds',
    inMinutes: 'in {count} minute | in {count} minutes',
    inHours: 'in {count} hour | in {count} hours',
    inDays: 'in {count} day | in {count} days',
    inWeeks: 'in {count} week | in {count} weeks',
    inMonths: 'in {count} month | in {count} months',
    inYears: 'in {count} year | in {count} years'
  },
  notifications: {
    success: {
      saved: 'Successfully saved',
      updated: 'Successfully updated',
      deleted: 'Successfully deleted',
      created: 'Successfully created',
      copied: 'Successfully copied',
      sent: 'Successfully sent',
      uploaded: 'Successfully uploaded',
      downloaded: 'Successfully downloaded'
    },
    error: {
      saveFailed: 'Failed to save',
      updateFailed: 'Failed to update',
      deleteFailed: 'Failed to delete',
      createFailed: 'Failed to create',
      uploadFailed: 'Failed to upload',
      downloadFailed: 'Failed to download',
      copyFailed: 'Failed to copy',
      sendFailed: 'Failed to send'
    },
    info: {
      processing: 'Processing your request...',
      pleaseWait: 'Please wait...',
      redirecting: 'Redirecting...',
      loading: 'Loading...'
    },
    warning: {
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
      confirmDelete: 'Are you sure you want to delete this item?',
      confirmLogout: 'Are you sure you want to logout?',
      dataLoss: 'Any unsaved data will be lost.'
    }
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    changePassword: 'Change Password',
    verifyEmail: 'Verify Email',
    twoFactorAuth: 'Two-Factor Authentication',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    rememberMe: 'Remember me',
    stayLoggedIn: 'Stay logged in',
    loginSuccess: 'Successfully logged in',
    logoutSuccess: 'Successfully logged out',
    registrationSuccess: 'Registration successful',
    passwordResetSuccess: 'Password reset successful'
  }
};

// 中文翻译
export const zhCNCommonKeys: CommonKeys = {
  actions: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    remove: '移除',
    submit: '提交',
    reset: '重置',
    refresh: '刷新',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    retry: '重试',
    download: '下载',
    upload: '上传',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    expand: '展开',
    collapse: '收起',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切'
  },
  status: {
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    empty: '空',
    noData: '暂无数据',
    processing: '处理中...',
    completed: '已完成',
    failed: '失败',
    pending: '待处理',
    active: '激活',
    inactive: '未激活',
    online: '在线',
    offline: '离线',
    connected: '已连接',
    disconnected: '已断开'
  },
  validation: {
    required: '此字段为必填项',
    email: '请输入有效的邮箱地址',
    url: '请输入有效的URL',
    minLength: '至少需要 {min} 个字符',
    maxLength: '不能超过 {max} 个字符',
    minValue: '最小值为 {min}',
    maxValue: '最大值为 {max}',
    pattern: '格式无效',
    numeric: '必须是数字',
    alphanumeric: '只能包含字母和数字',
    phone: '请输入有效的手机号',
    password: '密码至少需要 {min} 个字符',
    confirmPassword: '两次输入的密码不一致',
    accepted: '您必须接受条款',
    date: '请输入有效的日期',
    time: '请输入有效的时间',
    fileSize: '文件大小不能超过 {max}',
    fileType: '文件类型无效'
  },
  errors: {
    general: '发生错误，请重试。',
    network: '网络错误，请检查您的连接。',
    timeout: '请求超时，请重试。',
    notFound: '未找到请求的资源。',
    unauthorized: '您无权执行此操作。',
    forbidden: '访问被禁止。',
    serverError: '服务器错误，请稍后重试。',
    badRequest: '无效请求。',
    conflict: '发生冲突，请刷新后重试。',
    tooManyRequests: '请求过于频繁，请稍后重试。',
    maintenance: '系统维护中，请稍后重试。',
    invalidInput: '输入无效，请检查后重试。',
    sessionExpired: '会话已过期，请重新登录。',
    accountLocked: '您的账户已被锁定。',
    invalidCredentials: '用户名或密码错误。'
  },
  ui: {
    table: {
      noData: '暂无数据',
      loading: '加载中...',
      total: '总计',
      selected: '已选择',
      actions: '操作',
      itemsPerPage: '每页显示',
      page: '页',
      of: '共'
    },
    pagination: {
      first: '首页',
      last: '末页',
      next: '下一页',
      previous: '上一页',
      goTo: '跳转至',
      showingXofY: '显示 {start} 到 {end}，共 {total} 条'
    },
    dialog: {
      title: '对话框',
      confirm: '确认',
      cancel: '取消',
      close: '关闭'
    },
    form: {
      submit: '提交',
      reset: '重置',
      cancel: '取消',
      optional: '可选',
      required: '必填',
      selectOption: '请选择',
      selectDate: '选择日期',
      selectTime: '选择时间',
      selectFile: '选择文件',
      dropFilesHere: '将文件拖放到此处或点击上传'
    },
    menu: {
      home: '首页',
      dashboard: '仪表盘',
      profile: '个人资料',
      settings: '设置',
      help: '帮助',
      about: '关于',
      logout: '退出登录',
      login: '登录',
      register: '注册'
    }
  },
  datetime: {
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    now: '现在',
    ago: '前',
    later: '后',
    justNow: '刚刚',
    secondsAgo: '{count} 秒前',
    minutesAgo: '{count} 分钟前',
    hoursAgo: '{count} 小时前',
    daysAgo: '{count} 天前',
    weeksAgo: '{count} 周前',
    monthsAgo: '{count} 个月前',
    yearsAgo: '{count} 年前',
    inSeconds: '{count} 秒后',
    inMinutes: '{count} 分钟后',
    inHours: '{count} 小时后',
    inDays: '{count} 天后',
    inWeeks: '{count} 周后',
    inMonths: '{count} 个月后',
    inYears: '{count} 年后'
  },
  notifications: {
    success: {
      saved: '保存成功',
      updated: '更新成功',
      deleted: '删除成功',
      created: '创建成功',
      copied: '复制成功',
      sent: '发送成功',
      uploaded: '上传成功',
      downloaded: '下载成功'
    },
    error: {
      saveFailed: '保存失败',
      updateFailed: '更新失败',
      deleteFailed: '删除失败',
      createFailed: '创建失败',
      uploadFailed: '上传失败',
      downloadFailed: '下载失败',
      copyFailed: '复制失败',
      sendFailed: '发送失败'
    },
    info: {
      processing: '正在处理您的请求...',
      pleaseWait: '请稍候...',
      redirecting: '正在跳转...',
      loading: '正在加载...'
    },
    warning: {
      unsavedChanges: '您有未保存的更改。确定要离开吗？',
      confirmDelete: '您确定要删除此项吗？',
      confirmLogout: '您确定要退出登录吗？',
      dataLoss: '任何未保存的数据将会丢失。'
    }
  },
  auth: {
    login: '登录',
    logout: '退出登录',
    register: '注册',
    forgotPassword: '忘记密码？',
    resetPassword: '重置密码',
    changePassword: '修改密码',
    verifyEmail: '验证邮箱',
    twoFactorAuth: '双因素认证',
    username: '用户名',
    password: '密码',
    email: '邮箱',
    rememberMe: '记住我',
    stayLoggedIn: '保持登录',
    loginSuccess: '登录成功',
    logoutSuccess: '退出成功',
    registrationSuccess: '注册成功',
    passwordResetSuccess: '密码重置成功'
  }
};

/**
 * 获取指定语言的通用翻译键
 */
export function getCommonKeys(locale: string): CommonKeys | null {
  const normalizedLocale = locale.toLowerCase().replace('_', '-');
  
  switch (normalizedLocale) {
    case 'en':
    case 'en-us':
    case 'en-gb':
      return enCommonKeys;
    case 'zh':
    case 'zh-cn':
    case 'zh-hans':
      return zhCNCommonKeys;
    default:
      return null;
  }
}

/**
 * 预设的语言包
 */
export const commonKeysPresets = {
  en: enCommonKeys,
  'en-US': enCommonKeys,
  'zh-CN': zhCNCommonKeys,
  zh: zhCNCommonKeys
};