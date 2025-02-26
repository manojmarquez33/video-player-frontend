import Ember from 'ember';

export default Ember.Mixin.create({

  onLoadTotalTime() {
    const videoElement = this.get('videoElement');
    if (!videoElement) {
      console.error("❌ Video element not found!");
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
    let elapsedTime = 0;

    if (this.get('isPlayList')) {
      const currentVideoIndex = this.get('currentVideoIndex');
      const videoDurations = this.get('videoDurations');

      if (!videoDurations || videoDurations.length === 0) {
        console.error("video durations array is 0.");
        return;
      }

      let loadedTime = 0;
      for (let i = 0; i < currentVideoIndex; i++) {
        loadedTime += videoDurations[i];
      }

      elapsedTime = loadedTime + videoElement.currentTime;
    } else {
      elapsedTime = videoElement.currentTime;
    }

    if (videoBar) {
      videoBar.value = elapsedTime;
    }

    if (currentTimeElement) {
      currentTimeElement.innerText = this.formatTime(elapsedTime);
    }

    //console.log("current time:", this.formatTime(elapsedTime));
  },

  onVideoBarInput(event) {
    const seekTime = parseFloat(event.target.value);
    const videoElement = this.get('videoElement');

    if (this.get('isPlayList')) {
      const videoList = this.get('videoList');
      const videoDurations = this.get('videoDurations');

      for (let i = 0, loadedTime = 0; i < videoList.length; i++) {
        const videoDuration = videoDurations[i];

        if (seekTime < loadedTime + videoDuration) {
          const adjustedTime = seekTime - loadedTime;

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

        loadedTime += videoDuration;
      }
    } else {
      if (videoElement) {
        videoElement.currentTime = seekTime;
      }
    }
  },

});
