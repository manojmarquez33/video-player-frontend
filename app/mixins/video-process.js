import Ember from 'ember';

export default Ember.Mixin.create({

  onLoadTotalTime() {
    const videoElement = this.get('videoElement');
    if (!videoElement) {
      console.error("Video element not found!");
      return;
    }

    let totalDuration;

    if (this.get('isPlayList')) {
      totalDuration = this.get('totalDuration');
    } else {
      totalDuration = videoElement.duration;
    }

    const totalTimeElement = document.getElementById('totalTime');
    if (totalTimeElement) {
      totalTimeElement.innerText = this.formatTime(totalDuration);
    }

    const videoBar = document.getElementById('videoBar');
    if (videoBar) {
      videoBar.max = totalDuration;
    }
  },

  onTimeUpdate() {
    const videoElement = this.get('videoElement');
    if (!videoElement) {
      return;
    }

    const videoBar = document.getElementById('videoBar');
    const currentTimeElement = document.getElementById('currentTime');

    let elapsedTime = videoElement.currentTime;

    if (this.get('isPlayList')) {
      const currentVideoIndex = this.get('currentVideoIndex');
      const videoDurations = this.get('videoDurations');

      if (!videoDurations || videoDurations.length === 0) {
        return;
      }

      let loadedTime = 0;
      for (let i = 0; i < currentVideoIndex; i++) {
        loadedTime += videoDurations[i];
      }

      elapsedTime = loadedTime + videoElement.currentTime;
    }

    if (videoBar) {
      videoBar.value = elapsedTime;
      this.updateBufferedRange();
    }

    if (currentTimeElement) {
      currentTimeElement.innerText = this.formatTime(elapsedTime);
    }
  },

  onVideoBarInput(event) {
    const seekTime = parseFloat(event.target.value);
    const videoElement = this.get('videoElement');

    const videoBar = document.getElementById('videoBar');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !videoBar || !circleLoader) {
      console.error("Video element, seek bar, or circle loader not found!");
      return;
    }

    let bufferEnd = 0;

    for (let i = 0; i < videoElement.buffered.length; i++) {
      if (videoElement.buffered.start(i) <= seekTime) {
        bufferEnd = videoElement.buffered.end(i);
      }
    }

    videoElement.currentTime = seekTime;
    videoBar.value = seekTime;

    console.log(`Seek to: ${seekTime}sec, Buffer end: ${bufferEnd}sec`);

    if (seekTime <= bufferEnd) {
      circleLoader.classList.add('hidden');
      videoElement.play();
    } else {
      console.log(`Seek to: ${seekTime}sec, Buffer end: ${bufferEnd}sec`);
      console.log(`seekTime ${seekTime}()>= bufferEnd (${bufferEnd}sec)..so...I am wait for buffer to load`);

      circleLoader.classList.remove('hidden');

      this.set('isSeekMoreBuff', true);
      this.set('seekTargetTime', seekTime);

    }
  },

  updateBufferedRange() {
    const videoElement = this.get('videoElement');
    const videoBar = document.getElementById('videoBar');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !videoBar || !circleLoader) {
      return;
    }

    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;

    let bufferEnd = 0;

    for (let i = 0; i < videoElement.buffered.length; i++) {
      if (videoElement.buffered.start(i) <= currentTime) {
        bufferEnd = videoElement.buffered.end(i);
      }
    }

    const playedPercent = (currentTime / duration) * 100;
    const bufferedPercent = (bufferEnd / duration) * 100;

    videoBar.style.background = `linear-gradient(
    to right,
    #007FFF ${playedPercent}%,
    #B0C4DE ${playedPercent}% ${bufferedPercent}%,
    #fff ${bufferedPercent}%
  )`;

    if (!this.lastbufferEnd || bufferEnd > this.lastbufferEnd) {
      this.lastbufferEnd = bufferEnd;
    }

    if (this.get('isSeekMoreBuff')) {
      if (this.get('seekTargetTime') <= bufferEnd) {
        console.log(`Buffer reached seek target: ${this.get('seekTargetTime')}s, resuming video.`);
        this.set('isSeekMoreBuff', false);
        circleLoader.classList.add('hidden');
        videoElement.play();
      }
    }
  }


});
