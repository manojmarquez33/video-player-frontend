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
      this.updateSeekBarColor();
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

    console.log(`Seeking to: ${seekTime}s, Buffered until: ${bufferedEnd}s`);

    videoElement.currentTime = seekTime;
    videoBar.value = seekTime;

    if (seekTime <= bufferedEnd) {
      console.log(`Seeked within buffer. Resuming video.`);
      circleLoader.classList.add('hidden');
      videoElement.play();
    } else {
      console.log(`Seeking past buffer (${bufferedEnd}s). Waiting for buffer...`);
      circleLoader.classList.remove('hidden');
      this.set('isSeekingBeyondBuffer', true);
      this.set('seekTargetTime', seekTime);

      videoElement.play().then(() => {
        videoElement.pause();
        console.log(`Forcing buffering request...`);
      }).catch(err => {
        console.warn("Error triggering buffer:", err);
      });

      const bufferCheckInterval = setInterval(() => {
        let updatedBufferedEnd = 0;
        for (let i = 0; i < videoElement.buffered.length; i++) {
          if (videoElement.buffered.start(i) <= seekTime) {
            updatedBufferedEnd = videoElement.buffered.end(i);
          }
        }

        console.log(`Checking buffer: Current buffered until ${updatedBufferedEnd}s, Target ${seekTime}s`);

        if (updatedBufferedEnd >= seekTime) {
          console.log(`Buffer reached seek time: ${seekTime}s, resuming playback.`);
          clearInterval(bufferCheckInterval);
          this.set('isSeekingBeyondBuffer', false);
          circleLoader.classList.add('hidden');
          videoElement.play();
        }
      }, 500);
    }
  },

  startBufferUpdateLoop() {
    const videoElement = this.get('videoElement');
    if (!videoElement) {
      return;
    }

    if (this.bufferUpdateInterval) {
      clearInterval(this.bufferUpdateInterval);
    }

    this.bufferUpdateInterval = setInterval(() => {
      let bufferedEnd = 0;
      for (let i = 0; i < videoElement.buffered.length; i++) {
        if (videoElement.buffered.start(i) <= videoElement.currentTime) {
          bufferedEnd = videoElement.buffered.end(i);
        }
      }

      if (!this.lastBufferedEnd || bufferedEnd > this.lastBufferedEnd) {
        console.log(`previous = ${this.lastBufferedEnd || 0}s, curr = ${bufferedEnd}s`);
        this.lastBufferedEnd = bufferedEnd;
      }

      this.updateBufferedRange();
    }, 500);
  },

  updateBufferedRange() {
    const videoElement = this.get('videoElement');
    const videoBar = document.getElementById('videoBar');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !videoBar || !circleLoader) {
      return;
    }

    let bufferedEnd = 0;
    for (let i = 0; i < videoElement.buffered.length; i++) {
      if (videoElement.buffered.start(i) <= videoElement.currentTime) {
        bufferedEnd = videoElement.buffered.end(i);
      }
    }

    let bufferedPercent = (bufferedEnd / videoElement.duration) * 100;

    videoBar.style.background = `linear-gradient(
    to right,
    #faa5b6 ${bufferedPercent}%,
    #fff ${bufferedPercent}%
  )`;

    if (!this.lastBufferedEnd || bufferedEnd > this.lastBufferedEnd) {
      this.lastBufferedEnd = bufferedEnd;
    }

    if (this.get('isSeekingBeyondBuffer')) {
      if (this.get('seekTargetTime') <= bufferedEnd) {
        console.log(`Buffer reached seek target: ${this.get('seekTargetTime')}s, resuming video.`);
        this.set('isSeekingBeyondBuffer', false);
        circleLoader.classList.add('hidden');
        videoElement.play();
      }
    }
  },

  updateSeekBarColor() {
    const videoElement = this.get('videoElement');
    const videoBar = document.getElementById('videoBar');

    if (!videoElement || !videoBar) {
      return;
    }

    const playedPercentage = (videoElement.currentTime / videoElement.duration) * 100;

    videoBar.style.background = `linear-gradient(to right, #e0dd1b ${playedPercentage}%, #ddd ${playedPercentage}%)`;

    console.log(`Seek Bar Updated: ${playedPercentage}%`);
  }

});
