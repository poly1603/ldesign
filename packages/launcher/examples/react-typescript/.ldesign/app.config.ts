// React TypeScript Example App Config
// 通过 import.meta.env.appConfig 访问
export default {
  appName: 'React TypeScript Example',
  version: '1.0.0',
  api: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 5000
  },
  features: {
    darkMode: true,
    analytics: false,
    debugMode: true
  },
  ui: {
    theme: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  },
  buildInfo: {
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }
}
