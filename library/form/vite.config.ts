import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true
  },
  globals: {
    'lodash-es': 'lodash'
  }
})
