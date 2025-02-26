import Ember from 'ember';

export default Ember.Mixin.create({
  isPlayList: true,
  videoList: [],
  currentVideoIndex: 0,
  totalDuration: 0,
  videoDurations: [],

  loadPlaylist() {
    const model = this.get('model');

    if (!model || !Array.isArray(model.videoList)) {
      console.error("missing playlist data");
      return;
    }

    //console.log("check list datas are correct:", model.videoList);

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

    if (!videoElement || currentVideoIndex >= videoList.length - 1) {
      this.set('currentVideoIndex', 0);
      videoElement.src = videoList[0];
      videoElement.load();
      return;
    }

    this.set('currentVideoIndex', currentVideoIndex + 1);

    videoElement.src = videoList[this.get('currentVideoIndex')];
    videoElement.load();

    videoElement.onloadeddata = () => {
      videoElement.currentTime = 0;
      videoElement.play();
    };
  }
});
