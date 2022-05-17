declare function createHLSVideo(streamDetails: any): {
  play: () => void;
  stop: () => void;
};
declare const _default: {
  player: typeof createHLSVideo;
};
export default _default;
