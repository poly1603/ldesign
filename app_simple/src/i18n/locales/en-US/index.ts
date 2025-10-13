/**
 * English Language Pack
 */

import common from './common'
import nav from './nav'
import auth from './auth'
import dashboard from './dashboard'
import errors from './errors'

export default {
  common,
  nav,
  auth,
  dashboard,
  errors,
  
  // Pages
  page: {
    home: {
      title: 'Welcome to LDesign',
      subtitle: 'Welcome to LDesign Simple App',
      description: 'Modern application built with Vue 3 + LDesign Engine'
    },
    about: {
      title: 'About LDesign Router',
      subtitle: 'Learn more about LDesign',
      description: 'LDesign is a modern frontend framework',
      intro: {
        title: '📖 Introduction',
        content: 'LDesign Router is a modern, high-performance, feature-rich Vue 3 routing solution. It is completely independent of vue-router, providing better development experience and performance optimization.'
      },
      goals: {
        title: '🎯 Design Goals',
        items: [
          'Provide simple yet powerful API',
          'Optimize performance, reduce memory usage',
          'Complete TypeScript support',
          'Deep integration with @ldesign/engine',
          'Rich feature extensions'
        ]
      },
      features: {
        title: '✨ Core Features',
        smartPrefetch: {
          title: 'Smart Prefetch',
          description: 'Intelligently prefetch route resources based on user behavior and network conditions'
        },
        cacheManagement: {
          title: 'Cache Management',
          description: 'Multi-level cache strategy supporting memory, session, local storage and more'
        },
        performanceMonitoring: {
          title: 'Performance Monitoring',
          description: 'Real-time route performance monitoring with detailed reports and optimization suggestions'
        },
        securityProtection: {
          title: 'Security Protection',
          description: 'Built-in XSS, CSRF protection with authentication guards and permission control'
        }
      },
      techStack: {
        title: '🔧 Tech Stack'
      },
      version: {
        title: '📊 Version Info',
        current: 'Current Version',
        vueVersion: 'Vue Version',
        nodeVersion: 'Node Version',
        license: 'License'
      },
      contribute: {
        title: '🤝 Contribute',
        content: 'We welcome code contributions, issue submissions, and suggestions. You can participate in the project through:',
        links: {
          github: 'GitHub',
          docs: 'Documentation',
          discussions: 'Discussions'
        }
      },
      footer: {
        madeWith: 'Made with ❤️ by LDesign Team',
        copyright: '© 2024 LDesign. All rights reserved.'
      }
    },
    login: {
      title: '🔐 Login',
      subtitle: 'Welcome back to LDesign Router App',
      username: 'Username',
      usernamePlaceholder: 'Enter your username',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      hint: 'Hint: Use admin/admin or user/user to login',
      backToHome: '← Back to Home',
      errors: {
        invalidCredentials: 'Invalid username or password',
        serverError: 'Server error, please try again later'
      }
    }
  },
  
  // Features
  features: {
    title: 'Core Features',
    performance: {
      title: 'Extreme Performance',
      description: 'Outstanding runtime performance with Vue 3 reactive system'
    },
    security: {
      title: 'Secure & Reliable',
      description: 'Built-in security best practices to protect your app and data'
    },
    responsive: {
      title: 'Responsive Design',
      description: 'Perfect adaptation for all devices with consistent user experience'
    },
    animation: {
      title: 'Smooth Animations',
      description: 'Carefully designed animation effects to enhance user interaction'
    },
    engine: {
      title: 'LDesign Engine',
      description: 'Powerful engine system providing complete application architecture support'
    },
    developer: {
      title: 'Developer Friendly',
      description: 'Comprehensive development tools and documentation for efficient development'
    }
  },
  
  // Statistics
  stats: {
    routes: 'Routes',
    visits: 'Visits',
    cache: 'Cache Size'
  },
  
  // Footer
  footer: {
    copyright: '© 2024 LDesign. All rights reserved.',
    version: 'Version'
  },
  
  // Messages
  message: {
    success: 'Operation successful',
    error: 'Operation failed',
    loading: 'Loading...',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish'
  },
  
  // Validation messages
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    password: 'Password must be at least {min} characters',
    confirm: 'Values do not match',
    min: 'Minimum {min} characters',
    max: 'Maximum {max} characters',
    minValue: 'Minimum value is {min}',
    maxValue: 'Maximum value is {max}',
    pattern: 'Invalid format'
  }
}