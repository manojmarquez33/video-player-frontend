import Ember from 'ember';

export default Ember.Mixin.create({
  setupVideoPlayer() {
    let video = document.getElementById('videoPlayer');
    if (!video) {
      return;
    }

    video.crossOrigin = 'anonymous';

    this.set('videoElement', video);

    video.addEventListener('loadedmetadata', () => {
      this.onLoadTotalTime();
    });

    video.addEventListener('timeupdate', () => {
      this.onTimeUpdate();
    });

    video.addEventListener('pause', () => {
      this.set('isPlaying', false);
    });

    video.addEventListener('play', () => {
      this.set('isPlaying', true);
    });

    document.getElementById('videoBar').addEventListener('input', (event) => {
      this.onVideoBarInput(event);
    });

    video.addEventListener('mousedown', (event) => this.onMouseDown(event));
    video.addEventListener('mousemove', (event) => this.onMouseMove(event));
    video.addEventListener('mouseup', () => this.onMouseUp());
    video.addEventListener('mouseleave', () => this.onMouseUp());

    document.getElementById('volumeBar').value = video.volume;

    console.log('Video player initialized');
  }
});
