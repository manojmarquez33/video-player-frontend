import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),

  beforeModel() {
    return Ember.$.ajax({
      url: "http://localhost:8080/VideoPlayer_war_exploded/logout",
      type: "GET",
      xhrFields: { withCredentials: true },
    }).done(() => {
      console.log("User logged out. Redirecting to login.");
      this.get('session').logout();
      this.transitionTo('login');
    }).fail(() => {
      alert("Logout failed. Please try again.");
      this.transitionTo('index');
    });
  }
});





