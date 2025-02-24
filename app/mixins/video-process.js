import Ember from 'ember';

export default Ember.Mixin.create({
  onLoadTotalTime() {
    let video = this.get('videoElement');
    if (!video) {
      return;
    }
    let totalTime = this.formatTime(video.duration);
    document.getElementById('videoDuration').innerText = totalTime;
    document.getElementById('totalTime').innerText = totalTime;
  },

  onTimeUpdate() {
    let video = this.get('videoElement');
    if (!video) {
      return;
    }
    document.getElementById('currentTime').innerText = this.formatTime(video.currentTime);
    this.updateVideoBar();
  },

  onVideoBarInput(event) {
    let video = this.get('videoElement');
    if (!video) {
      return;
    }
    let value = event.target.value;
    video.currentTime = (video.duration * value) / 100;
  },

  updateVideoBar() {
    let video = this.get('videoElement');
    if (!video) {
      return;
    }
    let videoBar = document.getElementById('videoBar');
    videoBar.value = (video.currentTime / video.duration) * 100;
  },
});
