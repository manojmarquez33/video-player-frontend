import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  actions: {
    logout() {
      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/logout",
        type: "GET",
        success: () => {
          this.get('session').logout();
          this.transitionToRoute('login');
        },
        error: () => {
          alert("Logout failed. Please try again.");
        }
      });
    }
  }
});
