/**
 * Error language items
 */

export default {
  // HTTP errors
  http: {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  },
  
  // Page errors
  page: {
    notFound: {
      title: 'Page Not Found',
      subtitle: 'Sorry, the page you are looking for does not exist',
      button: 'Go Home'
    },
    forbidden: {
      title: 'Access Denied',
      subtitle: "You don't have permission to access this page",
      button: 'Go Back'
    },
    serverError: {
      title: 'Server Error',
      subtitle: 'Sorry, something went wrong on our end',
      button: 'Refresh Page'
    },
    maintenance: {
      title: 'Under Maintenance',
      subtitle: 'The system is currently under maintenance. Please try again later',
      button: 'Learn More'
    }
  },
  
  // Network errors
  network: {
    offline: 'Network connection lost',
    online: 'Network connection restored',
    slow: 'Slow network connection detected',
    timeout: 'Request timed out. Please check your connection',
    error: 'Network error. Please try again later'
  },
  
  // Generic error messages
  generic: {
    title: 'Something Went Wrong',
    subtitle: 'Sorry, an error occurred',
    retry: 'Retry',
    report: 'Report Issue',
    back: 'Go Back',
    home: 'Go Home'
  }
}