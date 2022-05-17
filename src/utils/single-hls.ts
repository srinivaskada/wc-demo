import Hls from 'hls.js'

function createHLSVideo (streamDetails) {
  var videoElementId = streamDetails.videoElementId
  const videoElement = streamDetails.videoElement as HTMLVideoElement

  var video = videoElement
  var source = streamDetails.videoSource
  var apple_source = source // getApplesource(source);
  var hls
  var hls_timer
  if (Hls.isSupported()) {
    var d = new Date()
    var running_counter_time = d.getTime()
    var config = {
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10
      // liveDurationInfinity : true
      /* liveDurationInfinity : true,
			liveSyncDurationCount : 5,
			//autoStartLoad : true`
			maxBufferLength : 5,
			debug : true */
    }
    console.log('new hls created')
    hls = new Hls(config)
    hls.attachMedia(video)
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      console.log('video and hls.js are now bound together !')
      hls.loadSource(source)
    })
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log('start playing video !')
      video.play()
      // hls.loadSource('/playlist.m3u8');
    })
    hls.on(Hls.Events.ERROR, function () {
      /* if(destroyed) return;
		  	console.log("error encountered, try to recover");
		  	if (data.fatal)
		 	{
				switch(data.type) {
					case Hls.ErrorTypes.NETWORK_ERROR:
					// try to recover network error
					console.log("fatal network error encountered, try to recover");
					destroyed=true;
					hls.destroy();
					createHLSVideo(streamDetails);
					break;
					case Hls.ErrorTypes.MEDIA_ERROR:
					console.log("fatal media error encountered, try to recover");
					//hls.recoverMediaError();
					destroyed=true;
					hls.destroy();
					createHLSVideo(streamDetails);
					break;
					default:
					//cannot recover
					destroyed=true;
					hls.destroy();
					createHLSVideo(streamDetails);
					break;
				}
		  	} */
    })
    hls.on(Hls.Events.BUFFER_APPENDED, function (event) {
      var xx = new Date()
      running_counter_time = xx.getTime()
      console.log('videoElementId::', videoElementId)
      console.log(
        '**** Hls.Events.BUFFER_APPENDED  event ',
        event,
        '::',
        running_counter_time
      )
      var buf = video.buffered
      if (buf.length > 0) {
        // var max_delay = 2.0
        console.log(
          'currentTime = ',
          video.currentTime,
          ' Length=',
          buf.length,
          ' start= ',
          buf.start(0),
          ' end = ',
          buf.end(buf.length - 1)
        )
        // if (video.currentTime + max_delay < buf.end(buf.length-1))
        // {
        // 	video.currentTime = buf.end(buf.length-1) - max_delay;
        // 	console.log("Fixing currentTime=", video.currentTime);
        // }
      }
    })
    hls.loadSource(source)
    hls_timer = setInterval(hls_restart_timer, 1000)
    function hls_restart_timer () {
      var dd = new Date()
      console.log('videoElementId::', videoElementId)
      console.log('Start-running_counter_time :: ' + running_counter_time)
      console.log('Current-time               :: ' + dd.getTime())
      if (dd.getTime() - running_counter_time > 10000) {
        // Here you need to set appropriate timeout – I placed 5 second
        console.log('Start-running_counter_time :: ' + running_counter_time)
        console.log('Current-time               :: ' + dd.getTime())
        console.log(
          '***** restart the video diff-time ',
          dd.getTime() - running_counter_time
        )
        // location.reload();   // Here, I placed reloading the page, but you need your code that restarts the video
        if (hls_timer) {
          console.log('********** CLEARING TIMER************')
          clearInterval(hls_timer)
          hls_timer = null
        }
        destroy_hls()
        restart_hls_video(videoElement)
        running_counter_time = dd.getTime()
      }
    }
  }
  // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
  // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
  // This is using the built-in support of the plain video element, without using hls.js.
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    fetch(apple_source)
      .then(function () {
        video.src = apple_source
        video.addEventListener('canplay', function () {
          setTimeout(() => {
            video.play()
          })
        })
      })
      .catch(function () {})
    // ~ video.addEventListener('canplay',function() {
    // ~ video.play();
    // ~ });
  }
  function play_hls () {
    if (hls_timer) {
      clearInterval(hls_timer)
      hls_timer = null
    }
    if (hls) {
      hls.startLoad()
    } else {
      video.play()
    }
  }
  function destroy_hls () {
    if (hls_timer) {
      clearInterval(hls_timer)
      hls_timer = null
    }
    if (hls) {
      hls.stopLoad()
      hls.destroy()
    } else {
      video.pause()
      video.src = null
    }
  }
  return {
    play: play_hls,
    stop: destroy_hls
  }
}
function restart_hls_video (videoElement: HTMLVideoElement) {
  console.log('restart_hls_video')
  videoElement.dispatchEvent(new Event('restartVideo'))
}
export default {
  player: createHLSVideo
}
