// Vue 3 TypeScript App Config
export default {
  appName: 'Vue 3 TypeScript Demo',
  version: '1.0.0',
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 10000
  },
  features: {
    router: true,
    store: false,
    i18n: false
  },
  theme: {
    primaryColor: '#42b883',
    secondaryColor: '#35495e'
  },
  metadata: {
    author: 'LDesign Team',
    buildTime: new Date().toISOString()
  }
}
