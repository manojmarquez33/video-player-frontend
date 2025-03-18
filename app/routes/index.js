import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),

  beforeModel() {
    return this.get("session").fetchUsernameFromSession()
      .then(username => {
        console.log("Username from session service:", username);
        if (!username) {
          alert("You are not logged in.");
          this.transitionTo("login");
        }
      })
      .catch(error => {
        console.error("Error fetching session username:", error);
        alert("Session error. Please log in again.");
        this.transitionTo("login");
      });
  },

  model() {
    let sessionService = this.get("session");

    return sessionService.fetchUsernameFromSession()
      .then((username) => {
        console.log("Logged-in username:", username);

        if (!username) {
          console.error("Missing username! Redirecting to login.");
          this.transitionTo("login");
          return {};
        }

        let url = `http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?username=${encodeURIComponent(username)}`;
        console.log("Fetching videos from:", url);

        return Ember.$.getJSON(url)
          .then(response => {
            console.log("Fetched response:", response);

            if (!response || !Array.isArray(response.recommendedVideos) || !Array.isArray(response.otherVideos)) {
              throw new Error("Invalid JSON format");
            }

            let userInterests = response.userInterests || [];
            console.log("User interests from backend:", userInterests);
            sessionService.set("userInterests", userInterests);

            return {
              recommendedVideos: response.recommendedVideos,
              otherVideos: response.otherVideos,
            };
          })
          .fail(error => {
            console.error("Error fetching videos:", error);
            alert("Failed to fetch videos. Please try again.");
            return { recommendedVideos: [], otherVideos: [] };
          });

      })
      .catch((error) => {
        console.error("Session error:", error);
        alert("Session issue. Please log in again.");
        this.transitionTo("login");
      });
  }




});


