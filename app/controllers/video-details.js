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

    init() {
      this._super(...arguments);
      Ember.run.scheduleOnce('afterRender', this, function () {
        this.setupVideoPlayer();
        this.setupVideoDuration();
        Ember.$('.comments-section').on('click', '.timestamp', (event) => {
          this.send('handleTimeClick', event);
        });
      });
    },

    modelObserver: Ember.observer('model', function () {
      let fileName = this.get('model.fileName');

      if (!fileName || fileName.trim() === "null") {
        console.warn("Skipping like status fetch: Invalid file name.");
        return;
      }

      this.fetchLikeStatus();
      // this.fetchComments();
    }),

    fetchLikeStatus() {
      let fileName = this.get('model.fileName');

      console.log("Fetching like status for:", fileName);

      Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}?video=${encodeURIComponent(fileName)}&likeStatus=1`)
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

    actions: {

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
          let videoElement = document.getElementById("videoPlayer");
          if (videoElement) {
            videoElement.currentTime = seconds;
            videoElement.play();
          }
        }
      },

      postComment() {
        let videoId = this.get('model.id');
        let commentText = $("#commentText").val().trim();

        if (!commentText) {
          alert("Comment cannot be empty!");
          return;
        }

        Ember.$.ajax({
          url: AppConfig.CommentServlet_API_URL,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({mediaId: videoId, comment: commentText}),
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
            let processedComments = data.map(comment => {
              return {
                commentId: comment.commentId,  // Ensure commentId is set from the server
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
    }
  }
);
