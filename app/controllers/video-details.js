import Ember from 'ember';

export default Ember.Controller.extend({
  isPlaying: false,
  selectedSpeed: 1,
  videoElement: null,
  intervalRewind: null,

  didInsertElement() {
    this._super(...arguments);
    let video = document.getElementById("videoPlayer");

    if (video) {
      this.set("videoElement", video);

      video.addEventListener("loadedmetadata", () => {
        Ember.run.scheduleOnce("afterRender", this, () => {
          document.getElementById("totalTime").textContent = formatTime(video.duration);
          document.getElementById("videoBar").max = video.duration;
        });
      });

      video.addEventListener("timeupdate", () => {
        Ember.run.scheduleOnce("afterRender", this, () => {
          document.getElementById("currentTime").textContent = formatTime(video.currentTime);
          document.getElementById("videoBar").value = video.currentTime;
        });
      });

      video.addEventListener("pause", () => {
        Ember.run.scheduleOnce("afterRender", this, () => {
          this.set("isPlaying", false);
          document.getElementById("playPause").textContent = "Play";
        });
      });

      video.addEventListener("play", () => {
        Ember.run.scheduleOnce("afterRender", this, () => {
          this.set("isPlaying", true);
          document.getElementById("playPause").textContent = "Pause";
          requestAnimationFrame(updateVideoBar.bind(this));
        });
      });
    }
  },

  actions: {
    togglePlay() {
      let video = this.get("videoElement");
      if (video.paused || video.ended) {
        video.play();
        this.set("isPlaying", true);
      } else {
        video.pause();
        this.set("isPlaying", false);
      }
    },

    skipBackward() {
      let video = this.get("videoElement");
      video.currentTime = Math.max(0, video.currentTime - 10);
    },

    skipForward() {
      let video = this.get("videoElement");
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    },

    fastRewind() {
      let video = this.get("videoElement");
      let fps = 10;
      clearInterval(this.intervalRewind);

      this.intervalRewind = setInterval(() => {
        if (video.currentTime <= 0) {
          clearInterval(this.intervalRewind);
          video.currentTime = 0;
          video.pause();
        } else {
          video.currentTime -= (1 / fps) * this.selectedSpeed;
        }
      }, 1000 / fps);
    },

    fastForward() {
      let video = this.get("videoElement");
      video.playbackRate = 2.0;
    },

    stopVideo() {
      let video = this.get("videoElement");
      clearInterval(this.intervalRewind);
      video.pause();
      video.playbackRate = 1;
    },

    setPlaybackSpeed(event) {
      let video = this.get("videoElement");
      let speed = parseFloat(event.target.value);
      if (!isNaN(speed) && speed > 0) {
        this.set("selectedSpeed", speed);
        video.playbackRate = speed;
      }
    },

    setVolume(event) {
      let video = this.get("videoElement");
      video.volume = event.target.value;
    },

    zoomIn() {
      let video = this.get("videoElement");
      video.style.transform = "scale(1.2)";
    },

    zoomOut() {
      let video = this.get("videoElement");
      video.style.transform = "scale(1.0)";
    },

    toggleFullScreen() {
      let videoContainer = document.querySelector(".video-container");
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },

    convertBlackAndWhite() {
      let video = this.get("videoElement");
      video.style.filter = video.style.filter === "grayscale(100%)" ? "grayscale(0%)" : "grayscale(100%)";
    },

    downloadFrame() {
      let video = this.get("videoElement");
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      let image = canvas.toDataURL("image/png");
      let link = document.createElement("a");
      link.href = image;
      link.download = "frame.png";
      link.click();
    },

    skipToSec() {
      let video = this.get("videoElement");
      let skipInput = document.getElementById("skipInput").value;
      let skipSec = parseFloat(skipInput);

      let isBuffered = false;
      for (let i = 0; i < video.buffered.length; i++) {
        if (skipSec >= video.buffered.start(i) && skipSec <= video.buffered.end(i)) {
          isBuffered = true;
          break;
        }
      }

      if (isBuffered) {
        video.currentTime = skipSec;
      } else {
        alert("The selected time is not loaded yet.");
      }
    },
  },
});

// Helper function to format time
function formatTime(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let secondsLeft = Math.floor(seconds % 60);
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}

// Helper function to update video progress bar
function updateVideoBar() {
  let video = document.getElementById("videoPlayer");
  let videoBar = document.getElementById("videoBar");
  let currentTimeLabel = document.getElementById("currentTime");

  if (video && videoBar && currentTimeLabel) {
    videoBar.value = video.currentTime;
    currentTimeLabel.textContent = formatTime(video.currentTime);
    requestAnimationFrame(updateVideoBar);
  }
}
