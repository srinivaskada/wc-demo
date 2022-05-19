'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-672ae4c8.js');

/*
 Stencil Client Patch Esm v2.15.1 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return index.promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return index.bootstrapLazy([["my-component.cjs",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]],["surf-live-video.cjs",[[1,"surf-live-video",{"authToken":[1,"auth-token"],"imei":[1],"cameraId":[2,"camera-id"],"renderVideoElement":[32],"playerType":[32],"playerState":[32],"showPlayerTypeDropdown":[32]}]]]], options);
  });
};

exports.defineCustomElements = defineCustomElements;
