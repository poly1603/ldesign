import { Config } from '@stencil/core';
import { less } from '@stencil/less';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'ldesign-component',
  globalStyle: 'src/global/global.less',
  globalScript: 'src/global/global.ts',
  taskQueue: 'async',
  plugins: [
    less({
      injectGlobalPaths: [
        'src/global/variables.less',
        'src/global/mixins.less'
      ]
    })
  ],
  outputTargets: [
    // 生成 Vue 3 绑定
    vueOutputTarget({
      componentCorePackage: '@ldesign/component',
      proxiesFile: '../component-vue/src/proxies.ts',
      includeDefineCustomElements: true,
    }),
    // 分发目标 - ES 模块
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    // 分发目标 - 自定义元素
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    // 文档生成
    {
      type: 'docs-readme',
      footer: '*Built with [StencilJS](https://stenciljs.com/)*',
    },
    // JSON 文档
    {
      type: 'docs-json',
      file: 'dist/docs.json',
    },
    // 开发服务器
    {
      type: 'www',
      serviceWorker: null, // 禁用 service worker
      copy: [
        { src: 'global/assets', dest: 'assets' }
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.spec.{ts,tsx}',
      '!src/**/*.e2e.{ts,tsx}',
      '!src/global/**/*',
      '!src/utils/**/*'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333
  },
  extras: {
    enableImportInjection: true,
  }
};
