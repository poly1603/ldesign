import { Config } from '@stencil/core';
import { less } from '@stencil-community/less';

export const config: Config = {
  namespace: 'ldesign-webcomponent',
  globalScript: 'src/global/global.ts',
  globalStyle: 'src/global/global.less',
  taskQueue: 'async',
  plugins: [
    less()
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      // 确保样式正确封装
      includeGlobalScripts: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        { src: 'global' }
      ]
    },
  ],
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333
  },
  testing: {
    browserHeadless: "new",
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.spec.{ts,tsx}',
      '!src/**/*.e2e.{ts,tsx}',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
      '^.+\\.(ts|tsx)$': '@stencil/core/testing/jest-preprocessor.js'
    },
    testEnvironment: 'jsdom'
  },
  extras: {
    enableImportInjection: true,
    // 确保 Shadow DOM 样式隔离
    shadowDomShim: true,
    // 支持旧浏览器
    scriptDataOpts: true,
    // 确保 CSS 变量支持
    appendChildSlotFix: false,
  },
};
