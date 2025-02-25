import Ember from 'ember';

export default Ember.Mixin.create({
  setupVideoPlayer() {
    const videoElement = document.getElementById('videoPlayer');
    if (!videoElement) {
      console.error("❌ Video element not found!");
      return;
    }

    videoElement.crossOrigin = 'anonymous';
    this.set('videoElement', videoElement);

    const videoBar = document.getElementById('videoBar');
    const volumeBar = document.getElementById('volumeBar');

    videoElement.addEventListener('loadedmetadata', this.onLoadTotalTime.bind(this));
    videoElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    videoElement.addEventListener('pause', () => this.set('isPlaying', false));
    videoElement.addEventListener('play', () => this.set('isPlaying', true));
    videoElement.addEventListener('ended', this.playNextVideo.bind(this));

    if (videoBar) {
      videoBar.addEventListener('input', this.onVideoBarInput.bind(this));
      videoBar.addEventListener('change', () => this.set('isSeeking', false));
      videoBar.addEventListener('mousedown', () => this.set('isSeeking', true));
      videoBar.addEventListener('mouseup', () => this.set('isSeeking', false));
    } else {
      console.error("❌ Video bar element not found!");
    }

    if (volumeBar) {
      volumeBar.value = videoElement.volume;
      volumeBar.addEventListener('input', (event) => videoElement.volume = event.target.value);
    } else {
      console.error("❌ Volume bar element not found!");
    }

    videoElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
    videoElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    videoElement.addEventListener('mouseup', () => this.onMouseUp());
    videoElement.addEventListener('mouseleave', () => this.onMouseUp());

    if (this.get('isPlayList')) {
      this.loadPlaylist();
    } else {
      this.loadSingleVideo();
    }

    console.log('🎬 Video player initialized');
  },

  loadSingleVideo() {
    const videoElement = this.get('videoElement');
    const videoFile = this.get('model');

    if (videoFile) {
      videoElement.src = `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?video=${encodeURIComponent(videoFile)}`;
      videoElement.load();
    } else {
      console.error("❌ Video file is missing!");
    }
  }
});
