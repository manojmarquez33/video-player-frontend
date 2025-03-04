import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
  searchQuery: '',
  isVideoTab: true,
  isPlaylistTab: false,

  actions: {
    showVideos() {
      this.set('isVideoTab', true);
      this.set('isPlaylistTab', false);
      this.send('fetchAllVideos');
    },

    showPlaylists() {
      this.set('isVideoTab', false);
      this.set('isPlaylistTab', true);
      this.send('fetchAllPlaylists');
    },

    searchVideos() {
      let query = this.get('searchQuery').trim();
      if (!query) {
        this.get('isVideoTab') ? this.send('fetchAllVideos') : this.send('fetchAllPlaylists');
        return;
      }

      let apiUrl = this.get('isVideoTab')
        ? `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?search=${encodeURIComponent(query)}`
        : `http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet?search=${encodeURIComponent(query)}`;

      $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: (data) => {
          if (this.get('isVideoTab')) {
            this.set('model.videos', data);
          } else {
            this.set('model.playlists', data);
          }
        },
        error: (err) => {
          console.error("Search request failed", err);
          this.get('isVideoTab') ? this.set('model.videos', []) : this.set('model.playlists', []);
        }
      });
    },

    fetchAllVideos() {
      $.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/VideoServlet",
        type: "GET",
        dataType: "json",
        success: (data) => {
          this.set("model.videos", data);
        },
        error: (err) => {
          console.error("Failed to fetch videos", err);
          this.set("model.videos", []);
        }
      });
    },

    fetchAllPlaylists() {
      $.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet",
        type: "GET",
        dataType: "json",
        success: (data) => {
          this.set("model.playlists", data);
        },
        error: (err) => {
          console.error("Failed to fetch playlists", err);
          this.set("model.playlists", []);
        }
      });
    }
  }
});
