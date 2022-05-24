import { Env } from '@stencil/core';

export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export const getMediaPath = (name: string) => {
  if (Env.LOCAL) {
    return `/surf-wc-assets/media/${name}`
  }
  if (Env.ASSET_BASE_URL) return Env.ASSET_BASE_URL
  return `${Env.ASSET_BASE_URL}/media/${name}`
}

export const goFullScreen = (elem: any) => {
  try {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.webkitEnterFullScreen != undefined) {
      elem.webkitEnterFullScreen() // Safari
    }
  } catch (ex) {
    throw ex
  }
}

export const exitFullScreen = () => {
  for (const exitFullScreenProp of [
    'exitFullscreen',
    'mozCancelFullScreen',
    'webkitExitFullscreen',
    'msExitFullscreen'
  ]) {
    if (document[exitFullScreenProp]) {
      document[exitFullScreenProp]()
      break
    }
  }
}

export const isFullscreen = () => {
  const doc = document as any
  const currentFullScreenState =
    doc.fullScreen ||
    doc.mozFullScreen ||
    doc.webkitIsFullScreen ||
    doc.webkitFullscreenElement
  return !!currentFullScreenState
}

export const sleep = (ms: number) => {
  return new Promise(r => {
    setTimeout(r, ms)
  })
}
