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
      this.updateBufferedRange(elapsedTime);
    }

    if (currentTimeElement) {
      currentTimeElement.innerText = this.formatTime(elapsedTime);
    }
  },

  // onVideoBarInput(event) {
  //   const seekTime = parseFloat(event.target.value);
  //   const videoElement = this.get('videoElement');
  //   const videoBar = document.getElementById('videoBar');
  //   const circleLoader = document.getElementById('circleLoader');
  //
  //   if (!videoElement || !videoBar || !circleLoader) {
  //     console.error("Video element, seek bar, or circle loader not found!");
  //     return;
  //   }
  //
  //   if (this.get('isPlayList')) {
  //     const videoDurations = this.get('videoDurations');
  //     if (!videoDurations || videoDurations.length === 0) {
  //       return;
  //     }
  //
  //     let accumulatedTime = 0;
  //     let targetVideoIndex = 0;
  //     let relativeSeekTime = 0;
  //
  //     for (let i = 0; i < videoDurations.length; i++) {
  //       if (seekTime < accumulatedTime + videoDurations[i]) {
  //         targetVideoIndex = i;
  //         relativeSeekTime = seekTime - accumulatedTime;
  //         break;
  //       }
  //       accumulatedTime += videoDurations[i];
  //     }
  //
  //     console.log(`Seeking to ${seekTime}s, which falls into Video ${targetVideoIndex} at ${relativeSeekTime}s`);
  //
  //     if (this.get('currentVideoIndex') === targetVideoIndex) {
  //       videoElement.currentTime = relativeSeekTime;
  //     } else {
  //       this.set('currentVideoIndex', targetVideoIndex);
  //       this.loadVideoAtIndex(targetVideoIndex, relativeSeekTime);
  //     }
  //
  //     videoBar.value = seekTime;
  //   } else {
  //     console.log(`Seeking within single video: ${seekTime}s`);
  //     videoElement.currentTime = seekTime;
  //     videoBar.value = seekTime;
  //   }
  // },

  onVideoBarInput(event) {
    const seekValue = parseFloat(event.target.value);
    console.log(`Seekbar changed: Seeking to ${seekValue}s`);
    this.seekVideo(seekValue);
  },
  seekVideo(seekValue) {
    console.log(`seekVideo called with: ${seekValue}s`);

    const videoElement = this.get('videoElement');
    if (!videoElement) {
      console.error("Video element not found!");
      return;
    }

    if (this.get('isPlayList')) {
      const videoDurations = this.get('videoDurations');
      if (!videoDurations || videoDurations.length === 0) {
        console.error("No video durations found!");
        return;
      }

      let accumulatedTime = 0;
      let targetVideoIndex = 0;
      let relativeSeekTime = 0;

      for (let i = 0; i < videoDurations.length; i++) {
        if (seekValue < accumulatedTime + videoDurations[i]) {
          targetVideoIndex = i;
          relativeSeekTime = seekValue - accumulatedTime;
          break;
        }
        accumulatedTime += videoDurations[i];
      }

      console.log(`Seeking to ${seekValue}s, which falls into Video ${targetVideoIndex} at ${relativeSeekTime}s`);

      if (this.get('currentVideoIndex') !== targetVideoIndex) {
        this.set('currentVideoIndex', targetVideoIndex);
        this.loadVideoAtIndex(targetVideoIndex, relativeSeekTime);
      } else {
        videoElement.currentTime = relativeSeekTime;
      }
    } else {
      console.log(`Seeking within single video: ${seekValue}s`);
      videoElement.currentTime = seekValue;
    }
  },

  loadVideoAtIndex(index, startTime = 0) {
    const videoElement = this.get('videoElement');
    const videoSources = this.get('videoSources');


    if (!videoElement || !videoSources || !videoSources[index]) {
      console.error("Invalid video index or sources");
      return;
    }

    videoElement.src = videoSources[index];
    videoElement.load();


    videoElement.onloadeddata = () => {
      videoElement.currentTime = startTime;
      videoElement.play();
      console.log(`Loaded Video ${index} and seeked to ${startTime}s`);
    };

    this.set('currentVideoIndex', index);
  },

  updateBufferedRange() {
    const videoElement = this.get('videoElement');
    const videoBar = document.getElementById('videoBar');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !videoBar || !circleLoader) {
      return;
    }

    let playedTime, bufferEnd, playedPercent, bufferedPercent;

    if (this.get('isPlayList')) {
      const currentVideoIndex = this.get('currentVideoIndex');
      const videoDurations = this.get('videoDurations');
      const totalDuration = this.get('totalDuration');

      playedTime = 0;
      for (let i = 0; i < currentVideoIndex; i++) {
        playedTime += videoDurations[i];
      }
      playedTime += videoElement.currentTime;

      bufferEnd = playedTime;
      for (let i = 0; i < videoElement.buffered.length; i++) {
        if (videoElement.buffered.start(i) <= videoElement.currentTime) {
          bufferEnd = playedTime + (videoElement.buffered.end(i) - videoElement.currentTime);
        }
      }

      playedPercent = (playedTime / totalDuration) * 100;
      bufferedPercent = (bufferEnd / totalDuration) * 100;
    } else {
      const duration = videoElement.duration;
      playedTime = videoElement.currentTime;
      bufferEnd = videoElement.buffered.length > 0 ? videoElement.buffered.end(0) : 0;

      playedPercent = (playedTime / duration) * 100;
      bufferedPercent = (bufferEnd / duration) * 100;
    }


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
