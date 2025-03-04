import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
  searchQuery: '',

  actions: {
    searchContent() {
      let query = this.get('searchQuery').trim();
      if (!query) {
        this.send('fetchAllContent');
        return;
      }

      $.when(
        $.ajax({
          url: `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?search=${encodeURIComponent(query)}`,
          type: 'GET',
          dataType: 'json'
        }),
        $.ajax({
          url: `http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet?search=${encodeURIComponent(query)}`,
          type: 'GET',
          dataType: 'json'
        })
      ).done((videoData, playlistData) => {
        this.set('model.videos', videoData[0]);
        this.set('model.playlists', playlistData[0]);
      }).fail((err) => {
        console.error("Search request failed", err);
        this.set('model.videos', []);
        this.set('model.playlists', []);
      });
    },

    fetchAllContent() {
      $.when(
        $.ajax({
          url: "http://localhost:8080/VideoPlayer_war_exploded/VideoServlet",
          type: "GET",
          dataType: "json"
        }),
        $.ajax({
          url: "http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet",
          type: "GET",
          dataType: "json"
        })
      ).done((videoData, playlistData) => {
        this.set('model.videos', videoData[0]);
        this.set('model.playlists', playlistData[0]);
      }).fail((err) => {
        console.error("Failed to fetch content", err);
        this.set('model.videos', []);
        this.set('model.playlists', []);
      });
    }
  }
});

