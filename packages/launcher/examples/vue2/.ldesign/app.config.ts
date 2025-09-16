// Vue 2 App Config
export default {
  appName: 'Vue 2 Classic Demo',
  version: '1.0.0',
  api: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 5000
  },
  features: {
    vuex: true,
    vueRouter: true,
    compositionApi: true
  },
  ui: {
    primaryColor: '#4fc08d',
    fontSize: '14px'
  },
  buildInfo: {
    framework: 'Vue 2',
    buildTime: new Date().toISOString()
  }
}
