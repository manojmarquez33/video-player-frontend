import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';
import PlaylistProcess from "../mixins/playlist-process";

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
      this.fetchComments(playlistName); // Fetch comments when model changes
    }),

    fetchLikeStatus(playlistName) {
      console.log("Fetching like status for playlist:", playlistName);

      Ember.$.getJSON(`http://localhost:8080/VideoServlet?video=${encodeURIComponent(playlistName)}&likeStatus=1`)
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

    fetchComments(playlistName) {
      if (!playlistName || playlistName.trim() === "null") {
        console.warn("Skipping comment fetch: Invalid playlist name.");
        return;
      }

      Ember.$.ajax({
        url: `http://localhost:8080/VideoServlet?video=${encodeURIComponent(playlistName)}&getComments=true`,
        type: "GET",
        success: (response) => {
          this.set("comments", response);
        },
        error: () => console.error("❌ Failed to fetch comments"),
      });
    },

    actions: {
      postComment() {
        let commentText = this.get("newComment");
        let playlistName = this.get("model.playlistName");

        if (!commentText.trim()) {
          alert("Comment cannot be empty!");
          return;
        }

        Ember.$.ajax({
          url: "http://localhost:8080/VideoServlet",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ video: playlistName, comment_text: commentText, addComment: true }),
          success: () => {
            alert("✅ Comment added successfully!");
            this.set("newComment", ""); // Clear input field
            this.fetchComments(playlistName); // Refresh comments list
          },
          error: () => alert("❌ Failed to add comment."),
        });
      }
    }
  }
);
