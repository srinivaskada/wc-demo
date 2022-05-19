export function format(first, middle, last) {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
export const getMediaPath = (name) => `/surf-wc-assets/media/${name}`;
export const goFullScreen = (elem) => {
  try {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    }
    else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    else if (elem.webkitEnterFullScreen != undefined) {
      elem.webkitEnterFullScreen(); // Safari
    }
  }
  catch (ex) {
    throw ex;
  }
};
export const exitFullScreen = () => {
  for (const exitFullScreenProp of [
    'exitFullscreen',
    'mozCancelFullScreen',
    'webkitExitFullscreen',
    'msExitFullscreen'
  ]) {
    if (document[exitFullScreenProp]) {
      document[exitFullScreenProp]();
      break;
    }
  }
};
export const isFullscreen = () => {
  const doc = document;
  const currentFullScreenState = doc.fullScreen ||
    doc.mozFullScreen ||
    doc.webkitIsFullScreen ||
    doc.webkitFullscreenElement;
  return !!currentFullScreenState;
};
export const sleep = (ms) => {
  return new Promise(r => {
    setTimeout(r, ms);
  });
};
