import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  model() {
    return $.getJSON('http://localhost:8080/VideoPlayer_war_exploded/VideoServlet');
  }
});
