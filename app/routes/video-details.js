import Ember from 'ember';
import AppConfig from "../config/app-config";

export default Ember.Route.extend({
  session: Ember.inject.service(),

  beforeModel() {
    return this.get('session').fetchUsernameFromSession().then(function (username) {
      if (!username) {
        alert("You are not logged in.");
        this.transitionTo("login");
      }
    }.bind(this))
      .catch(function () {
        alert("You are not logged in.");
        this.transitionTo("login");
      }.bind(this));
  },

  model(params) {
    console.log("Fetching video details for:", params.video_name);

    return Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}?video=${encodeURIComponent(params.video_name)}&metadata=true`)
      .then(response => {
        console.log("Video details received:", response);
        return response;
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("Error fetching video details:", textStatus, errorThrown);
        return {};
      });
  }
});
