import { EventEmitter } from '../../stencil-public-runtime';
import SurfApiHelper from '../../utils/SurfApiHelper';
import 'adapterjs';
declare enum PlayerType {
  Webrtc = "webrtc",
  Hls = "hls"
}
interface PlayerState {
  fullscreen?: boolean;
  playStatus?: boolean;
}
export declare class SurfLiveVideo {
  authToken: string;
  imei: string;
  cameraId: number;
  hostElement: HTMLElement;
  videoElement: HTMLVideoElement;
  player: any;
  surfApiHelper: SurfApiHelper;
  fullscreenTimer: number;
  renderVideoElement: boolean;
  playerType: PlayerType;
  playerState: PlayerState;
  showPlayerTypeDropdown: boolean;
  constructor();
  closePlayer: EventEmitter;
  closePlayerHandler(): void;
  get videoElementId(): string;
  setPlayerState(newState: PlayerState): void;
  connectedCallback(): void;
  initPlayer(): Promise<void>;
  stopPlayer(): Promise<void>;
  restartPlayer(): Promise<void>;
  getVideoSource(): Promise<string>;
  togglePlayer(): void;
  togglePlayerTypeDropdown(): void;
  changePlayerType(playerType: PlayerType): Promise<void>;
  goFullscreen(): void;
  toggleFullscreen(): void;
  toggleVideoElement(): Promise<void>;
  render(): any;
}
export {};
