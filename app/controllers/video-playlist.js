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

    init() {
      this._super(...arguments);
      Ember.run.scheduleOnce('afterRender', this, this.setupVideoPlayer);
      Ember.$(document).on('click', '.timestamp', (event) => {
        this.send('handleTimeClick', event);
      });
    },

    modelObserver: Ember.observer('model', function() {
      let playlistName = this.get('model.playlistName');
      console.log("Playlist Model is now set! Playlist name:", playlistName);

      if (!playlistName || playlistName.trim() === "null") {
        console.warn("Skipping like status fetch: Invalid playlist name.");
        return;
      }

      this.fetchLikeStatus(playlistName);
    }),

    fetchLikeStatus(playlistName) {
      console.log("Fetching like status for playlist:", playlistName);

      Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}?video=${encodeURIComponent(playlistName)}&likeStatus=1`)
        .then(response => {
          console.log("Like status response:", response);
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
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          console.error("Error fetching like status:", errorThrown);
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

      return time.toLocaleDateString();
    },
    fetchComments() {
      let playlistId = this.get('model.playlistId');

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

      handleTimeClick(event) {
        let clickedElement = event && event.target;
        if (!clickedElement || !clickedElement.classList.contains("timestamp")) {
          return;
        }

        let timestampText = clickedElement.dataset.time;
        let timeParts = timestampText.split(":").map(Number);
        let seekTime;

        if (timeParts.length === 3) {
          seekTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          seekTime = timeParts[0] * 60 + timeParts[1];
        }

        console.log(`Timestamp clicked: Seeking to ${seekTime}s`);
        this.seekVideo(seekTime);
      },

      postComment() {
        let playlistId = this.get('model.playlistId');
        let commentText = $("#commentText").val().trim();

        if (!commentText) {
          alert("Comment cannot be empty!");
          return;
        }

        Ember.$.ajax({
          url: AppConfig.CommentServlet_API_URL,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ mediaId: playlistId, comment: commentText }),
          success: () => {
            this.set('commentStatusMessage', 'Comment posted successfully!');
            $("#commentText").val('');
            Ember.run.later(this, function() {
              this.set('commentStatusMessage', null);
            }, 3000);
          },
          error: (err) => {
            console.error("Failed to post comment", err);
          }
        });
      },

      viewComments() {
        let playlistId = this.get('model.playlistId');

        $.ajax({
          url: `${AppConfig.CommentServlet_API_URL}?mediaId=${encodeURIComponent(playlistId)}`,
          type: "GET",
          dataType: "json",
          success: (data) => {
            console.log("Fetched comments:", data);
            let processedComments = data.map(comment => {
              return {
                commentId: comment.commentId,
                commentText: this.detectTime(comment.commentText),
                relativeTime: this.formatRelativeTime(comment.createdAt)
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
        if (confirm("Are you sure you want to delete this comment?")) {
          Ember.$.ajax({
            url: `${AppConfig.CommentServlet_API_URL}?commentId=${comment.commentId}`,
            type: "DELETE",
            success: () => {
              alert("Comment deleted successfully!");
              this.send("viewComments");
            },
            error: (jqXHR) => {
              console.error("Failed to post comment", {
                status: jqXHR.status,
                response: jqXHR.responseText
              });
              this.set('commentStatusMessage', 'Failed to post comment. Please try again later.');
              Ember.run.later(this, function() {
                this.set('commentStatusMessage', null);
              }, 3000);
            }

          });
        }
      }
    },

  }
);
