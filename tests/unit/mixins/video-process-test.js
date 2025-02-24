import Ember from 'ember';
import VideoProcessMixin from '../../../mixins/video-process';
import { module, test } from 'qunit';

module('Unit | Mixin | video process');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoProcessObject = Ember.Object.extend(VideoProcessMixin);
  let subject = VideoProcessObject.create();
  assert.ok(subject);
});
