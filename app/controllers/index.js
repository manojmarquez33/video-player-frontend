
import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
  searchQuery: '',

  actions: {
    searchVideos() {
      let query = this.get('searchQuery').trim();

      // if (!query) {
      //   this.set('model', this.store.findAll('video'));
      //   return;
      // }
      //

      if (!query) {
        console.log("no search so, fetching all videos...");
        this.send('fetchAllVideos');
        return;
      }


      $.ajax({
        url: `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?search=${encodeURIComponent(query)}`,
        type: 'GET',
        dataType: 'json',
        success: (data) => {
          //console.log("Search results:", data);
          this.set('model', data);
        },
        error: (err) => {
          console.error("Search request fail", err);
          this.set('model', []);
        }
      });
    },

    fetchAllVideos() {
      //console.log("all videos...");
      $.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/VideoServlet",
        type: "GET",
        dataType: "json",
        success: (data) => {
          //console.log("All videos loaded:", data);
          this.set("model", data);
        },
        error: (err) => {
          console.error("Fail to fetch videos", err);
          this.set("model", []);
        }
      });
    }
  }
});
