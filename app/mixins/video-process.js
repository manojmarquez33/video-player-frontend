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

    let bufferedEnd = 0;


    for (let i = 0; i < videoElement.buffered.length; i++) {
      if (videoElement.buffered.start(i) <= seekTime) {
        bufferedEnd = videoElement.buffered.end(i);
      }
    }

    videoElement.currentTime = seekTime;
    videoBar.value = seekTime;

    console.log(`Seek to: ${seekTime}sec, Buffer end: ${bufferedEnd}sec`);


    if (seekTime <= bufferedEnd) {
      circleLoader.classList.add('hidden');
      videoElement.play();
    } else {
      console.log(`Seek to: ${seekTime}sec, Buffer end: ${bufferedEnd}sec`);
      console.log(`seekTime >= bufferedEnd (${bufferedEnd}sec)..so...I am wait for buffer to load`);
      circleLoader.classList.remove('hidden');
      this.set('isSeekingBeyondBuffer', true);
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
    let bufferedEnd = 0;

    for (let i = 0; i < videoElement.buffered.length; i++) {
      if (videoElement.buffered.start(i) <= currentTime) {
        bufferedEnd = videoElement.buffered.end(i);
      }
    }

    const playedPercent = (currentTime / duration) * 100;
    const bufferedPercent = (bufferedEnd / duration) * 100;


    videoBar.style.background = `linear-gradient(
    to right,
    #007FFF ${playedPercent}%,    /* Blue for played portion */
    #B0C4DE ${playedPercent}% ${bufferedPercent}%, /* Pink for buffered */
    #fff ${bufferedPercent}%   /* White for unbuffered */
  )`;

    // Save last buffered value for logic handling
    if (!this.lastBufferedEnd || bufferedEnd > this.lastBufferedEnd) {
      this.lastBufferedEnd = bufferedEnd;
    }

    // Handle seeking beyond the buffer
    if (this.get('isSeekingBeyondBuffer')) {
      if (this.get('seekTargetTime') <= bufferedEnd) {
        console.log(`Buffer reached seek target: ${this.get('seekTargetTime')}s, resuming video.`);
        this.set('isSeekingBeyondBuffer', false);
        circleLoader.classList.add('hidden');
        videoElement.play();
      }
    }
  }


});
