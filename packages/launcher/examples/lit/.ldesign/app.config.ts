// Lit Web Components App Config
export default {
  appName: 'Lit Components Demo',
  version: '1.0.0',
  components: {
    prefix: 'ld',
    shadowDOM: true,
    styling: 'css-in-js'
  },
  theme: {
    primaryColor: '#324fff',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  features: {
    customElements: true,
    shadowDom: true,
    cssVariables: true
  },
  performance: {
    lazyLoad: true,
    bundleSize: 'optimized'
  }
}
