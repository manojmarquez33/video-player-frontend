import Ember from 'ember';

export default Ember.Mixin.create({

  session: Ember.inject.service(),

  actions: {

    playbackRate: 1.0,



    // likeVideo() {
    //   if (this.get('isLiked')) {
    //     this.send('updateLikeStatus', 0);
    //   } else {
    //     this.send('updateLikeStatus', 1);
    //   }
    // },
    //
    // dislikeVideo() {
    //   if (this.get('isDisliked')) {
    //     this.send('updateLikeStatus', 0);
    //   } else {
    //     this.send('updateLikeStatus', -1);
    //   }
    // },
    //
    // updateLikeStatus(status) {
    //   let fileName, mediaId, username;
    //
    //   if (this.get('isPlayList')) {
    //     fileName = this.get('model.playlistName');
    //   } else {
    //     fileName = this.get('model.fileName');
    //   }
    //
    //   mediaId = this.get('model.id');
    //   username = this.get('session').getCookie("username");
    //
    //   if (!username) {
    //     console.error("Error: Username is missing in localStorage!");
    //     return;
    //   }
    //
    //   console.log("Updating like status for:", fileName, "Media ID:", mediaId, "Username:", username, "Status:", status);
    //
    //   Ember.$.ajax({
    //     url: `${AppConfig.VideoServlet_API_URL}`,
    //     type: "POST",
    //     contentType: "application/json",
    //     data: JSON.stringify({
    //       mediaId: mediaId,
    //       video: fileName,
    //       username: username,
    //       likeStatus: status
    //     }),
    //     success: () => {
    //       if (status === 1) {
    //         this.set('isLiked', true);
    //         this.set('isDisliked', false);
    //         console.log("Like status updated: 1");
    //       } else if (status === -1) {
    //         this.set('isLiked', false);
    //         this.set('isDisliked', true);
    //         console.log("Like status updated: -1");
    //       } else {
    //         this.set('isLiked', false);
    //         this.set('isDisliked', false);
    //         console.log("Like status reset to default.");
    //       }
    //     },
    //     error: (jqXHR, textStatus, errorThrown) => {
    //       console.error("Error updating like status:", errorThrown);
    //     }
    //   });
    // },

    togglePlay() {
      const videoElement = this.get('videoElement');
      let playbackRate = parseFloat(this.get('playbackRate'));

      if (!videoElement) {
        console.error("Video element not found!");
        return;
      }

      if (isNaN(playbackRate) || !isFinite(playbackRate)) {
        playbackRate = 1.0;
        this.set('playbackRate', playbackRate);
      }


      videoElement.playbackRate = playbackRate;

      if (videoElement.paused) {
        videoElement.play();
        this.set('isPlaying', true);
      } else {
        videoElement.pause();
        this.set('isPlaying', false);
      }
    },

    skipBackward() {
      let video = this.get('videoElement');
      video.currentTime = Math.max(0, video.currentTime - 5);
    },

    skipForward() {
      let video = this.get('videoElement');
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    },


    fastForward() {
      let video = this.get('videoElement');
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);

      let speed = this.get('selectedSpeed') || 2;

      video.playbackRate = speed;
      video.play();
      this.set('isPlaying', true);
    },

    fastRewind() {
      let video = this.get('videoElement');
      const circleLoader = document.getElementById('circleLoader');
      circleLoader.classList.add('hidden');

      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);

      let speed = this.get('selectedSpeed') || 2;
      video.playbackRate = speed;
      const fps = 20;

      this.intervalRewind = setInterval(() => {
        if (video.currentTime <= 0) {

          clearInterval(this.intervalRewind);
          video.currentTime = 0;
          video.pause();
          this.set('isPlaying', false);
        } else {
          video.currentTime -= (1 / fps) * speed;
        }
      }, 1000 / fps);
    },


    stopVideo() {
      let video = this.get('videoElement');
      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 1;
      this.set('isPlaying', false);
    },

    setPlaybackSpeedFromDropdown() {
      let speedValue = document.getElementById('playbackSpeed').value;
      this.updatePlaybackSpeed(parseFloat(speedValue));
    },

    setPlaybackSpeedFromInput() {
      let speedInput = document.getElementById('speedInput');
      let speed = speedInput ? parseFloat(speedInput.value) : NaN;
      this.updatePlaybackSpeed(speed);
    },

    setVolume(volumeValue) {
      let video = this.get('videoElement');
      let volume = parseFloat(volumeValue);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        video.volume = volume;
      }
    },

    skipToSec() {
      let video = this.get('videoElement');
      let skipInput = document.getElementById('skipInput').value;
      let skipSec = parseFloat(skipInput);

      if (isFinite(skipSec) && skipSec >= 0 && skipSec <= video.duration) {
        let isBuffered = false;

        for (let i = 0; i < video.buffered.length; i++) {
          const start = video.buffered.start(i);
          const end = video.buffered.end(i);

          if (skipSec >= start && skipSec <= end) {
            isBuffered = true;
            break;
          }
        }

        if (isBuffered) {
          video.currentTime = skipSec;
        } else {
          alert("Your selection can't load.");
        }
      } else {
        alert('You entered a time beofre the video duration.');
      }
    },

    resetVideo() {
      let video = this.get('videoElement');

      this.setProperties({
        scale: 1,
        translateX: 0,
        translateY: 0,
      });
      this.updateTransform();

      this.set('selectedSpeed', 1);
      video.playbackRate = 1;

      video.style.filter = 'none';

      video.volume = 1;
      video.muted = false;

      clearInterval(this.intervalRewind);
      clearInterval(this.intervalForward);

      document.getElementById('volumeBar').value = 1;
      document.getElementById('playbackSpeed').value = 1;
      //document.getElementById('speedInput').value = '1';

      // video.pause();
      // video.currentTime = 0;
      // this.set('isPlaying', false);
    },

    toggleFullScreen() {
      let videoContainer = document.querySelector('.video-container');
      if (!videoContainer) {
        return;
      }

      if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
          videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
          videoContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },

    convertBlackAndWhite() {
      let video = this.get('videoElement');
      let currentFilter = video.style.filter;
      video.style.filter = currentFilter === 'grayscale(100%)' ? 'none' : 'grayscale(100%)';
    },

    downloadFrame() {
      let video = document.getElementById("videoPlayer");
      let comments = document.querySelectorAll(".bullet-comment");

      let curZoom = this.get('curZoom') || 1;
      let moveX = this.get('moveX') || 0;
      let moveY = this.get('moveY') || 0;

      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      let canvasWidth = video.videoWidth * curZoom + Math.abs(moveX);
      let canvasHeight = video.videoHeight * curZoom + Math.abs(moveY);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.translate(moveX, moveY);
      ctx.scale(curZoom, curZoom);
      ctx.filter = getComputedStyle(video).filter;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      comments.forEach(comment => {

        let style = getComputedStyle(comment);

          let x = parseFloat(style.left);
          let y = parseFloat(style.top);
          let width = comment.offsetWidth;
          let height = comment.offsetHeight;

        ctx.fillStyle = style.backgroundColor;
          ctx.globalAlpha = parseFloat(style.opacity);
          ctx.fillRect(x, y, width, height);

        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        ctx.globalAlpha = 1;
        ctx.textBaseline = "top";
        ctx.fillText(comment.textContent, x + 5, y + 5);
      });

      ctx.globalAlpha = 1;

      canvas.toBlob((blob) => {
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = url;
        link.download = 'Image_ZoTube.png';
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    },



    seekVideo(value) {
      let videoElement = this.get('videoElement');
      let videoList = this.get('videoList');
      let videoDurations = this.get('videoDurations');
      let currentVideoIndex = this.get('currentVideoIndex');

      if (!videoElement || !videoList.length || !videoDurations.length) {
        console.error("Video element or playlist data missing.");
        return;
      }

      let seekTime = parseFloat(value);
      if (isNaN(seekTime) || seekTime < 0 || seekTime > this.get('totalDuration')) {
        console.error("enter valid time:", seekTime);
        return;
      }

      let loadedTime = 0;
      let targetVideoIndex = 0;
      let targetTime = 0;

      for (let i = 0; i < videoDurations.length; i++) {
        if (seekTime < loadedTime + videoDurations[i]) {
          targetVideoIndex = i;
          targetTime = seekTime - loadedTime;
          break;
        }
        loadedTime += videoDurations[i];
      }

      if (currentVideoIndex === targetVideoIndex) {
        videoElement.currentTime = targetTime;
      } else {

        this.set('currentVideoIndex', targetVideoIndex);
        videoElement.src = videoList[targetVideoIndex];
        videoElement.load();

        videoElement.onloadeddata = () => {
          videoElement.currentTime = targetTime;
          videoElement.play();
        };
      }
    },
  },

  updatePlaybackSpeed(speed) {
    let video = this.get('videoElement');
    if (!isNaN(speed) && speed > 0) {
      this.set('selectedSpeed', speed);
      video.playbackRate = speed;
      document.getElementById('playbackSpeed').value = speed;
    } else {
      alert('Please enter a valid playback speed.');
    }
  },



});
