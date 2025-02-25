import Ember from 'ember';

export default Ember.Mixin.create({
  onLoadTotalTime() {
    const videoElement = this.get('videoElement');
    if (!videoElement) {
      console.error("❌ Video element not found!");
      return;
    }

    const totalDuration = this.get('isPlayList') ? this.get('totalDuration') : videoElement.duration;
    document.getElementById('totalTime').innerText = this.formatTime(totalDuration);
    const videoBar = document.getElementById('videoBar');
    if (videoBar) {
      videoBar.max = totalDuration;
    }
  },

  onTimeUpdate() {
    const videoElement = this.get('videoElement');
    if (!videoElement || this.get('isSeeking')) {
      return;
    }

    const videoBar = document.getElementById('videoBar');
    const currentTimeElement = document.getElementById('currentTime');
    let elapsedTime = 0;

    if (this.get('isPlayList')) {
      const currentVideoIndex = this.get('currentVideoIndex');
      const videoDurations = this.get('videoDurations');

      if (!videoDurations || videoDurations.length === 0) {
        console.error("❌ videoDurations array is empty or undefined.");
        return;
      }

      elapsedTime = videoDurations.slice(0, currentVideoIndex).reduce((acc, dur) => acc + dur, 0);
      elapsedTime += videoElement.currentTime;
    } else {
      elapsedTime = videoElement.currentTime;
    }

    if (videoBar) {
      videoBar.value = elapsedTime;
    }

    if (currentTimeElement) {
      currentTimeElement.innerText = this.formatTime(elapsedTime);
    }

    console.log("⏳ Updated current time:", this.formatTime(elapsedTime));
  },

  onVideoBarInput(event) {
    const seekTime = parseFloat(event.target.value);
    const videoElement = this.get('videoElement');

    if (this.get('isPlayList')) {
      const videoList = this.get('videoList');
      const videoDurations = this.get('videoDurations');

      for (let i = 0, accumulatedTime = 0; i < videoList.length; i++) {
        const videoDuration = videoDurations[i];

        if (seekTime < accumulatedTime + videoDuration) {
          const adjustedTime = seekTime - accumulatedTime;

          if (this.get('currentVideoIndex') !== i) {
            this.set('currentVideoIndex', i);
            videoElement.src = videoList[i];
            videoElement.load();

            videoElement.onloadeddata = () => {
              videoElement.currentTime = adjustedTime;
              videoElement.play();
            };
          } else {
            videoElement.currentTime = adjustedTime;
          }
          break;
        }

        accumulatedTime += videoDuration;
      }
    } else {
      if (videoElement) {
        videoElement.currentTime = seekTime;
      }
    }
  },

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
      hrs > 0 ? hrs.toString().padStart(2, '0') : null,
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(":");
  },
});
