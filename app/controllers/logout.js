import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  actions: {
    logout() {
      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/logout",
        type: "GET",
        xhrFields: { withCredentials: true },
      }).done(() => {
        console.log("User logged out.");
        this.get('session').logout();
      }).fail(() => {
        alert("Logout failed. Please try again.");
      });
    }
  }
});
