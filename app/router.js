import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route('video-details', { path: '/video-details/:video_name' });
});



export default Router;
