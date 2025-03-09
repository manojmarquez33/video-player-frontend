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
      console.log("Waiting for model to be set...");
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
      postComment() {
        let playlistId = this.get('model.id'); // Use ID
        let commentText = $("#commentText").val().trim();

        if (!commentText) {
          alert("Comment cannot be empty!");
          return;
        }

        $.ajax({
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
        let playlistId = this.get('model.id'); // Use ID

        $.ajax({
          url: `${AppConfig.CommentServlet_API_URL}?mediaId=${encodeURIComponent(playlistId)}`,
          type: "GET",
          dataType: "json",
          success: (data) => {
            this.set('comments', data);
          },
          error: (err) => {
            console.error("Failed to fetch comments", err);
            this.set('comments', []);
          }
        });
      }
    },

  }
);
