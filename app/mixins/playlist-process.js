import Ember from 'ember';

export default Ember.Mixin.create({
  isPlayList: true,
  videoList: [],
  currentVideoIndex: 0,
  totalDuration: 0,
  videoDurations: [],

  loadPlaylist() {
    const model = this.get('model');
    const circleLoader = document.getElementById('circleLoader');

    if (!model || !Array.isArray(model.videoList)) {
      console.error(" Missing playlist data.");
      return;
    }

    if (circleLoader) {
      circleLoader.classList.remove('hidden');
    }

    const videoUrls = model.videoList.map(video => video.url);
    this.setProperties({
      videoList: videoUrls,
      videoDurations: new Array(videoUrls.length).fill(0),
      currentVideoIndex: 0,
    });

    this.preloadDurations();
  },

  preloadDurations(index = 0) {
    const videoList = this.get('videoList');
    const videoDurations = this.get('videoDurations');

    if (index >= videoList.length) {

      let totalDuration = 0;
      for (let i = 0; i < videoDurations.length; i++) {
        totalDuration += videoDurations[i];
      }

      this.set('totalDuration', totalDuration);

      const totalTime = document.getElementById("totalTime");

      if (totalTime) {
        totalTime.textContent = this.formatTime(totalDuration);
      }

      const videoBar = document.getElementById('videoBar');
      if (videoBar) {
        videoBar.max = totalDuration;
      }

      const videoElement = this.get('videoElement');
      if (videoElement) {
        videoElement.src = videoList[0];
        videoElement.load();
      }
      return;
    }

    const tempVideo = document.createElement("video");
    tempVideo.src = videoList[index];
    tempVideo.preload = "metadata";

    tempVideo.onloadedmetadata = () => {
      videoDurations[index] = tempVideo.duration || 0;

      console.log(`duration ${index}:`, videoDurations[index]);

      this.preloadDurations(index + 1);
    };

    // tempVideo.onerror = () => {
    //   console.error(`Error loading video metadata for ${videoList[index]}`);
    //   videoDurations[index] = 0;
    //   this.preloadDurations(index + 1);
    // };
  },

  playNextVideo() {
    let currentVideoIndex = this.get('currentVideoIndex');
    const videoList = this.get('videoList');
    const videoElement = this.get('videoElement');

    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !circleLoader) {
      console.error("Video element or loading spinner not found!");
      return;
    }


    circleLoader.classList.remove('hidden');

    if (currentVideoIndex >= videoList.length - 1) {
      this.set('currentVideoIndex', 0);
    } else {
      this.set('currentVideoIndex', currentVideoIndex + 1);
    }

    videoElement.src = videoList[this.get('currentVideoIndex')];
    videoElement.load();


    videoElement.addEventListener('canplay', () => {
      circleLoader.classList.add('hidden');
    });

    videoElement.addEventListener('playing', () => {
      circleLoader.classList.add('hidden');
    });

    videoElement.addEventListener('waiting', () => {
      circleLoader.classList.remove('hidden');
    });

    videoElement.addEventListener('error', () => {
      console.error("Error loading video.");
      circleLoader.classList.add('hidden');
    });

    videoElement.onloadeddata = () => {
      videoElement.currentTime = 0;
      videoElement.play();
    };
  }

});
