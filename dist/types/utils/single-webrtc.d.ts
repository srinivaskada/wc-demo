declare function createWebrtcVideo(streamDetails: any): {
  play: () => void;
  stop: () => void;
};
declare function getBrowserInfo(): {
  name: any;
  version: any;
  os: string;
  isDesktop: boolean;
};
declare const _default: {
  player: typeof createWebrtcVideo;
  getBrowserInfo: typeof getBrowserInfo;
};
export default _default;
