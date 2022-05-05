import { Config } from '@stencil/core';
import { sass } from '@stencil/sass'
import { inlineSvg } from 'stencil-inline-svg';


export const config: Config = {
  namespace: 'wc-demo',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  plugins: [
    sass(),
    inlineSvg()
  ]
};
