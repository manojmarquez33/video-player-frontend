import Ember from 'ember';

export default Ember.Controller.extend({
  isPlaying: false,
  selectedSpeed: 1,
  videoElement: null,
  intervalRewind: null,
  intervalForward: null,

  isDragging: false,
  initialX: 0,
  initialY: 0,
  moveX: 0,
  moveY: 0,
  curZoom: 1,
  maxZoom: 3.0,
  minZoom: 1.0,

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, this.setupVideoPlayer);
  },

  setupVideoPlayer() {
    let video = document.getElementById('videoPlayer');

    if (!video) {
      console.error('Error: Video element not found in the DOM.');
      return;
    }

    video.crossOrigin = 'anonymous'; // For downloadFrame functionality

    this.set('videoElement', video);


    video.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
    video.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    video.addEventListener('pause', this.onPause.bind(this));
    video.addEventListener('play', this.onPlay.bind(this));

    video.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));


    let videoBar = document.getElementById('videoBar');
    videoBar.addEventListener('input', this.onVideoBarInput.bind(this));
    videoBar.addEventListener('change', this.onVideoBarInput.bind(this));


    video.style.cursor = 'grab';

    video.volume = 1;
  },

  onLoadedMetadata() {
    let video = this.get('videoElement');

    Ember.run.scheduleOnce('afterRender', this, () => {
      document.getElementById('totalTime').textContent = this.formatTime(video.duration);
      document.getElementById('videoBar').max = video.duration;
      document.getElementById('videoDuration').textContent = this.formatTime(video.duration);
    });
  },

  onTimeUpdate() {
    let video = this.get('videoElement');

    Ember.run.scheduleOnce('afterRender', this, () => {
      document.getElementById('currentTime').textContent = this.formatTime(video.currentTime);
      document.getElementById('videoBar').value = video.currentTime;
    });
  },

  onPause() {
    this.set('isPlaying', false);
    document.getElementById('playPause').textContent = '▶';
  },

  onPlay() {
    this.set('isPlaying', true);
    document.getElementById('playPause').textContent = '⏸';
    this.updateVideoBar();
  },


  onVideoBarInput(event) {
    let video = this.get('videoElement');
    let time = parseFloat(event.target.value);
    if (!isNaN(time)) {
      video.currentTime = time;
    }
  },

  updatePlaybackSpeed(speed) {
    let video = this.get('videoElement');

    if (!isNaN(speed) && speed > 0) {
      if (speed > 4) {
        speed = 4;
      }

      this.set('selectedSpeed', speed);
      video.playbackRate = speed;

      if (this.get('isPlaying')) {
        video.play();
      }
    }
  },


  actions: {
    togglePlay() {
      let video = this.get('videoElement');

      if (video.paused || video.ended) {
        video.play();
        this.set('isPlaying', true);
        video.playbackRate = this.get('selectedSpeed');
      } else {
        video.pause();
        this.set('isPlaying', false);
        video.playbackRate = 1;
        clearInterval(this.intervalRewind);
        clearInterval(this.intervalForward);
      }
    },

    skipBackward() {
      let video = this.get('videoElement');
      video.currentTime = Math.max(0, video.currentTime - 5);
    },

    skipForward() {
      let video = this.get('videoElement');
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    },

    fastForward() {
      let video = this.get('videoElement');
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);

      let speed = this.get('selectedSpeed') || 1;

      if (speed > 4) {
        speed = 4;
      }

      video.playbackRate = speed;
      video.play();
      this.set('isPlaying', true);
    },

    fastRewind() {
      let video = this.get('videoElement');
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);

      let speed = this.get('selectedSpeed') || 1;
      const fps = 10;

      this.intervalRewind = setInterval(() => {
        if (video.currentTime <= 0) {
          clearInterval(this.intervalRewind);
          video.currentTime = 0;
          video.pause();
          this.set('isPlaying', false);
        } else {
          video.currentTime -= (1 / fps) * speed;
        }
      }, 1000 / fps);
    },

    stopVideo() {
      let video = this.get('videoElement');
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);
      video.pause();
      video.playbackRate = 1;
      video.currentTime = 0;
      this.set('isPlaying', false);
    },

    setPlaybackSpeed(speedValue) {
      let video = this.get('videoElement');
      let speed = parseFloat(speedValue) || parseFloat(document.getElementById('speedInput').value);

      if (!isNaN(speed) && speed > 0) {
        if (speed > 4) {
          speed = 4;
        }

        this.set('selectedSpeed', speed);
        video.playbackRate = speed;

        if (this.get('isPlaying')) {
          video.play();
        }
      }
    },


    setPlaybackSpeedFromDropdown() {
      let speedValue = document.getElementById('playbackSpeed').value;
      this.updatePlaybackSpeed(parseFloat(speedValue));
    },

    setPlaybackSpeedFromInput() {
      let speedInput = document.getElementById('speedInput');
      let speed = speedInput ? parseFloat(speedInput.value) : NaN;
      this.updatePlaybackSpeed(speed);
    },


    setVolume(volumeValue) {
      let video = this.get('videoElement');
      let volume = parseFloat(volumeValue);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        video.volume = volume;
      }
    },

    skipToSec() {
      let video = this.get('videoElement');
      let skipInput = document.getElementById('skipInput').value;
      let skipSec = parseFloat(skipInput);
      if (!isNaN(skipSec) && skipSec >= 0 && skipSec <= video.duration) {
        video.currentTime = skipSec;
      } else {
        alert('Invalid time or time is beyond video duration.');
      }
    },

    zoomIn() {
      if (this.get('curZoom') < this.maxZoom) {
        this.set('curZoom', this.get('curZoom') + 0.1);
        this.updateTransform();
      }
    },

    zoomOut() {
      if (this.get('curZoom') > this.minZoom) {
        this.set('curZoom', this.get('curZoom') - 0.1);
        this.updateTransform();
      }
    },

    resetVideo() {
      let video = this.get('videoElement');

      this.setProperties({
        curZoom: 1,
        moveX: 0,
        moveY: 0,
      });
      this.updateTransform();

      this.set('selectedSpeed', 1);
      video.playbackRate = 1;

      video.style.filter = 'none';

      video.volume = 1;
      video.muted = false;

      // video.pause();
      // video.currentTime = 0;
      // this.set('isPlaying', false);

      // Clear intervals
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);


      document.getElementById('volumeBar').value = 1;
      document.getElementById('playbackSpeed').value = 1;
      document.getElementById('speedInput').value = '';
    },

    toggleFullScreen() {
      let videoContainer = document.querySelector('.video-container');
      if (!videoContainer) {
        return;
      }

      if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
          videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
          videoContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },

    convertBlackAndWhite() {
      let video = this.get('videoElement');
      let currentFilter = video.style.filter;
      video.style.filter = currentFilter === 'grayscale(100%)' ? 'none' : 'grayscale(100%)';
    },

    downloadFrame() {
      let video = this.get('videoElement');


      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;


      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);


      canvas.toBlob((blob) => {
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = url;
        link.download = 'frame.png';
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    },
  },


  updateTransform() {
    this.updateDragMove();
    let video = this.get('videoElement');
    video.style.transform = `translate(${this.get('moveX')}px, ${this.get('moveY')}px) scale(${this.get('curZoom')})`;
    video.style.transformOrigin = 'center center';
  },

  updateDragMove() {
    let video = this.get('videoElement');
    let wrapper = video.parentElement;

    let wrapperWidth = wrapper.clientWidth;
    let wrapperHeight = wrapper.clientHeight;

    let videoWidth = wrapperWidth * this.get('curZoom');
    let videoHeight = wrapperHeight * this.get('curZoom');

    let maxMoveX = (videoWidth - wrapperWidth) / 2;
    let maxMoveY = (videoHeight - wrapperHeight) / 2;

    // Restrict movement to prevent showing black background
    if (videoWidth > wrapperWidth) {
      let moveX = this.get('moveX');
      moveX = Math.max(-maxMoveX, Math.min(moveX, maxMoveX));
      this.set('moveX', moveX);
    } else {
      this.set('moveX', 0);
    }

    if (videoHeight > wrapperHeight) {
      let moveY = this.get('moveY');
      moveY = Math.max(-maxMoveY, Math.min(moveY, maxMoveY));
      this.set('moveY', moveY);
    } else {
      this.set('moveY', 0);
    }
  },


  onMouseDown(event) {
    if (this.get('curZoom') > 1) {
      this.set('isDragging', true);
      this.set('initialX', event.clientX - this.get('moveX'));
      this.set('initialY', event.clientY - this.get('moveY'));
      this.get('videoElement').style.cursor = 'grabbing';
      event.preventDefault();
    }
  },

  onMouseMove(event) {
    if (this.get('isDragging')) {
      let moveX = event.clientX - this.get('initialX');
      let moveY = event.clientY - this.get('initialY');
      this.set('moveX', moveX);
      this.set('moveY', moveY);
      this.updateTransform();
    }
  },

  onMouseUp() {
    if (this.get('isDragging')) {
      this.set('isDragging', false);
      this.get('videoElement').style.cursor = 'grab';
    }
  },


  formatTime(seconds) {
    if (isNaN(seconds)) {
      return '0:00';
    }
    let minutes = Math.floor(seconds / 60);
    let secondsLeft = Math.floor(seconds % 60);
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
  },

  updateVideoBar() {
    let video = this.get('videoElement');
    let videoBar = document.getElementById('videoBar');
    let currentTimeLabel = document.getElementById('currentTime');

    if (video && videoBar && currentTimeLabel) {
      videoBar.value = video.currentTime;
      currentTimeLabel.textContent = this.formatTime(video.currentTime);
      if (this.get('isPlaying')) {
        requestAnimationFrame(this.updateVideoBar.bind(this));
      }
    }
  },
});
