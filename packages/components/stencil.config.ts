import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ldesign',
  outputTargets: [
    {
      type: 'dist',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
  ],
};
