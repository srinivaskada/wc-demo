import { p as promiseResolve, b as bootstrapLazy } from './index-4b029779.js';

/*
 Stencil Client Patch Esm v2.15.1 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return bootstrapLazy([["my-component_2",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}],[1,"surf-live-video",{"authToken":[1,"auth-token"],"imei":[1],"cameraId":[2,"camera-id"],"renderVideoElement":[32],"playerType":[32],"playerState":[32],"showPlayerTypeDropdown":[32]}]]]], options);
  });
};

export { defineCustomElements };
