export default {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-custom-properties': {
      preserve: false
    },
    'autoprefixer': {
      overrideBrowserslist: [
        'Chrome >= 60',
        'Firefox >= 55',
        'Safari >= 12',
        'Edge >= 79',
        'iOS >= 12',
        'Android >= 7'
      ]
    },
    'cssnano': {
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        minifySelectors: true,
        minifyParams: true
      }]
    }
  }
};