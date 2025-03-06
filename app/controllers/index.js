import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
  searchQuery: '',

  init() {
    this._super(...arguments);
    this.send('fetchAllVideos'); // 🔥 Fetch videos when the page loads
  },

  actions: {
    searchVideos() {
      let query = this.get('searchQuery').trim();

      if (!query) {
        console.log("No search query, fetching all videos...");
        this.send('fetchAllVideos');
        return;
      }

      $.ajax({
        url: `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?search=${encodeURIComponent(query)}`,
        type: 'GET',
        dataType: 'json',
        success: (data) => {
          console.log("Search results:", data);
          this.set('model', data);
        },
        error: (err) => {
          console.error("Search request failed", err);
          this.set('model', []);
        }
      });
    },

    fetchAllVideos() {
      console.log("Fetching all videos and playlists...");
      $.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/VideoServlet",
        type: "GET",
        dataType: "json",
        success: (data) => {
          console.log("All videos loaded:", data);
          this.set("model", data);
        },
        error: (err) => {
          console.error("Failed to fetch videos", err);
          this.set("model", []);
        }
      });
    }
  }
});
