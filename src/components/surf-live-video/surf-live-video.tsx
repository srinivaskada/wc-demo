import { Component, Host, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core';
import * as webrtcPlayer from '../../utils/single-webrtc'
import * as hlsPlayer from '../../utils/single-hls'
import SurfApiHelper from '../../utils/SurfApiHelper';
import Fullscreen from '@material-icons/svg/svg/fullscreen/round.svg'
import FullscreenExit from '@material-icons/svg/svg/fullscreen_exit/round.svg'
import PlayArrow from '@material-icons/svg/svg/play_arrow/round.svg'
import Pause from '@material-icons/svg/svg/pause/round.svg'
import Close from '@material-icons/svg/svg/close/round.svg'
import 'adapterjs'
import { exitFullScreen, goFullScreen, isFullscreen, sleep } from '../../utils/utils';


enum PlayerType {
  Webrtc = 'webrtc',
  Hls = 'hls'
}
const DefaultPlayerType = PlayerType.Webrtc

const dashcamHLSfilename = 'playlist.m3u8'
interface PlayerState {
  fullscreen?: boolean
  playStatus?: boolean
}

@Component({
  tag: 'surf-live-video',
  styleUrl: 'surf-live-video.scss',
  shadow: true,
})
export class SurfLiveVideo {
  @Prop() authToken: string;
  @Prop() imei: string;
  @Prop() cameraId: number;

  hostElement: HTMLElement
  videoElement!: HTMLVideoElement
  player!: any
  
  surfApiHelper: SurfApiHelper
  fullscreenTimer: number

  @State() renderVideoElement: boolean = true
  @State() playerType = PlayerType.Webrtc
  @State() playerState: PlayerState = {
    fullscreen: false,
    playStatus: false
  }
  @State() showPlayerTypeDropdown: boolean = false

  constructor() {
    this.surfApiHelper = new SurfApiHelper(this.authToken)
  }

  @Watch('authToken')
  updateToken(newValue: string, _oldValue: string) {
    const isBlank = typeof newValue !== 'string' || newValue === '';
    if (isBlank) {
        throw new Error('thingToDo is a required property and cannot be empty') 
    }
    this.surfApiHelper = new SurfApiHelper(this.authToken)
  }

  @Event({
    eventName: 'close',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) closePlayer: EventEmitter;
  
  closePlayerHandler() {
    alert('closePlayerHandler')
    this.closePlayer.emit();
  }

  get videoElementId () {
    return `${this.imei}-${this.cameraId}`
  }

  setPlayerState(newState: PlayerState) {
    this.playerState = {
      ...this.playerState,
      ...newState
    }
  }

  connectedCallback() {
    // this.initPlayer()
  }

  async initPlayer() {
    console.log('this.videoElement', this.videoElement)
    switch(this.playerType) {
      case PlayerType.Webrtc:
        this.player = webrtcPlayer.default.player({
          videoElementId: this.videoElementId,
          videoSource: await this.getVideoSource(),
          videoElement: this.videoElement,
        })
        break
      case PlayerType.Hls:
        this.player = hlsPlayer.default.player({
          videoElementId: this.videoElementId,
          videoSource: await this.getVideoSource(),
          videoElement: this.videoElement,
        })
        break
    }
    this.videoElement.addEventListener('restartVideo', this.restartPlayer.bind(this), {
      once: true
    })
    
    this.setPlayerState({
      playStatus: true
    })
  }

  async stopPlayer() {
    if (this.player) {
      this.player.stop()
    }
    this.setPlayerState({
      playStatus: false
    })
    await this.toggleVideoElement()
  }

  async restartPlayer() {
    console.log('restartPlayer')
    await this.stopPlayer()
    this.initPlayer()
  }

  async getVideoSource() {
    let videoSource: string
    const { address, mediaToken } = await this.surfApiHelper.prepareDeviceMediaStreaming(this.imei)
    switch(this.playerType) {
      case PlayerType.Webrtc:
        videoSource = `https://${address}/${DefaultPlayerType}/#PEERID#/${this.imei}/${this.cameraId}/${mediaToken}`
        break
      case PlayerType.Hls:
        videoSource = `https://${address}/${this.imei}/${this.cameraId}/${mediaToken}/${dashcamHLSfilename}`
    }
    return videoSource
  }

  togglePlayer () {
    if (this.playerState.playStatus) {
      this.stopPlayer()
    } else {
      this.initPlayer()
    }
  }

  togglePlayerTypeDropdown() {
    this.showPlayerTypeDropdown = !this.showPlayerTypeDropdown
  }

  async changePlayerType(playerType: PlayerType) {
    this.showPlayerTypeDropdown = false
    this.playerType = playerType
    await this.stopPlayer()
    this.initPlayer()
  }

  goFullscreen() {
    try {
      goFullScreen(this.hostElement)
      this.fullscreenTimer = window.setInterval(() => {
        this.setPlayerState({
          fullscreen: isFullscreen()
        })
        if (!this.playerState.fullscreen) {
          window.clearInterval(this.fullscreenTimer)
        }
      }, 1000)
      this.setPlayerState({
        fullscreen: true
      })
    } catch (ex) {
      console.error(ex)
    }
  }

  toggleFullscreen() {
    const fullscreenState = isFullscreen()
    if (fullscreenState) {
      exitFullScreen()
    } else {
      this.goFullscreen()
    }
    this.setPlayerState({
      fullscreen: !fullscreenState
    })
  }

  async toggleVideoElement() {
    this.renderVideoElement = false
    await sleep(1000)
    this.renderVideoElement = true
  }

  render() {
    return (
      <Host>
        <div class="columns m-0" ref={el => this.hostElement = el}>
          <div class="live-video-container columns p-0 mx-0 my-auto is-flex-wrap-wrap column is-full is-relative">
            {this.renderVideoElement ? <video
              ref={el => {
                console.log('el', el)
                this.videoElement=el
              }}
              style={{width: '100%'}}
              muted
              id={`remoteVideo-${this.videoElementId}`}
              playsinline="true"
              autoplay
            ></video> : null}
            {/*<img class="column is-full p-0" src={getMediaPath('cat.jpeg')} />*/}
            <div class="live-video-controls-container is-flex is-flex-direction-row">
              <span class="is-flex-grow-1">{`${this.imei} - ${this.cameraId}`}</span>
              <slot name='button'></slot>
              <span class='icon is-clickable' onClick={() => this.togglePlayer()} innerHTML={this.playerState.playStatus ? Pause : PlayArrow} />
              <div class={`dropdown is-up ${this.showPlayerTypeDropdown ? 'is-active' : ''}`}>
                <div class="dropdown-trigger">
                  <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={() => this.togglePlayerTypeDropdown()}>
                    <span>{this.playerType}</span>
                    <span class="icon is-small">
                      <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content">
                    {
                      [PlayerType.Webrtc, PlayerType.Hls].map(playerType => (
                        <span class={`dropdown-item ${this.playerType === playerType ? 'is-active' : ''}`} onClick={() => this.changePlayerType(playerType)}>
                          {playerType}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>
              <span class='icon is-clickable' onClick={() => this.toggleFullscreen()} innerHTML={this.playerState.fullscreen ? FullscreenExit : Fullscreen} />
              <span class='icon is-clickable' onClick={() => this.closePlayerHandler()} innerHTML={Close} />
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
