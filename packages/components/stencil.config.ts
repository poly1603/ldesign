import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'ldesign',
  globalStyle: 'src/global/app.less',
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/global/variables.less',
        'src/global/mixins.less'
      ]
    })
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
      serviceWorker: null,
    },
  ],
  extras: {
    enableImportInjection: true,
  },
  testing: {
    browserHeadless: "new",
  },
};
