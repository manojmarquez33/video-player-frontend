import Ember from 'ember';
import $ from 'jquery';
import AppConfig from "../config/app-config";

export default Ember.Controller.extend({
  searchQuery: '',

  init() {
    this._super(...arguments);
    this.send('fetchAllVideos');
    let storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.set('username', storedUsername);
    }
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
        url: `${AppConfig.VideoServlet_API_URL}?search=${encodeURIComponent(query)}`,
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
        url: `${AppConfig.VideoServlet_API_URL}`,
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
