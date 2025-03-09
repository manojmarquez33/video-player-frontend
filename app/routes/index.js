import Ember from 'ember';
import $ from 'jquery';
import AppConfig from "../config/app-config";

export default Ember.Route.extend({
  model() {
    return $.getJSON(`${AppConfig.VideoServlet_API_URL}`);
  }
});
