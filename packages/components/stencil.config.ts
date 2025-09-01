import { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { less } from '@stencil/less';

export const config: Config = {
  namespace: 'ldesign-components',
  taskQueue: 'async',
  globalScript: 'src/global/global.ts',
  globalStyle: 'src/global/global.less',
  outputTargets: [
    // ES Module output
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'global/theme',
          dest: 'theme'
        }
      ]
    },
    // Custom Elements Bundle
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    // Vue.js Integration
    vueOutputTarget({
      componentCorePackage: '@ldesign/components',
      proxiesFile: './vue/src/components.ts',
      includeDefineCustomElements: true,
    }),
    // Documentation generation
    {
      type: 'docs-readme',
      footer: 'Built with ❤️ by LDesign Team',
    },
    // JSON documentation
    {
      type: 'docs-json',
      file: 'dist/docs.json',
    },
    // Dev server
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        {
          src: 'global/theme',
          dest: 'theme'
        }
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.e2e.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text'],
  },
  plugins: [
    less({
      injectGlobalPaths: [
        'src/global/variables.less',
        'src/global/mixins.less'
      ]
    })
  ],
  extras: {
    enableImportInjection: true,
  },
  devServer: {
    reloadStrategy: 'pageReload',
    openBrowser: false,
  },
  buildEs5: 'prod',
  bundles: [
    { components: ['ld-button'] },
    { components: ['ld-card'] },
    { components: ['ld-input'] },
    { components: ['ld-icon'] },
  ],
};