import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';

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

    init() {
      this._super(...arguments);
      Ember.run.scheduleOnce('afterRender', this, this.setupVideoPlayer);
    },

    modelObserver: Ember.observer('model', function() {
      let fileName = this.get('model.fileName');

      if (!fileName || fileName.trim() === "null") {
        console.warn("Skipping like status fetch: Invalid file name.");
        return;
      }

      this.fetchLikeStatus();
      this.fetchComments(); // Fetch comments when model changes
    }),

    fetchLikeStatus() {
      let fileName = this.get('model.fileName');

      console.log("🔄 Fetching like status for:", fileName);

      Ember.$.getJSON(`http://localhost:8080/VideoServlet?video=${encodeURIComponent(fileName)}&likeStatus=1`)
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
          console.error("❌ Error fetching like status:", errorThrown);
        });
    },

    fetchComments() {
      let fileName = this.get('model.fileName');

      if (!fileName || fileName.trim() === "null") {
        console.warn("Skipping comment fetch: Invalid file name.");
        return;
      }

      Ember.$.ajax({
        url: `http://localhost:8080/VideoServlet?video=${encodeURIComponent(fileName)}&getComments=true`,
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
        let fileName = this.get("model.fileName");

        if (!commentText.trim()) {
          alert("Comment cannot be empty!");
          return;
        }

        Ember.$.ajax({
          url: "http://localhost:8080/VideoServlet",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({ video: fileName, comment_text: commentText, addComment: true }),
          success: () => {
            alert("✅ Comment added successfully!");
            this.set("newComment", ""); // Clear input field
            this.fetchComments(); // Refresh comments list
          },
          error: () => alert("❌ Failed to add comment."),
        });
      }
    }
  }
);
