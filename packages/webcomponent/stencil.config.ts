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
    testMatch: [
      '**/__tests__/**/*.(js|jsx|ts|tsx)',
      '**/*.(test|spec).(js|jsx|ts|tsx)'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
      '^.+\\.(ts|tsx)$': '@stencil/core/testing/jest-preprocessor.js'
    },
    testEnvironment: 'jsdom'
  },
  extras: {
    enableImportInjection: true,
  },
};
