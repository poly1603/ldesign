// Angular App Config
export default {
  appName: 'Angular Demo App',
  version: '17.0.0',
  api: {
    baseUrl: 'https://api.angular.io',
    timeout: 10000
  },
  features: {
    routing: true,
    forms: true,
    animations: true,
    pwa: false,
    ssr: false
  },
  theme: {
    primaryColor: '#dd0031',
    accentColor: '#c3002f',
    material: true
  },
  modules: {
    lazy: true,
    preload: ['dashboard', 'user']
  }
}
