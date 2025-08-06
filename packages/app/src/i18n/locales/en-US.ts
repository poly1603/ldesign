export const enUS = {
  // Common
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No Data',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    retry: 'Retry',
    refresh: 'Refresh',
    configure: 'Configure',
    view: 'View'
  },

  // Navigation
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    settings: 'Settings',
    about: 'About',
    logout: 'Logout'
  },

  // Authentication
  auth: {
    login: {
      title: 'User Login',
      subtitle: 'Welcome back, please login to your account',
      username: 'Username',
      password: 'Password',
      remember: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginButton: 'Login',
      noAccount: "Don't have an account?",
      registerLink: 'Register now',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      invalidCredentials: 'Invalid username or password',
      accountLocked: 'Account is locked, please try again later'
    },

    register: {
      title: 'User Registration',
      subtitle: 'Create your new account',
      username: 'Username',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      registerButton: 'Register',
      hasAccount: 'Already have an account?',
      loginLink: 'Login now',
      registerSuccess: 'Registration successful',
      registerFailed: 'Registration failed',
      passwordMismatch: 'Passwords do not match',
      usernameExists: 'Username already exists',
      emailExists: 'Email already registered'
    },

    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address and we will send you a reset link',
      email: 'Email Address',
      sendButton: 'Send Reset Link',
      backToLogin: 'Back to Login',
      emailSent: 'Reset link has been sent to your email',
      emailNotFound: 'Email address not found'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back, {username}',
    overview: 'Overview',
    statistics: 'Statistics',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions'
  },

  // Profile
  profile: {
    title: 'Profile',
    subtitle: 'Manage your personal information',
    basicInfo: 'Basic Information',
    avatar: 'Avatar',
    changeAvatar: 'Change Avatar',
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    bio: 'Bio',
    role: 'Role',
    joinDate: 'Join Date',
    updateSuccess: 'Profile updated successfully',
    updateFailed: 'Profile update failed'
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your application settings',
    general: 'General',
    securityTab: 'Security',
    appearanceTab: 'Appearance',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    privacy: 'Privacy',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',

    // Appearance settings
    appearance: {
      title: 'Appearance Settings',
      theme: {
        label: 'Theme Mode',
        light: 'Light Theme',
        dark: 'Dark Theme',
        auto: 'Follow System'
      },
      primaryColor: 'Primary Color',
      borderRadius: 'Border Radius',
      watermark: {
        title: 'Watermark Settings',
        enabled: 'Enable Watermark',
        text: 'Watermark Text',
        showUserInfo: 'Show User Info',
        showTimestamp: 'Show Timestamp',
        opacity: 'Opacity',
        fontSize: 'Font Size',
        angle: 'Rotation Angle'
      }
    },

    // Security settings
    security: {
      title: 'Security Settings',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      twoFactor: 'Two-Factor Authentication',
      loginHistory: 'Login History',
      activeSessions: 'Active Sessions'
    }
  },

  // Templates
  templates: {
    title: 'Template Showcase',
    subtitle: 'Browse and select application templates',
    loginTemplates: 'Login Templates',
    classic: 'Classic Template',
    modern: 'Modern Template',
    minimal: 'Minimal Template',
    creative: 'Creative Template',
    switchTemplate: 'Switch Template',
    preview: 'Preview',
    apply: 'Apply',
    select: 'Select',
    noTemplates: 'No templates available',
    categories: {
      all: 'All',
      login: 'Login Templates',
      dashboard: 'Dashboard Templates',
      admin: 'Admin Templates'
    },
    status: {
      active: 'Active',
      beta: 'Beta',
      deprecated: 'Deprecated'
    }
  },

  // Error pages
  error: {
    404: {
      title: 'Page Not Found',
      message: 'Sorry, the page you are looking for does not exist',
      backHome: 'Back to Home'
    },
    500: {
      title: 'Server Error',
      message: 'The server encountered an error, please try again later',
      retry: 'Retry'
    },
    network: {
      title: 'Network Error',
      message: 'Network connection failed, please check your network settings',
      offline: 'You are currently offline'
    },
    suggestions: {
      title: 'You can try:',
      checkUrl: 'Check if the URL is correct',
      useNavigation: 'Use the navigation menu',
      contactSupport: 'Contact technical support',
      waitAndRetry: 'Wait a few minutes and try again',
      checkStatus: 'Check the service status page',
      contactAdmin: 'Contact system administrator',
      reportIssue: 'Report this issue'
    },
    quickLinks: {
      title: 'Quick Links'
    },
    details: {
      title: 'Error Details',
      time: 'Time',
      id: 'Error ID',
      status: 'Status Code'
    },
    support: {
      title: 'Need Help?',
      description: 'If the problem persists, please contact our technical support team.',
      reportIssue: 'Report Issue',
      contactSupport: 'Contact Support',
      issueReported: 'Issue reported, we will handle it as soon as possible.'
    },
    showDetails: 'Show Details',
    hideDetails: 'Hide Details'
  },

  // Form validation
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'At least {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    pattern: 'Invalid format',
    numeric: 'Please enter a number',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL'
  },

  // Notification messages
  notification: {
    loginSuccess: 'Login successful, welcome back!',
    logoutSuccess: 'Logged out successfully',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    updateSuccess: 'Updated successfully',
    operationFailed: 'Operation failed, please try again',
    networkError: 'Network connection failed',
    permissionDenied: 'Permission denied',
    sessionExpired: 'Session expired, please login again'
  },

  // Time related
  time: {
    now: 'Just now',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    weeksAgo: '{count} weeks ago',
    monthsAgo: '{count} months ago',
    yearsAgo: '{count} years ago'
  },

  // About
  about: {
    title: 'About Us',
    version: 'Version',
    description: {
      title: 'About LDesign',
      content: 'LDesign is a modern enterprise-level frontend development framework built on Vue 3 and TypeScript. It provides a complete solution including component library, theme system, internationalization support, etc., helping developers quickly build high-quality web applications.'
    },
    features: {
      modular: {
        title: 'Modular Architecture',
        description: 'Adopts modular design, supports on-demand loading, improves application performance'
      },
      typescript: {
        title: 'TypeScript Support',
        description: 'Complete TypeScript support, providing better development experience'
      },
      responsive: {
        title: 'Responsive Design',
        description: 'Supports multiple devices and screen sizes, providing consistent user experience'
      },
      i18n: {
        title: 'Internationalization',
        description: 'Built-in internationalization support, easily build multilingual applications'
      },
      themes: {
        title: 'Theme System',
        description: 'Flexible theme system, supports dark mode and custom themes'
      },
      performance: {
        title: 'High Performance',
        description: 'Optimized build configuration and runtime performance, ensuring fast application response'
      }
    },
    techStack: {
      title: 'Tech Stack'
    },
    team: {
      title: 'Development Team'
    },
    contact: {
      title: 'Contact Us',
      email: 'Email',
      website: 'Website',
      github: 'GitHub'
    },
    license: {
      title: 'Open Source License',
      content: 'This project is open source under the MIT license. Contributions and suggestions are welcome.'
    }
  }
}
