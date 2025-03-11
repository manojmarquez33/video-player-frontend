import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),

  beforeModel() {
    let sessionId = Ember.$.cookie("sessionId");

    if (!sessionId) {
      alert('You are not logged in.');
      this.transitionTo('login');
    }
  },

  model() {
    return Ember.$.getJSON('http://localhost:8080/VideoPlayer_war_exploded/VideoServlet');
  }
});
