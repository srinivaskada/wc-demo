import { p as promiseResolve, b as bootstrapLazy } from './index-f9006a2a.js';

/*
 Stencil Client Patch Browser v2.15.1 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = import.meta.url;
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return promiseResolve(opts);
};

patchBrowser().then(options => {
  return bootstrapLazy([["my-component",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]],["surf-live-video",[[1,"surf-live-video",{"authToken":[1,"auth-token"],"imei":[1],"cameraId":[2,"camera-id"],"renderVideoElement":[32],"playerType":[32],"playerState":[32],"showPlayerTypeDropdown":[32]}]]]], options);
});
