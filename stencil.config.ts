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
      copy: [
        {
          src: 'surf-wc-assets',
          dest: 'dist/surf-wc-assets',
          warn: true,
        }
      ]
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers,
      copy: [
        {
          src: 'surf-wc-assets',
          dest: 'surf-wc-assets',
          warn: true,
        }
      ]
    },
  ],
  plugins: [
    sass(),
    inlineSvg()
  ]
};
