import Ember from 'ember';

export default Ember.Mixin.create({

  setupVideoPlayer() {
    const videoElement = document.getElementById('videoPlayer');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement) {
      console.error("Video not found!");
      return;
    }

    videoElement.crossOrigin = 'anonymous';
    this.set('videoElement', videoElement);

    if (!this.get('isPlayList')){
      document.getElementById("subtitleToggle").addEventListener("change", (event) => {
        this.toggleSubtitle(event);
      });
  }

    videoElement.addEventListener('waiting', () => circleLoader.classList.remove('hidden'));
    videoElement.addEventListener('playing', () => circleLoader.classList.add('hidden'));
    videoElement.addEventListener('canplay', () => circleLoader.classList.add('hidden'));
    videoElement.addEventListener('stalled', () => circleLoader.classList.remove('hidden'));
    videoElement.addEventListener('error', () => circleLoader.classList.add('hidden'));

    const videoBar = document.getElementById('videoBar');
    const volumeBar = document.getElementById('volumeBar');

    videoElement.addEventListener('loadedmetadata', this.onLoadTotalTime.bind(this));
    videoElement.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    videoElement.addEventListener('pause', () => this.set('isPlaying', false));
    videoElement.addEventListener('play', () => this.set('isPlaying', true));

    if (this.get('isPlayList')) {
      videoElement.addEventListener('ended', this.playNextVideo.bind(this));
    }
    if (videoBar) {
      videoBar.addEventListener('input', this.onVideoBarInput.bind(this));
      videoBar.addEventListener('change', () => this.set('isSeeking', false));
      videoBar.addEventListener('mousedown', () => this.set('isSeeking', true));
      videoBar.addEventListener('mouseup', () => this.set('isSeeking', false));
    } else {
      console.error("Video bar not found!");
    }

    if (volumeBar) {
      volumeBar.value = videoElement.volume;
      volumeBar.addEventListener('input', (event) => videoElement.volume = event.target.value);
    } else {
      console.error("Volume bar not found!");
    }

    videoElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
    videoElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    videoElement.addEventListener('mouseup', () => this.onMouseUp());
    videoElement.addEventListener('mouseleave', () => this.onMouseUp());

    if (this.get('isPlayList')) {
      this.loadPlaylist();
    } else {
      this.loadSingleVideo();
    }

    console.log('Video player initialized successfully!');
  },

  loadSingleVideo() {
    const videoElement = this.get('videoElement');
    const videoModel = this.get('model');
    const circleLoader = document.getElementById('circleLoader');

    if (!videoElement || !circleLoader) {
      console.error("Video element or loading spinner not found!");
      return;
    }

    if (videoModel && videoModel.fileName) {
      const videoFileName = videoModel.fileName;
      circleLoader.classList.remove('hidden');

      videoElement.src = `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?video=${encodeURIComponent(videoFileName)}`;
      videoElement.load();

      videoElement.addEventListener('canplay', () => circleLoader.classList.add('hidden'));
      videoElement.addEventListener('playing', () => circleLoader.classList.add('hidden'));
      videoElement.addEventListener('error', () => {
        console.error("Error loading video.");
        circleLoader.classList.add('hidden');
      });
    } else {
      console.error("Video file name is missing!");
    }
  },

  loadSubtitle(videoFileName) {
    const videoElement = this.get('videoElement');

    fetch(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?subtitle=${encodeURIComponent(videoFileName)}`)
      .then(response => {
        if (response.ok) {
          const subtitleTrack = document.createElement("track");
          subtitleTrack.kind = "subtitles";
          subtitleTrack.label = "English";
          subtitleTrack.srclang = "en";
          subtitleTrack.src = response.url;
          subtitleTrack.default = true;

          videoElement.appendChild(subtitleTrack);
          this.set('subtitleTrack', subtitleTrack);

          console.log("Subtitle load sucess:", response.url);
        } else {
          console.log("subtitle not found", videoFileName);
        }
      })
      .catch(error => console.error("Error loading subtitle:", error));
  },

  toggleSubtitle(event) {
    console.log("Subtitle Toggle Event:", event);

    if (!event || !event.target) {
      console.error("Event or event.target is not define");
      return;
    }

    const videoElement = this.get('videoElement');
    let subtitleTrack = this.get('subtitleTrack');

    if (!subtitleTrack) {
      console.warn("No subtitle track found. Trying to load...");
      const videoModel = this.get('model');
      if (videoModel && videoModel.fileName) {
        this.loadSubtitle(videoModel.fileName);
        setTimeout(() => {
          let loadedTrack = this.get('subtitleTrack');
          if (loadedTrack) {
            loadedTrack.mode = event.target.value === "on" ? "showing" : "hidden";
            console.log(`Subtitles toggled to: ${loadedTrack.mode}`);
          }
        }, 1000);
      }
    } else {
      subtitleTrack.mode = event.target.value === "on" ? "showing" : "hidden";
      console.log(`Subtitle toggled to: ${subtitleTrack.mode}`);

      videoElement.textTracks[0].mode = "hidden";
      setTimeout(() => {
        videoElement.textTracks[0].mode = event.target.value === "on" ? "showing" : "hidden";
        console.log(`Subtitle mode after reset: ${videoElement.textTracks[0].mode}`);
      }, 100);
    }
  }
});
