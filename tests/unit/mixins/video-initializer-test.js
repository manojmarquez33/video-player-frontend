import Ember from 'ember';
import VideoInitializerMixin from '../../../mixins/video-initializer';
import { module, test } from 'qunit';

module('Unit | Mixin | video initializer');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoInitializerObject = Ember.Object.extend(VideoInitializerMixin);
  let subject = VideoInitializerObject.create();
  assert.ok(subject);
});
