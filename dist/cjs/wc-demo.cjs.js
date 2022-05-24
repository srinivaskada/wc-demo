'use strict';

const index = require('./index-a116bc8f.js');

/*
 Stencil Client Patch Browser v2.15.1 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('wc-demo.cjs.js', document.baseURI).href));
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return index.promiseResolve(opts);
};

patchBrowser().then(options => {
  return index.bootstrapLazy([["my-component_2.cjs",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}],[1,"surf-live-video",{"authToken":[1,"auth-token"],"imei":[1],"cameraId":[2,"camera-id"],"renderVideoElement":[32],"playerType":[32],"playerState":[32],"showPlayerTypeDropdown":[32]}]]]], options);
});
