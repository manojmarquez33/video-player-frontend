import AppConfig from "../config/app-config";
import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';
import $ from 'jquery';

export default Ember.Controller.extend(
  VideoInitializer,
  VideoController,
  VideoProcess,
  ZoomDrag,
  VideoUtils,
  {
    isPlayList: false,
    selectedSpeed: 1,
    isPlaying: false,
    videoElement: null,
    isLiked: false,
    isDisliked: false,
    newComment: "",
    comments: [],
    commentStatusMessage: null,
    currentUserId: null,

    session: Ember.inject.service(),

    init() {
      this._super(...arguments);

      this.laneCount = 10;
      this.activeLanes = new Array(this.laneCount).fill(false);

      this.activeBulletComments = [];
      this.lastAnimeTime = null;
      this.lastSec = null;
      this.triggeredComments = {};


      let sessionService = this.get('session');

      sessionService.fetchUsernameFromSession()
        .then((username) => {
          console.log("Logged-in username:", username);
          if (!username) {
            console.error("Missing username! Cannot fetch like status.");
            return;
          }
          this.set("currentUsername", username);
          this.fetchLikeStatus();
        })
        .catch((error) => {
          console.error("Session error:", error);
        });

      Ember.run.scheduleOnce('afterRender', this, function () {
        this.setupVideoPlayer();
        this.setupVideoDuration();
        this.setUpCommentMove();

        Ember.$('.comments-section').on('click', '.timestamp', (event) => {
          this.send('handleTimeClick', event);
        });

        requestAnimationFrame(this.animateBulletComments.bind(this));

        this.commentInterval = setInterval(() => {
          this.showComments();
        }, 100);
      });
    },

    modelObserver: Ember.observer('model', function () {
      let fileName = this.get('model.fileName');
      if (!fileName || fileName.trim() === "null") {
        console.warn("Skipping like status fetch: Invalid file name.");
        return;
      }
    }),

    setUpCommentMove() {
      const videoElement = document.getElementById("videoPlayer");
      if (!videoElement) {
        console.error("Video player not found.");
        return;
      }

      videoElement.addEventListener("loadeddata", () => {
        this.send("viewComments");
      });

      videoElement.addEventListener("pause", () => {
        const bullets = document.querySelectorAll(".bullet-comment");
        bullets.forEach(bullet => {
          bullet.style.animationPlayState = "paused";
        });
      });

      videoElement.addEventListener("play", () => {
        const bullets = document.querySelectorAll(".bullet-comment");
        bullets.forEach(bullet => {
          bullet.style.animationPlayState = "running";
        });
        this.previousTime = Math.floor(videoElement.currentTime);
      });
    },


    showComments() {
      const videoElement = document.getElementById("videoPlayer");
      if (!videoElement) { return; }

      const currentSec = Math.floor(videoElement.currentTime);

      if (this.lastSec === undefined || this.lastSec !== currentSec) {
        this.triggeredComments = {};
        this.lastSec = currentSec;
      }

      const videoContainer = document.querySelector(".video-container");
      if (!videoContainer) { return; }

      const containerWidth = videoContainer.offsetWidth;

      const comments = this.get("comments") || [];

      comments.forEach(comment => {
        const timeParts = comment.videoTime.split(":").map(Number);

        let commentSec;

        if (timeParts.length === 3) {
          commentSec = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          commentSec = timeParts[0] * 60 + timeParts[1];
        }

        const key = commentSec + "_" + comment.username + "_" + comment.commentText;

        if (commentSec === currentSec && !this.triggeredComments[key]) {
          this.triggeredComments[key] = true;

          const bullet = document.createElement("div");

          bullet.className = "bullet-comment";
          bullet.textContent = `@${comment.username}: ${comment.commentText}`;
          bullet.style.position = "absolute";

          videoContainer.appendChild(bullet);
          const bulletWidth = bullet.offsetWidth;

          bullet.style.transform = `translateX(${containerWidth}px)`;

          const laneInfo = this.getAvailableLane();
          bullet.style.top = laneInfo.top + "px";

          const bulletObj = {
            el: bullet,
            bulletWidth: bulletWidth,
            currentX: containerWidth,
            baseSpeed: 200
          };

          this.activeBulletComments.push(bulletObj);
        }
      });
    },


    animateBulletComments(timestamp) {
      if (!this.lastAnimeTime) {
        this.lastAnimeTime = timestamp;
      }
      let dt = timestamp - this.lastAnimeTime;
      this.lastAnimeTime = timestamp;

      const videoElement = document.getElementById("videoPlayer");

      if (videoElement && videoElement.paused) {
        dt = 0;
      }

      if (this.isRewind) {
        dt = 0;
        const loader = document.querySelector('.circleLoader');
        if (loader) {
          loader.style.display = 'none';
        }
      }

      const playbackRate = videoElement ? videoElement.playbackRate : 1;


      this.activeBulletComments = this.activeBulletComments.filter((bullet) => {
        bullet.currentX -= bullet.baseSpeed * playbackRate * (dt / 1000);
        bullet.el.style.transform = `translateX(${bullet.currentX}px)`;
        if (bullet.currentX < -bullet.bulletWidth) {
          bullet.el.remove();
          return false;
        }
        return true;
      });

      requestAnimationFrame(this.animateBulletComments.bind(this));
    },



    getAvailableLane() {
      const container = document.querySelector(".video-container");
      const containerHeight = container ? container.offsetHeight : 400;
      const effectiveHeight = containerHeight * 0.3;
      const laneHeight = effectiveHeight / this.laneCount;

      const availableLanes = [];
      for (let i = 0; i < this.laneCount; i++) {
        if (!this.activeLanes[i]) {
          availableLanes.push(i);
        }
      }

      let chosenLane;
      if (availableLanes.length > 0) {
        chosenLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        this.activeLanes[chosenLane] = true;
        setTimeout(() => {
          this.activeLanes[chosenLane] = false;
        }, 5000);
      } else {
        chosenLane = Math.floor(Math.random() * this.laneCount);
      }

      const top = chosenLane * laneHeight;
      return { laneIndex: chosenLane, top: top };
    },


    startCommentMove() {
      const videoElement = document.getElementById("videoPlayer");
      if (!videoElement) { return; }
      clearInterval(this.commentInterval);
      this.commentInterval = setInterval(() => {
        this.showComments();
      }, 100);
    },



    fetchLikeStatus() {
      let mediaId = this.get('model.id');
      let username = this.get('session.user');

      console.log("media :"+mediaId +" "+"username:"+username);
      if (!mediaId || !username) {
        console.error("Missing mediaId or username.");
        return;
      }

      Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}`, { mediaId, username })
        .then((response) => {
          console.log("Fetched like status:", response);

          this.set('isLiked', response.userLikeStatus === 1);
          this.set('isDisliked', response.userLikeStatus === -1);
          this.set('likeCount', response.likeCount || 0);
          this.set('dislikeCount', response.dislikeCount || 0);
        })
        .fail((xhr) => {
          console.error("Error fetching like status:", xhr.responseText);
        });
    },

    detectTime(comment) {
      let regex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
      return comment.replace(regex, (match) => {
        return `<span class="timestamp" style="color: blue; text-decoration: underline; cursor: pointer;" data-time="${match}">${match}</span>`;
      });
    },


    formatRelativeTime(timestamp) {
      let time = new Date(timestamp);
      if (isNaN(time)) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid Date";
      }
      let now = new Date();
      let diff = Math.floor((now - time) / 1000);

      if (diff < 60) {
        return "just now";
      }
      if (diff < 3600) {
        return `${Math.floor(diff / 60)} minutes ago`;
      }
      if (diff < 86400) {
        return `${Math.floor(diff / 3600)} hours ago`;
      }
      if (diff < 604800) {
        return `${Math.floor(diff / 86400)} days ago`;
      }

      return time.toLocaleString();
    },


    actions: {
        likeVideo() {
          let isLiked = this.get('isLiked');
          let newStatus = isLiked ? 0 : 1;
          this.send('updateLikeStatus', newStatus);
        },

        dislikeVideo() {
          let isDisliked = this.get('isDisliked');
          let newStatus = isDisliked ? 0 : -1;
          this.send('updateLikeStatus', newStatus);
        },

      updateLikeStatus(status) {
        let mediaId = this.get('model.id');
        let username = this.get('session.user');


        if (!mediaId || !username) {
          console.error("Missing mediaId or username.");
          return;
        }
        console.log("Updating like status:", { mediaId, username, status });
        Ember.$.ajax({
          url: `${AppConfig.VideoServlet_API_URL}`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ mediaId, username, likeStatus: status }),
          success: (response) => {
            console.log("Like status updated successfully:", response);

            let alreadyLiked = this.get('isLiked');
            let alreadyDisLiked = this.get('isDisliked');

            if (status === 1) {
              this.set('isLiked', true);
              this.set('isDisliked', false);

              if (!alreadyLiked) {
                this.set('likeCount', (this.get('likeCount') || 0) + 1);
              }

              if (alreadyDisLiked) {
                this.set('dislikeCount', Math.max((this.get('dislikeCount') || 0) - 1, 0));
              }
            }
            else if (status === -1) {
              this.set('isLiked', false);
              this.set('isDisliked', true);

              if (!alreadyDisLiked) {
                this.set('dislikeCount', (this.get('dislikeCount') || 0) + 1);
              }

              if (alreadyLiked) {
                this.set('likeCount', Math.max((this.get('likeCount') || 0) - 1, 0));
              }
            }
            else {
              if (alreadyLiked) {
                this.set('likeCount', Math.max((this.get('likeCount') || 0) - 1, 0));
              }
              if (alreadyDisLiked) {
                this.set('dislikeCount', Math.max((this.get('dislikeCount') || 0) - 1, 0));
              }
              this.set('isLiked', false);
              this.set('isDisliked', false);
            }
            this.notifyPropertyChange('likeCount');
            this.notifyPropertyChange('dislikeCount');
          },
          error: (jqXHR) => {
            console.error("Error updating like status:", jqXHR.responseText);
          }
        });
      },


      handleTimeClick(event) {
        let clickedElement = event && event.target;
        if (clickedElement && clickedElement.dataset.time) {
          let timestampText = clickedElement.dataset.time;
          let timeParts = timestampText.split(":").map(Number);

          let seconds = timeParts.length === 3 ? timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
            : timeParts[0] * 60 + timeParts[1];

          let videoElement = document.getElementById("videoPlayer");
          if (videoElement) {
            videoElement.currentTime = seconds;
            videoElement.play();
          }
        }
      },

      moveToVideoTime(videoTime) {
        if (!videoTime) {
          console.error("Invalid times clicked.");
          return;
        }

        let timeParts = videoTime.split(":").map(Number);
        let seconds = 0;

        if (timeParts.length === 3) {
          seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else if (timeParts.length === 2) {
          seconds = timeParts[0] * 60 + timeParts[1];
        }

        let videoElement = document.getElementById("videoPlayer");
        if (videoElement) {
          videoElement.currentTime = seconds;
          videoElement.play();
        } else {
          console.error("Video player not found.");
        }
      },


      postComment() {
        let mediaId = this.get('model.id');
        let username = this.get('session.user');
        let videoElement = document.getElementById("videoPlayer");

        if (!videoElement) {
          alert("Video player not found.");
          return;
        }

        let currentTime = videoElement.currentTime;
        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        let commentText = $("#commentText").val().trim();

        if (!commentText) {
          alert("Comment cannot be empty!");
          return;
        }

        let newComment = {
          commentId: Date.now(),
          userId: this.get('currentUserId'),
          username: username,
          commentText: commentText,
          videoTime: formattedTime,
          relativeTime: "just now"
        };

        Ember.$.ajax({
          url: AppConfig.CommentServlet_API_URL,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            mediaId: mediaId,
            username: username,
            comment: commentText,
            videoTime: formattedTime
          }),

          success: () => {
            this.set('commentStatusMessage', 'Comment posted successfully!');
            $("#commentText").val('');

            let comments = this.get('comments');
            comments.pushObject(newComment);
            this.notifyPropertyChange('comments');

            this.showComments(Math.floor(currentTime));

            Ember.run.later(this, function () {
              this.set('commentStatusMessage', null);
            }, 3000);
          },

          error: (jqXHR, textStatus, errorThrown) => {
            console.error("Failed to post comment", {
              status: jqXHR.status,
              statusText: textStatus,
              error: errorThrown,
              response: jqXHR.responseText
            });

            this.set('commentStatusMessage', 'Failed to post comment. Please try again later.');
            Ember.run.later(this, function () {
              this.set('commentStatusMessage', null);
            }, 3000);
          }
        });
      },



      viewComments() {
        let videoId = this.get('model.id');

        Ember.$.ajax({
          url: `${AppConfig.CommentServlet_API_URL}?mediaId=${encodeURIComponent(videoId)}`,
          type: "GET",
          dataType: "json",
          success: (data) => {
            console.log("Fetched comments:", data);

            let processedComments = data.map(comment => ({
              commentId: comment.comment_id,
              userId: comment.user_id,
              commentText: comment.comment_text,
              videoTime: comment.video_time,
              username: comment.username,
              relativeTime: this.formatRelativeTime(new Date(comment.created_at))
            }));

            this.set('comments', processedComments);
          },
          error: (err) => {
            console.error("Failed to fetch comments", err);
            this.set('comments', []);
          }
        });
      },



      editComment(comment) {

        let updatedText = prompt("Edit your comment:", comment.commentText);

        if (!updatedText || updatedText.trim() === "" || updatedText.trim() === comment.commentText) {
          return;
        }
        Ember.$.ajax({
          url: AppConfig.CommentServlet_API_URL,
          type: "PUT",
          contentType: "application/json",
          data: JSON.stringify({
            commentId: comment.commentId,
            username: this.get('session.user'),
            comment: updatedText.trim()
          }),
          success: () => {
            alert("Comment updated successfully!");

            this.send("viewComments");
          },
          error: (jqXHR, _textStatus, _errorThrown) => {
            console.error("Failed to post comment", {
              status: jqXHR.status,
              textStatus: _textStatus,
              error: _errorThrown,
              response: jqXHR.responseText
            });
            this.set('commentStatusMessage', 'Failed to post comment. Please try again later.');
            Ember.run.later(this, function() {
              this.set('commentStatusMessage', null);
            }, 3000);
          }

        });
      },

      deleteComment(comment) {
        let username = this.get('session.user');


        if (!username) {
          console.error("Username not found in session.");
          alert("User not logged in.");
          return;
        }

        console.log("Deleting comment with ID:", comment.commentId, "by user:", username);

        if (confirm("Are you sure you want to delete this comment?")) {
          Ember.$.ajax({
            url: `${AppConfig.CommentServlet_API_URL}?commentId=${comment.commentId}&username=${username}`,
            type: "DELETE",
            success: () => {
              alert("Comment deleted successfully!");
              this.send("viewComments");
            },
            error: (jqXHR) => {
              console.error("Failed to delete comment", {
                status: jqXHR.status,
                response: jqXHR.responseText
              });
              alert("Failed to delete comment. Please try again later.");
            }
          });
        }
      }


    }
  }
);
