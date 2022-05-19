import { Component, Host, h, Prop, State, Event } from '@stencil/core';
import * as webrtcPlayer from '../../utils/single-webrtc';
import * as hlsPlayer from '../../utils/single-hls';
import SurfApiHelper from '../../utils/SurfApiHelper';
import Fullscreen from '@material-icons/svg/svg/fullscreen/round.svg';
import FullscreenExit from '@material-icons/svg/svg/fullscreen_exit/round.svg';
import PlayArrow from '@material-icons/svg/svg/play_arrow/round.svg';
import Pause from '@material-icons/svg/svg/pause/round.svg';
import Close from '@material-icons/svg/svg/close/round.svg';
import 'adapterjs';
import { exitFullScreen, goFullScreen, isFullscreen, sleep } from '../../utils/utils';
var PlayerType;
(function (PlayerType) {
  PlayerType["Webrtc"] = "webrtc";
  PlayerType["Hls"] = "hls";
})(PlayerType || (PlayerType = {}));
const DefaultPlayerType = PlayerType.Webrtc;
const dashcamHLSfilename = 'playlist.m3u8';
export class SurfLiveVideo {
  constructor() {
    this.renderVideoElement = true;
    this.playerType = PlayerType.Webrtc;
    this.playerState = {
      fullscreen: false,
      playStatus: false
    };
    this.showPlayerTypeDropdown = false;
    this.surfApiHelper = new SurfApiHelper(this.authToken);
  }
  closePlayerHandler() {
    alert('closePlayerHandler');
    this.closePlayer.emit();
  }
  get videoElementId() {
    return `${this.imei}-${this.cameraId}`;
  }
  setPlayerState(newState) {
    this.playerState = Object.assign(Object.assign({}, this.playerState), newState);
  }
  connectedCallback() {
    // this.initPlayer()
  }
  async initPlayer() {
    console.log('this.videoElement', this.videoElement);
    switch (this.playerType) {
      case PlayerType.Webrtc:
        this.player = webrtcPlayer.default.player({
          videoElementId: this.videoElementId,
          videoSource: await this.getVideoSource(),
          videoElement: this.videoElement,
        });
        break;
      case PlayerType.Hls:
        this.player = hlsPlayer.default.player({
          videoElementId: this.videoElementId,
          videoSource: await this.getVideoSource(),
          videoElement: this.videoElement,
        });
        break;
    }
    this.videoElement.addEventListener('restartVideo', this.restartPlayer.bind(this), {
      once: true
    });
    this.setPlayerState({
      playStatus: true
    });
  }
  async stopPlayer() {
    if (this.player) {
      this.player.stop();
    }
    this.setPlayerState({
      playStatus: false
    });
    await this.toggleVideoElement();
  }
  async restartPlayer() {
    console.log('restartPlayer');
    await this.stopPlayer();
    this.initPlayer();
  }
  async getVideoSource() {
    let videoSource;
    const { address, mediaToken } = await this.surfApiHelper.prepareDeviceMediaStreaming(this.imei);
    switch (this.playerType) {
      case PlayerType.Webrtc:
        videoSource = `https://${address}/${DefaultPlayerType}/#PEERID#/${this.imei}/${this.cameraId}/${mediaToken}`;
        break;
      case PlayerType.Hls:
        videoSource = `https://${address}/${this.imei}/${this.cameraId}/${mediaToken}/${dashcamHLSfilename}`;
    }
    return videoSource;
  }
  togglePlayer() {
    if (this.playerState.playStatus) {
      this.stopPlayer();
    }
    else {
      this.initPlayer();
    }
  }
  togglePlayerTypeDropdown() {
    this.showPlayerTypeDropdown = !this.showPlayerTypeDropdown;
  }
  async changePlayerType(playerType) {
    this.showPlayerTypeDropdown = false;
    this.playerType = playerType;
    await this.stopPlayer();
    this.initPlayer();
  }
  goFullscreen() {
    try {
      goFullScreen(this.hostElement);
      this.fullscreenTimer = window.setInterval(() => {
        this.setPlayerState({
          fullscreen: isFullscreen()
        });
        if (!this.playerState.fullscreen) {
          window.clearInterval(this.fullscreenTimer);
        }
      }, 1000);
      this.setPlayerState({
        fullscreen: true
      });
    }
    catch (ex) {
      console.error(ex);
    }
  }
  toggleFullscreen() {
    const fullscreenState = isFullscreen();
    if (fullscreenState) {
      exitFullScreen();
    }
    else {
      this.goFullscreen();
    }
    this.setPlayerState({
      fullscreen: !fullscreenState
    });
  }
  async toggleVideoElement() {
    this.renderVideoElement = false;
    await sleep(1000);
    this.renderVideoElement = true;
  }
  render() {
    return (h(Host, null,
      h("div", { class: "columns m-0", ref: el => this.hostElement = el },
        h("div", { class: "live-video-container columns p-0 mx-0 my-auto is-flex-wrap-wrap column is-full is-relative" },
          this.renderVideoElement ? h("video", { ref: el => {
              console.log('el', el);
              this.videoElement = el;
            }, style: { width: '100%' }, muted: true, id: `remoteVideo-${this.videoElementId}`, playsinline: "true", autoplay: true }) : null,
          h("div", { class: "live-video-controls-container is-flex is-flex-direction-row" },
            h("span", { class: "is-flex-grow-1" }, `${this.imei} - ${this.cameraId}`),
            h("span", { class: 'icon is-clickable', onClick: () => this.togglePlayer(), innerHTML: this.playerState.playStatus ? Pause : PlayArrow }),
            h("div", { class: `dropdown is-up ${this.showPlayerTypeDropdown ? 'is-active' : ''}` },
              h("div", { class: "dropdown-trigger" },
                h("button", { class: "button", "aria-haspopup": "true", "aria-controls": "dropdown-menu", onClick: () => this.togglePlayerTypeDropdown() },
                  h("span", null, this.playerType),
                  h("span", { class: "icon is-small" },
                    h("i", { class: "fas fa-angle-down", "aria-hidden": "true" })))),
              h("div", { class: "dropdown-menu", id: "dropdown-menu", role: "menu" },
                h("div", { class: "dropdown-content" }, [PlayerType.Webrtc, PlayerType.Hls].map(playerType => (h("span", { class: `dropdown-item ${this.playerType === playerType ? 'is-active' : ''}`, onClick: () => this.changePlayerType(playerType) }, playerType)))))),
            h("span", { class: 'icon is-clickable', onClick: () => this.toggleFullscreen(), innerHTML: this.playerState.fullscreen ? FullscreenExit : Fullscreen }),
            h("span", { class: 'icon is-clickable', onClick: () => this.closePlayerHandler(), innerHTML: Close }))))));
  }
  static get is() { return "surf-live-video"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["surf-live-video.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["surf-live-video.css"]
  }; }
  static get properties() { return {
    "authToken": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "auth-token",
      "reflect": false
    },
    "imei": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "imei",
      "reflect": false
    },
    "cameraId": {
      "type": "number",
      "mutable": false,
      "complexType": {
        "original": "number",
        "resolved": "number",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "camera-id",
      "reflect": false
    }
  }; }
  static get states() { return {
    "renderVideoElement": {},
    "playerType": {},
    "playerState": {},
    "showPlayerTypeDropdown": {}
  }; }
  static get events() { return [{
      "method": "closePlayer",
      "name": "close",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      }
    }]; }
}
