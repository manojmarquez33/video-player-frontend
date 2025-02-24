import Ember from 'ember';
import VideoControllerMixin from '../../../mixins/video-controller';
import { module, test } from 'qunit';

module('Unit | Mixin | video controller');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoControllerObject = Ember.Object.extend(VideoControllerMixin);
  let subject = VideoControllerObject.create();
  assert.ok(subject);
});
