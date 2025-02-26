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
    const videoBar = document.getElementById('videoBar');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !videoBar || !circleLoader) {
      console.error("Video element, seek bar, or circle loader not found!");
      return;
    }

    circleLoader.classList.remove('hidden');

    if (this.get('isPlayList')) {
      const videoList = this.get('videoList') || [];
      const videoDurations = this.get('videoDurations') || [];

      if (!videoList.length || !videoDurations.length) {
        console.error("Playlist data missing!");
        circleLoader.classList.add('hidden');
        return;
      }

      let accumulatedTime = 0;
      let targetVideoIndex = 0;
      let targetTime = 0;

      for (let i = 0; i < videoDurations.length; i++) {
        if (seekTime < accumulatedTime + videoDurations[i]) {
          targetVideoIndex = i;
          targetTime = seekTime - accumulatedTime;
          break;
        }
        accumulatedTime += videoDurations[i];
      }


      if (this.get('currentVideoIndex') !== targetVideoIndex) {
        this.set('currentVideoIndex', targetVideoIndex);
        videoElement.src = videoList[targetVideoIndex];
        videoElement.load();

        videoElement.onloadeddata = () => {
          videoElement.currentTime = targetTime;
          videoElement.play();
        };
      } else {
        videoElement.currentTime = targetTime;
      }
    } else {

      if (!isNaN(seekTime) && seekTime >= 0 && seekTime <= videoElement.duration) {
        videoElement.currentTime = seekTime;
      } else {
        console.error("Invalid seek time:", seekTime);
      }
    }


    videoBar.value = seekTime;

    videoElement.addEventListener('canplay', () => {
      circleLoader.classList.add('hidden');
    });

    videoElement.addEventListener('playing', () => {
      circleLoader.classList.add('hidden');
    });

    videoElement.addEventListener('error', () => {
      console.error("Error loading video.");
      circleLoader.classList.add('hidden');
    });
  },
});
