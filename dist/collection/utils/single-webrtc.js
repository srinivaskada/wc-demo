function createWebrtcVideo(streamDetails) {
  let sdp;
  let peer_id;
  let msg;
  const videoElement = streamDetails.videoElement;
  var original_source = streamDetails.videoSource;
  var mediacore_domain = new URL(original_source).hostname;
  var socket_connection_timer = null;
  const webrtcLogger = {
    log: function (...args) {
      console.log(`WebRTC-[${peer_id || 'peer_id Not set'}]`, ...args);
    },
    error: function (...args) {
      console.error(`WebRTC-[${peer_id || 'peer_id Not set'}]`, ...args);
    }
  };
  /* vim: set sts=4 sw=4 et :
   *
   * Demo Javascript app for negotiating and streaming a sendrecv webrtc stream
   * with a GStreamer app. Runs only in passive mode, i.e., responds to offers
   * with answers, exchanges ICE candidates, and streams.
   *
   * Author: Nirbheek Chauhan <nirbheek@centricular.com>
   */
  // Set this to override the automatic detection in websocketServerConnect()
  var ws_server;
  var ws_port;
  // Set this to use a specific peer id instead of a random one
  var default_peer_id;
  // Override with your own STUN servers if you want
  var rtc_configuration = {
    iceServers: [
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };
  // The default constraints that will be attempted. Can be overriden by the user.
  var default_constraints = { video: true, audio: false };
  var connect_attempts = 0;
  var peer_connection;
  var ws_conn;
  // Promise for local stream after constraints are approved by the user
  var local_stream_promise;
  function getOurId() {
    return Math.floor(Math.random() * (1000000 - 10) + 10).toString();
  }
  function resetState() {
    // This will call onServerClose()
    ws_conn.close();
  }
  function handleIncomingError(error) {
    setError('ERROR: ' + error);
    resetState();
  }
  function getVideoElement() {
    return videoElement;
  }
  function setStatus(text) {
    webrtcLogger.log(text);
    return;
  }
  function setError(text) {
    webrtcLogger.error(text);
    return;
  }
  function resetVideo() {
    // return false;
    webrtcLogger.log(local_stream_promise);
    // Release the webcam and mic
    // Reset the video element and stop showing the last received frame
    var videoElement = getVideoElement();
    if (videoElement) {
      videoElement.pause();
      videoElement.src = '';
      videoElement.load();
    }
  }
  // SDP offer received from peer, set remote description and create an answer
  function onIncomingSDP(sdp) {
    peer_connection
      .setRemoteDescription(sdp)
      .then(() => {
      setStatus('Remote SDP set');
      if (sdp.type != 'offer')
        return;
      setStatus('Got SDP offer');
      local_stream_promise
        .then(() => {
        setStatus('Got local stream, creating answer');
        peer_connection
          .createAnswer()
          .then(onLocalDescription)
          .catch(setError);
      })
        .catch(setError);
    })
      .catch(setError);
  }
  // Local description was set, send it to peer
  function onLocalDescription(desc) {
    webrtcLogger.log('Got local description: ' + JSON.stringify(desc));
    peer_connection.setLocalDescription(desc).then(function () {
      setStatus('Sending SDP answer');
      sdp = { sdp: peer_connection.localDescription };
      ws_conn.send(JSON.stringify(sdp));
    });
  }
  // ICE candidate received from peer, add it to the peer connection
  function onIncomingICE(ice) {
    var candidate = new RTCIceCandidate(ice);
    peer_connection.addIceCandidate(candidate).catch(setError);
  }
  function httpGetAnswer(text) {
    webrtcLogger.log('httpGetAnswer(): ' + text);
  }
  // var mediacore_domain="10.10.6.166";
  // var mediacore_domain="devmedia1.surfsolutions.com";
  // the following comment describes the connection between received URI and sent uri to start webrtc call
  // https://mediacoredomain:8080/MRSCBUWWWOAAUCSK/1/hash   <= received URL
  // https://mediacoredomain/webrtc/webrtc_peer_id/MRSCBUWWWOAAUCSK/1/hash ==> sent url to open webrtc call
  function sendMessageToStartCall() {
    // var parsedUrl = new URL(window.location.href);
    // var theUrl = "https://" + mediacore_domain + "/webrtc/" + peer_id.toString() + parsedUrl.pathname;
    /* var url_path='/'+EDGEID+'/'+stream_id+'/'+hash;
    var theUrl = "https://" + mediacore_domain + "/webrtc/" + peer_id.toString() + url_path; */
    // MRSCBUWWWOAAUCSK/1/1212
    // original_source => https://devmedia1.surfsolutions.com/webrtc/#PEERID#/MRSCBUWWWOAAUCSK/2/hash
    var theUrl = original_source.replace('#PEERID#', peer_id.toString());
    webrtcLogger.log('sendMessageToStartCall(): ', theUrl /* JSON.stringify(options) */);
    // making the https get call
    httpGetAsync(theUrl, httpGetAnswer);
  }
  function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      webrtcLogger.log(xmlHttp.readyState);
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      }
      else if (xmlHttp.readyState == 4) {
        if (socket_connection_timer) {
          clearTimeout(socket_connection_timer);
        }
        setTimeout(() => restart_webrtc_video(videoElement), 3000);
      }
    };
    xmlHttp.open('GET', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  }
  function onServerMessage(event) {
    webrtcLogger.log('Received ' + event.data);
    switch (event.data) {
      default:
        if (event.data.startsWith('ERROR')) {
          handleIncomingError(event.data);
          return;
        }
        if (event.data.startsWith('HELLO')) {
          var arr = event.data.split(' ');
          peer_id = arr[1];
          // document.getElementById("peer-id").textContent = peer_id;
          setStatus('Registered with server, waiting for call');
          sendMessageToStartCall();
          return;
        }
        // Handle incoming JSON SDP and ICE messages
        try {
          msg = JSON.parse(event.data);
        }
        catch (e) {
          if (e instanceof SyntaxError) {
            handleIncomingError('Error parsing incoming JSON: ' + event.data);
          }
          else {
            handleIncomingError('Unknown error parsing response: ' + event.data);
          }
          return;
        }
        // Incoming JSON signals the beginning of a call
        if (!peer_connection)
          createCall(msg);
        if (msg.sdp != null) {
          onIncomingSDP(msg.sdp);
        }
        else if (msg.ice != null) {
          onIncomingICE(msg.ice);
        }
        else {
          handleIncomingError('Unknown incoming JSON: ' + msg);
        }
    }
  }
  function onServerClose(event) {
    // webrtcLogger.log(event);return;
    // alert('Server close');
    webrtcLogger.log('Server close');
    setStatus('Disconnected from server');
    resetVideo();
    if (peer_connection) {
      peer_connection.close();
      peer_connection = null;
    }
    if (event.reason != 'stop') {
      // Reset after a second
      if (socket_connection_timer) {
        clearTimeout(socket_connection_timer);
      }
      restart_webrtc_video(videoElement);
    }
  }
  function onServerError(event) {
    // alert('onServerError');
    setError('Unable to connect to server, did you add an exception for the certificate? ' +
      JSON.stringify(event));
    // Retry after 3 seconds
    if (socket_connection_timer) {
      clearTimeout(socket_connection_timer);
    }
    restart_webrtc_video(videoElement);
  }
  function getLocalStream() {
    var constraints;
    // var textarea = document.getElementById('constraints');
    // try {
    //    constraints = JSON.parse(textarea.value);
    // } catch (e) {
    //    console.error(e);
    //    setError('ERROR parsing constraints: ' + e.message + ', using default constraints');
    constraints = default_constraints;
    // }
    webrtcLogger.log(JSON.stringify(constraints));
    // Add local stream
    if (navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    else {
      errorUserMediaHandler();
    }
  }
  function websocketServerConnect() {
    connect_attempts++;
    webrtcLogger.log(connect_attempts);
    // Clear errors in the status span
    /* var span = document.getElementById("status");
    span.classList.remove('error');
    span.textContent = ''; */
    // Populate constraints
    // var textarea = document.getElementById('constraints');
    // if (textarea.value == '')
    //    textarea.value = JSON.stringify(default_constraints);
    // Fetch the peer id to use
    peer_id = default_peer_id || getOurId();
    webrtcLogger.log('peer_id is', peer_id);
    ws_port = ws_port || '8443';
    if (window.location.protocol.startsWith('file')) {
      ws_server = ws_server || '0.0.0.0';
    }
    else if (window.location.protocol.startsWith('http')) {
      ws_server = ws_server || window.location.hostname;
    }
    else {
      throw new Error("Don't know how to connect to the signalling server with uri" +
        window.location);
    }
    // ws_server="devmedia1.surfsolutions.com";
    ws_server = mediacore_domain;
    var ws_url = 'wss://' + ws_server + ':' + ws_port;
    setStatus('Connecting to server ' + ws_url);
    ws_conn = new WebSocket(ws_url);
    /* When connected, immediately register with the server */
    ws_conn.addEventListener('open', () => {
      // document.getElementById("peer-id").textContent = peer_id;
      ws_conn.send('HELLO ' + peer_id);
      setStatus('Registering with server');
      connect_attempts = 0;
    });
    ws_conn.addEventListener('error', onServerError);
    ws_conn.addEventListener('message', onServerMessage);
    ws_conn.addEventListener('close', onServerClose);
  }
  function destroy_webrtc() {
    resetVideo();
    if (socket_connection_timer) {
      clearTimeout(socket_connection_timer);
    }
    ws_conn.close(4000, 'stop');
    if (peer_connection) {
      peer_connection.oniceconnectionstatechange = () => { };
      peer_connection.close();
      peer_connection = null;
    }
  }
  function onRemoteStreamAdded(event) {
    const videoTracks = event.stream.getVideoTracks();
    const audioTracks = event.stream.getAudioTracks();
    if (videoTracks.length > 0) {
      webrtcLogger.log('Incoming stream: ' +
        videoTracks.length +
        ' video tracks and ' +
        audioTracks.length +
        ' audio tracks');
      getVideoElement().srcObject = event.stream;
    }
    else {
      handleIncomingError('Stream with unknown tracks added, resetting');
    }
  }
  function errorUserMediaHandler() {
    setError("Browser doesn't support getUserMedia!");
  }
  function createCall(msg) {
    // Reset connection attempts because we connected successfully
    connect_attempts = 0;
    webrtcLogger.log('Creating RTCPeerConnection');
    peer_connection = new RTCPeerConnection(rtc_configuration);
    peer_connection.onaddstream = onRemoteStreamAdded;
    /* Send our video/audio to the other peer */
    var browserInfo = getBrowserInfo();
    if (browserInfo.name.toLowerCase() == 'safari') {
      local_stream_promise = getLocalStream()
        .then(stream => {
        webrtcLogger.log('Adding local stream');
        peer_connection.addStream(stream);
        return stream;
      })
        .catch(setError);
    }
    else {
      local_stream_promise = new Promise(function (resolve) {
        resolve(true);
      });
    }
    if (!msg.sdp) {
      webrtcLogger.log("WARNING: First message wasn't an SDP message!?");
    }
    peer_connection.onicecandidate = event => {
      // We have a candidate, send it to the remote party with the
      // same uuid
      if (event.candidate == null) {
        webrtcLogger.log('ICE Candidate was null, done');
        return;
      }
      ws_conn.send(JSON.stringify({ ice: event.candidate }));
    };
    peer_connection.oniceconnectionstatechange = event => {
      webrtcLogger.log(event);
      webrtcLogger.log(peer_connection);
      if (peer_connection && peer_connection.iceConnectionState) {
        webrtcLogger.log(peer_connection.iceConnectionState);
        if (peer_connection.iceConnectionState == 'failed') {
          peer_connection.oniceconnectionstatechange = () => { };
          restart_webrtc_video(videoElement);
        }
      }
      // alert('peer connection state change')
    };
    setStatus('Created peer connection for call, waiting for SDP');
  }
  websocketServerConnect();
  return {
    play: websocketServerConnect,
    stop: destroy_webrtc
  };
}
function restart_webrtc_video(videoElement) {
  videoElement.dispatchEvent(new Event('restartVideo'));
  // TODO HANDLE RESTART
  /* var $body = angular.element(document.body)
  var $rootScope = $body.injector().get('$rootScope')
  $rootScope.$broadcast('restartVideo', {
    videoElementId: videoElementId
  }) */
  return true;
}
function getBrowserInfo() {
  var ua = navigator.userAgent;
  var tem;
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
    [];
  var NameBrowser = undefined;
  var VersionBrowser = undefined;
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    NameBrowser = 'IE';
    VersionBrowser = tem[1] || '';
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem == null) {
      // Chrome
      NameBrowser = M[1];
      VersionBrowser = M[2];
    }
    else {
      if (tem[0].indexOf('Edge') > -1) {
        // Edge
        NameBrowser = 'Edge';
        VersionBrowser = tem[1];
      }
      else {
        // if(tem != null)
        NameBrowser = tem[0];
        if (tem[1] != undefined)
          VersionBrowser = tem[1];
        else {
          if (NameBrowser == 'OPR') {
            // Opera
            VersionBrowser = tem.input.substring(tem.input.indexOf('OPR/') + 4);
          }
        } // else
      } // else
    } // else
  } // if(M[1]==='Chrome')
  else {
    // Firefox
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    NameBrowser = M[0];
    VersionBrowser = M[1];
  }
  // Look for OS-Name
  var firstBracket = ua.indexOf('(');
  var secondBracket = ua.indexOf(')');
  var NameOS = ua.substring(firstBracket + 1, secondBracket);
  var isDesktop = false;
  ['linux', 'windows', 'mac'].forEach(function (os) {
    if (NameOS.toLowerCase().includes(os.toLowerCase())) {
      isDesktop = true;
    }
  });
  ['android', 'iphone'].forEach(function (os) {
    if (NameOS.toLowerCase().includes(os.toLowerCase())) {
      isDesktop = false;
    }
  });
  // MyPrint("getBrowserInfo() name is '" + NameBrowser + "', version is '" + VersionBrowser + "', os is '" + NameOS + "'");
  return {
    name: NameBrowser,
    version: VersionBrowser,
    os: NameOS,
    isDesktop: isDesktop
  };
}
export default {
  player: createWebrtcVideo,
  getBrowserInfo: getBrowserInfo
};
