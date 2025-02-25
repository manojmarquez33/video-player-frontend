import Ember from 'ember';

export default Ember.Mixin.create({
  isPlayList: true,
  videoList: [],
  currentVideoIndex: 0,
  totalDuration: 0,
  videoDurations: [],

  loadPlaylist() {
    const model = this.get('model');
    console.log("📦 Model contents:", model);

    if (model && Array.isArray(model.videoList)) {
      const videos = model.videoList;
      console.log("✅ Using videoList from model:", videos);

      const videoUrls = videos.map(video => video.url);
      this.setProperties({
        videoList: videoUrls,
        videoDurations: new Array(videoUrls.length).fill(0),
        currentVideoIndex: 0,
      });

      this.preloadDurations();
    } else if (typeof model === 'object' && model.playlist_id) {
      const playlistFile = model.playlist_id;
      console.log("🎬 Fetching playlist:", playlistFile);

      fetch(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?video=${encodeURIComponent(playlistFile)}&metadata=true`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`❌ HTTP Error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(videos => {
          if (!Array.isArray(videos) || videos.length === 0) {
            console.error("❌ No valid videos found in the playlist.");
            return;
          }

          console.log("✅ Playlist videos fetched:", videos);
          const videoUrls = videos.map(video => video.url);
          this.setProperties({
            videoList: videoUrls,
            videoDurations: new Array(videoUrls.length).fill(0),
            currentVideoIndex: 0,
          });

          this.preloadDurations();
        })
        .catch(error => {
          console.error("❌ Error fetching playlist:", error);
        });
    } else {
      console.error("❌ Playlist file is missing or invalid!");
      return;
    }
  },

  preloadDurations(index = 0) {
    const videoList = this.get('videoList');
    const videoDurations = this.get('videoDurations');

    if (index >= videoList.length) {
      const totalDuration = videoDurations.reduce((acc, dur) => acc + dur, 0);
      this.set('totalDuration', totalDuration);
      sessionStorage.setItem("totalPlaylistDuration", totalDuration);

      document.getElementById("totalTime").textContent = this.formatTime(totalDuration);
      const videoBar = document.getElementById('videoBar');
      if (videoBar) {
        videoBar.max = totalDuration;
      }

      const videoElement = this.get('videoElement');
      videoElement.src = videoList[0];
      videoElement.load();
      return;
    }

    const tempVideo = document.createElement("video");
    tempVideo.src = videoList[index];
    tempVideo.preload = "metadata";

    tempVideo.onloadedmetadata = () => {
      videoDurations[index] = tempVideo.duration || 0;
      console.log(`Loaded duration for video ${index}:`, videoDurations[index]);
      this.preloadDurations(index + 1);
    };

    tempVideo.onerror = () => {
      console.error(`❌ Error loading video metadata for ${videoList[index]}`);
      videoDurations[index] = 0;
      this.preloadDurations(index + 1);
    };
  },

  playNextVideo() {
    let currentVideoIndex = this.get('currentVideoIndex');
    const videoList = this.get('videoList');
    const videoElement = this.get('videoElement');

    console.log("playNextVideo called, currentVideoIndex:", currentVideoIndex);

    if (currentVideoIndex < videoList.length - 1) {
      currentVideoIndex++;
      this.set('currentVideoIndex', currentVideoIndex);

      videoElement.src = videoList[currentVideoIndex];
      videoElement.load();

      videoElement.onloadeddata = () => {
        videoElement.currentTime = 0;
        videoElement.play();
      };
    } else {
      console.log("🚀 Playlist finished");
      this.set('currentVideoIndex', 0);
      videoElement.src = videoList[0];
      videoElement.load();
    }
  }
});
