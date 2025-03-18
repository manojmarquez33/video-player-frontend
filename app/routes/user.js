import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),

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

        let url = `http://localhost:8080/VideoPlayer_war_exploded/user-profile`;

        return Ember.$.ajax({
          url: url,
          method: "GET",
          xhrFields: { withCredentials: true },
          dataType: "json",
        })
          .then(response => {
            console.log("Fetched user details:", response);
            return response;
          })
          .fail(error => {
            console.error("Error fetching user details:", error);
            alert("Failed to fetch user details. Please try again.");
            this.transitionTo("login");
          })
      })
      .catch((error) => {
        console.error("Session error:", error);
        alert("Session issue. Please log in again.");
        this.transitionTo("login");
      });
  }
});
