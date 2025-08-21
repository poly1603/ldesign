import type { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'ldesign',
  globalStyle: 'src/global/app.css',
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
      serviceWorker: null,
    },
  ],
  extras: {
    enableImportInjection: true,
  },
  testing: {
    browserHeadless: 'new',
  },
}
