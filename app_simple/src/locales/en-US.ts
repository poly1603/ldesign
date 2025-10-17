/**
 * English Language Pack
 */

export default {
  // Custom themes
  customThemes: {
    sunset: 'Sunset Orange',
    forest: 'Forest Green',
    midnight: 'Midnight Blue',
    lavender: 'Lavender Dream',
    coral: 'Coral Reef'
  },
  // App Info
  app: {
    name: 'LDesign Simple App',
    title: 'LDesign Simple App',
    description: 'Sample application built with LDesign Engine',
    copyright: '© 2024 LDesign. All rights reserved.'
  },

  // Navigation Menu
  nav: {
    home: 'Home',
    about: 'About',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    language: 'Language'
  },

  // Home Page
  home: {
    title: 'Welcome to LDesign',
    subtitle: 'Modern, High-Performance Frontend Framework',
    description: 'This is a simple application example built with @ldesign/engine',
    features: {
      title: 'Core Features',
      list: {
        performance: 'Extreme Performance',
        performanceDesc: 'Built on Vue 3, providing excellent runtime performance',
        modular: 'Modular Architecture',
        modularDesc: 'Flexible plugin system with on-demand loading',
        typescript: 'TypeScript Support',
        typescriptDesc: 'Complete type definitions for the best development experience'
      }
    },
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    viewDocs: 'View Docs',
    currentTime: 'Current Time',
    welcomeMessage: 'Hello, {name}! Welcome to LDesign.',
    stats: {
      routes: 'Routes',
      visits: 'Visits',
      cacheSize: 'Cache Size'
    }
  },

  // About Page
  about: {
    title: 'About LDesign',
    subtitle: 'Learn more about this project',
    description: 'LDesign is a modern frontend framework designed to provide the best development experience and performance.',
    version: 'Version',
    author: 'Author',
    license: 'License',
    repository: 'Repository',
    techStack: 'Tech Stack',
    goals: {
      title: 'Our Goals',
      api: 'Provide simple yet powerful API',
      performance: 'Optimize performance, reduce memory usage',
      typescript: 'Complete TypeScript support',
      integration: 'Deep integration with @ldesign/engine',
      extensible: 'Rich feature extensions'
    },
    features: {
      title: 'Key Features',
      items: {
        vue3: 'Based on Vue 3',
        vite: 'Vite Build Tool',
        typescript: 'TypeScript Support',
        i18n: 'Internationalization',
        router: 'Smart Router System',
        engine: 'Powerful Engine Core'
      },
      vue3Desc: 'Built on Vue 3, providing excellent performance',
      viteDesc: 'Fast development server and build tool',
      i18nDesc: 'Complete internationalization support'
    },
    team: {
      title: 'Development Team',
      description: 'Maintained by a group of passionate developers'
    },
    contact: {
      title: 'Contact Us',
      email: 'Email',
      github: 'GitHub',
      website: 'Website',
      community: 'Community'
    }
  },

  // Login Page
  login: {
    title: 'Welcome Back',
    subtitle: 'Please enter your account information',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter your password',
    noAccount: "Don't have an account?",
    registerNow: 'Register Now',
    orContinueWith: 'Or continue with',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    submit: 'Login',
    submitting: 'Logging in...',
    success: 'Login successful',
    sendCode: 'Get Code',
    resendIn: 'Resend in {{seconds}}s',
    codeSent: 'Code sent',
    help: 'Help Center',
    register: 'Register now',
    or: 'or',
    loginWith: 'Login with {provider}',
    modes: {
      password: 'Password',
      sms: 'SMS',
      qrcode: 'QR Code'
    },
    placeholders: {
      username: 'Username / Email',
      password: 'Password',
      phone: 'Phone Number',
      smsCode: 'Verification Code'
    },
    providers: {
      wechat: 'WeChat',
      github: 'GitHub',
      google: 'Google'
    },
    qrcode: {
      loading: 'Loading QR Code...',
      tip: 'Scan with mobile app to login',
      refresh: 'Refresh QR Code'
    },
    errors: {
      required: 'Please fill in required fields',
      invalid: 'Invalid username or password',
      failed: 'Login failed, please try again',
      phoneRequired: 'Please enter phone number',
      invalidPhone: 'Invalid phone number format',
      invalidCode: 'Invalid verification code',
      sendCodeFailed: 'Failed to send code',
      usernameRequired: 'Please enter username',
      passwordRequired: 'Please enter password',
      minLength: 'At least {min} characters required',
      network: 'Network error, please try again later'
    }
  },

  // Dashboard Page
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Welcome back, {username}',
    currentRoute: 'Current Route Info',
    engineStatus: 'Engine Status',
    appName: 'App Name',
    environment: 'Environment',
    debugMode: 'Debug Mode',
    routeHistory: 'Route History',
    noHistory: 'No history records',
    performanceMonitor: 'Performance Monitor',
    navigationTime: 'Navigation Time',
    cacheHitRate: 'Cache Hit Rate',
    totalNavigations: 'Total Navigations',
    memoryUsage: 'Memory Usage',
    allRoutes: 'All Routes',
    auth: 'Auth',
    requiresAuth: 'Requires Auth',
    public: 'Public',
    history: 'History',
    errors: {
      loadHistory: 'Failed to load route history'
    },
    overview: {
      title: 'Overview',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      newUsers: 'New Users',
      revenue: 'Revenue'
    },
    stats: {
      title: 'Statistics',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    },
    activity: {
      title: 'Recent Activity',
      noActivity: 'No activity records'
    },
    quickActions: {
      title: 'Quick Actions',
      newPost: 'New Post',
      viewReports: 'View Reports',
      settings: 'Settings',
      help: 'Help Center'
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No new notifications'
    }
  },

  // Common
  common: {
    loading: 'Loading...',
    path: 'Path',
    name: 'Name',
    params: 'Params',
    query: 'Query',
    unnamed: 'unnamed',
    on: 'On',
    off: 'Off',
    visit: 'Visit',
    actions: 'Actions',
    clear: 'Clear',
    guest: 'Guest',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    apply: 'Apply',
    reset: 'Reset',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    more: 'More',
    less: 'Less',
    showMore: 'Show More',
    showLess: 'Show Less',
    noData: 'No Data',
    noResults: 'No Results Found',
    tryAgain: 'Try Again',
    viewDetails: 'View Details'
  },

  // Error Messages
  errors: {
    startup: {
      title: 'Application Failed to Start',
      message: 'Unknown error',
      action: 'Reload'
    },
    404: {
      title: 'Page Not Found',
      message: 'Sorry, the page you are looking for does not exist.',
      action: 'Go Home',
      back: 'Go Back'
    },
    500: {
      title: 'Server Error',
      message: 'Sorry, the server encountered a problem.',
      action: 'Refresh Page'
    },
    network: {
      title: 'Network Error',
      message: 'Please check your network connection.',
      action: 'Retry'
    },
    unauthorized: {
      title: 'Unauthorized',
      message: 'You need to login to access this page.',
      action: 'Go to Login'
    },
    forbidden: {
      title: 'Access Forbidden',
      message: 'You do not have permission to access this page.',
      action: 'Go Back'
    }
  },

  // Validation Messages
  validation: {
    required: '{field} is required',
    email: 'Please enter a valid email address',
    min: '{field} must be at least {min} characters',
    max: '{field} cannot exceed {max} characters',
    between: '{field} must be between {min} and {max}',
    numeric: '{field} must be a number',
    alphanumeric: '{field} can only contain letters and numbers',
    pattern: '{field} format is incorrect',
    confirmed: '{field} confirmation does not match',
    unique: '{field} already exists',
    date: 'Please enter a valid date',
    dateAfter: 'Date must be after {date}',
    dateBefore: 'Date must be before {date}',
    url: 'Please enter a valid URL',
    phone: 'Please enter a valid phone number'
  },
  
  // Date and Time
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    nextYear: 'Next Year',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    selectDateTime: 'Select Date Time'
  },

  // Theme Settings
  theme: {
    title: 'Theme',
    selectThemeColor: 'Select Theme Color',
    customColor: 'Custom Color',
    custom: 'Current',
    mode: 'Theme Mode',
    light: 'Light',
    dark: 'Dark',
    apply: 'Apply',
    add: 'Add',
    remove: 'Remove',
    searchPlaceholder: 'Search colors...',
    presetThemes: 'Preset Themes',
    addCustomTheme: 'Add Custom Theme',
    themeName: 'Theme name',
    confirmRemove: 'Remove this theme?',
    presets: {
      blue: 'Daybreak Blue',
      purple: 'Purple',
      cyan: 'Cyan',
      green: 'Polar Green',
      magenta: 'Magenta',
      red: 'Dust Red',
      orange: 'Sunset Orange',
      yellow: 'Sunrise Yellow',
      volcano: 'Volcano',
      geekblue: 'Geek Blue',
      lime: 'Lime',
      gold: 'Gold',
      gray: 'Neutral Gray',
      'dark-blue': 'Dark Blue',
      'dark-green': 'Dark Green',
      // Custom themes
      sunset: 'Sunset Orange',
      forest: 'Forest Green',
      midnight: 'Midnight Blue',
      lavender: 'Lavender Dream',
      coral: 'Coral Reef'
    }
  }
};
