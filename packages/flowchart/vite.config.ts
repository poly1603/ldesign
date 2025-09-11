import { createPackageViteConfig } from '@ldesign/builder';

export default createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true
  },
  external: ['@ldesign/shared'],
  globals: {
    '@ldesign/shared': 'LDesignShared'
  }
});
