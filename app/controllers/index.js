import Ember from 'ember';
import $ from 'jquery';
import AppConfig from "../config/app-config";

export default Ember.Controller.extend({
  searchQuery: '',
  session: Ember.inject.service(),

  actions: {
    searchVideos() {
      let query = this.get("searchQuery").trim();
      let sessionService = this.get("session");

      if (!query) {
        console.log("No search query, fetching all videos...");
        this.send("fetchAllVideos");
        return;
      }

      sessionService.fetchUsernameFromSession()
        .then((username) => {
          if (!username) {
            console.error("Missing username! Redirecting to login.");
            this.transitionToRoute("login");
            return;
          }

          $.ajax({
            url: `${AppConfig.VideoServlet_API_URL}?username=${encodeURIComponent(username)}&search=${encodeURIComponent(query)}`,
            type: "GET",
            dataType: "json",
            success: (data) => {
              console.log("Search results:", data);


              let allRecommended = this.get("model.recommendedVideos") || [];
             // let allOther = this.get("model.otherVideos") || [];


              let newRecommended = [];
              let newOther = [];

              data.forEach(video => {
                if (allRecommended.some(v => v.id === video.id)) {
                  newRecommended.push(video);
                } else {
                  newOther.push(video);
                }
              });

              this.set("model.recommendedVideos", newRecommended);
              this.set("model.otherVideos", newOther);
            },
            error: (err) => {
              console.error("Search request failed", err);
              this.set("model.recommendedVideos", []);
              this.set("model.otherVideos", []);
            }
          });
        })
        .catch((error) => {
          console.error("Session error:", error);
          this.transitionToRoute("login");
        });
    },

    fetchAllVideos() {
      let sessionService = this.get("session");

      sessionService.fetchUsernameFromSession()
        .then((username) => {
          console.log("Fetching videos for user:", username);

          if (!username) {
            console.error("Missing username! Redirecting to login.");
            this.transitionToRoute("login");
            return;
          }

          $.ajax({
            url: `${AppConfig.VideoServlet_API_URL}?username=${encodeURIComponent(username)}`,
            type: "GET",
            dataType: "json",
            success: (data) => {
              console.log("All videos loaded:", data);
              this.set("model", data);
              //this.send("fetchThumbnails", data);
            },
            error: (err) => {
              console.error("Failed to fetch videos", err);
              this.set("model", []);
            }
          });
        })
        .catch((error) => {
          console.error("Session error:", error);
          this.transitionToRoute("login");
        });
    },

  }
});
