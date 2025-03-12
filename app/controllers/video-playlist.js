// video-playlist.js
import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';
import PlaylistProcess from "../mixins/playlist-process";
import AppConfig from "../config/app-config";
import $ from 'jquery';

export default Ember.Controller.extend(
  VideoInitializer,
  PlaylistProcess,
  VideoController,
  VideoProcess,
  ZoomDrag,
  VideoUtils,
  {
    isPlayList: true,
    videoList: [],
    currentVideoIndex: 0,
    totalDuration: 0,
    videoDurations: [],
    isSeeking: false,

    selectedSpeed: 1,
    isPlaying: false,
    videoElement: null,
    intervalRewind: null,
    intervalForward: null,
    isLiked: false,
    isDisliked: false,
    newComment: "",
    comments: [],
    commentStatusMessage: null,

    session: Ember.inject.service(),

    // init() {
    //   this._super(...arguments);
    //
    //   Ember.run.scheduleOnce('afterRender', this, function () {
    //
    //     this.setupVideoPlayer();
    //
    //     this.setupVideoDuration();
    //
    //     let storedUsername = this.get('session.user');
    //     console.log("Logged-in username:", storedUsername);
    //
    //     this.set("currentUsername", storedUsername);
    //    // this.setupVideoDuration();
    //     Ember.$('.comments-section').on('click', '.timestamp', (event) => {
    //       this.send('handleTimeClick', event);
    //     });
    //   });
    // },

    init() {
      this._super(...arguments);

      let sessionService = this.get('session');

      sessionService.fetchUsernameFromSession().then((username) => {
        console.log("Logged-in username:", username);

        if (!username) {
          console.error("Missing username! Cannot fetch like status.");
          return;
        }

        this.set("currentUsername", username);
        this.fetchLikeStatus();
      }).catch((error) => {
        console.error("Session error:", error);
      });

      Ember.run.scheduleOnce('afterRender', this, function () {
        this.setupVideoPlayer();
        //this.setupVideoDuration();
        Ember.$('.comments-section').on('click', '.timestamp', (event) => {
          this.send('handleTimeClick', event);
        });
      });
    },
    modelObserver: Ember.observer('model', function() {
      let playlistName = this.get('model.playlistName');
      console.log("Playlist Model is now set! Playlist name:", playlistName);

      if (!playlistName || playlistName.trim() === "null") {
        console.warn("Skipping like status fetch: Invalid playlist name.");
        return;
      }

      //this.fetchLikeStatus(playlistName);
    }),

    fetchLikeStatus() {
      let mediaId = this.get('model.id');
      let username = this.get('session.user');

      if (!mediaId || !username) {
        console.error("Missing mediaId or username");
        return;
      }

      Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet`, {
        mediaId: mediaId,
        username: username
      }).then(response => {
        console.log("Like status:", response);
        this.set('likeStatus', response.likeStatus);
        if (response.likeStatus === 1) {
          this.set('isLiked', true);
          this.set('isDisliked', false);
        } else if (response.likeStatus === -1) {
          this.set('isLiked', false);
          this.set('isDisliked', true);
        } else {
          this.set('isLiked', false);
          this.set('isDisliked', false);
        }
      }).fail((xhr) => {
        console.error("Error fetching like status:", xhr.responseText);
      });
    },

    detectTime(comment) {
      let regex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
      return comment.replace(regex, (match) => {
        return `<span class="timestamp" style="color: blue; cursor: pointer;" data-time="${match}">${match}</span>`;
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

    fetchComments() {
      let playlistId = this.get('model.id');

      if (!playlistId) {
        console.warn("Skipping comment fetch: Invalid playlist ID.");
        return;
      }

      Ember.$.ajax({
        url: `${AppConfig.CommentServlet_API_URL}?mediaId=${encodeURIComponent(playlistId)}&getComments=true`,
        type: "GET",
        success: (response) => {
          this.set("comments", response);
        },
        error: () => console.error("Failed to fetch comments"),
      });
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
        if (clickedElement && clickedElement.classList.contains("timestamp")) {
          let timestampText = clickedElement.dataset.time;
          let timeParts = timestampText.split(":").map(Number);

          let seconds;
          if (timeParts.length === 3) {
            seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          } else {
            seconds = timeParts[0] * 60 + timeParts[1];
          }

          console.log(`Timestamp clicked: ${timestampText} (${seconds}s)`);

          this.send('seekVideo', seconds);
        }
      },

      postComment() {
        let mediaId = this.get('model.id');
        let username = this.get('session.user');

        let commentText = $("#commentText").val().trim();

        if (!commentText) {
          alert("Comment cannot be empty!");
          return;
        }

        Ember.$.ajax({
          url: AppConfig.CommentServlet_API_URL,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({mediaId: mediaId, username:username, comment: commentText}),
          success: () => {
            this.set('commentStatusMessage', 'Comment posted successfully!');
            $("#commentText").val('');
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

            this.set('comments', []);

            let processedComments = data.map(comment => {
              return {
                commentId: comment.comment_id,
                userId: comment.user_id,
                commentText: comment.comment_text,
                username: comment.username,
                relativeTime: this.formatRelativeTime(new Date(comment.created_at))
              };
            });

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
            username: localStorage.getItem("username"),
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
          console.error("Username not found in localStorage.");
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
    },

  }
);
