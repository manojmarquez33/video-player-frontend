import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      playlists: Ember.$.getJSON('http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet'),
      videos: Ember.$.getJSON('http://localhost:8080/VideoPlayer_war_exploded/VideoServlet')

    });
  }
});
